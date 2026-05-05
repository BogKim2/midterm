/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    sorisori?: {
      getDefaults: () => Promise<{ wsUrl: string; sessionId: string; sampleRate: number }>;
    };
  }
}

export {};

function log(msg: string) {
  const el = document.getElementById("log");
  if (!el) return;
  el.textContent = `${msg}\n${String(el.textContent ?? "").slice(0, 4000)}`;
}

function floatToMonoPcm16Base64(samples: Float32Array): string {
  const buf = new ArrayBuffer(samples.length * 2);
  const view = new DataView(buf);
  let o = 0;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    const v = s < 0 ? s * 0x8000 : s * 0x7fff;
    view.setInt16(o, v, true);
    o += 2;
  }
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
  return btoa(binary);
}

function buildWsUrl(base: string, sessionId: string) {
  const u = new URL(base);
  u.searchParams.set("sessionId", sessionId);
  return u.toString();
}

async function boot() {
  const defaults =
    typeof window !== "undefined" ? await window.sorisori?.getDefaults() : undefined;
  if (!defaults) {
    log("preload 실패: window.sorisori 가 없습니다");
    return;
  }

  const toggle = document.getElementById("toggle") as HTMLButtonElement | null;
  const status = document.getElementById("status") as HTMLDivElement | null;
  let running = false;
  let ws: WebSocket | null = null;

  let audioCtx: AudioContext | null = null;
  let mediaStream: MediaStream | null = null;
  let processor: ScriptProcessorNode | null = null;

  let seq = 1;

  const setStatus = (t: string) => {
    if (status) status.textContent = t;
  };

  const stop = async () => {
    running = false;
    toggle && (toggle.textContent = "시작");
    setStatus("정지됨");

    ws?.send(JSON.stringify({ type: "flush_audio", sessionId: defaults.sessionId }));
    ws?.close();
    ws = null;

    try {
      processor?.disconnect();
    } catch {
      //
    }

    processor = null;

    if (audioCtx) {
      try {
        await audioCtx.close();
      } catch {
        //
      }
    }

    audioCtx = null;

    mediaStream?.getTracks().forEach((t) => t.stop());
    mediaStream = null;
  };

  const start = async () => {
    setStatus("권한/장치 시작...");
    ws = new WebSocket(buildWsUrl(defaults.wsUrl, defaults.sessionId));

    ws.addEventListener("open", () => {
      ws!.send(JSON.stringify({ type: "hello", sessionId: defaults.sessionId, client: "desktop", sampleRate: defaults.sampleRate }));
      log(`WS 연결: ${defaults.wsUrl}`);
      setStatus("캡처 중");
    });

    ws.addEventListener("message", (ev) => {
      const raw =
        typeof ev.data === "string" ? ev.data : new TextDecoder().decode(ev.data as ArrayBuffer);
      // 서버 디버깅 필요 시 활성화
      if (raw.includes("\"type\":\"subtitle_segment\"")) {
        log("자막 세그먼트 수신(요약 표시 생략)");
      }
      if (raw.includes("\"type\":\"error\"")) {
        log(raw);
      }
    });

    await new Promise<void>((resolve, reject) => {
      if (!ws) return reject(new Error("no_ws"));
      const onOpen = () => {
        ws!.removeEventListener("open", onOpen);
        resolve();
      };
      const onErr = () => reject(new Error("ws_open_failed"));
      ws.addEventListener("open", onOpen);
      ws.addEventListener("error", onErr, { once: true });
    });

    audioCtx = new AudioContext({ sampleRate: defaults.sampleRate });
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
      video: false,
    });

    const src = audioCtx.createMediaStreamSource(mediaStream);

    processor = audioCtx.createScriptProcessor(4096, 1, 1);
    src.connect(processor);
    processor.connect(audioCtx.destination);

    running = true;
    toggle && (toggle.textContent = "정지");

    processor.onaudioprocess = (e) => {
      if (!running) return;
      if (!ws || ws.readyState !== WebSocket.OPEN) return;

      const input = e.inputBuffer.getChannelData(0);

      ws.send(
        JSON.stringify({
          type: "audio_chunk",
          sessionId: defaults.sessionId,
          seq: seq++,
          sampleRate: defaults.sampleRate,
          channels: 1,
          pcmBase64: floatToMonoPcm16Base64(input),
        } satisfies Record<string, unknown>),
      );
    };
  };

  toggle?.addEventListener("click", async () => {
    try {
      if (running) {
        await stop();
        return;
      }
      await start();
    } catch (err: any) {
      log(`에러: ${err?.stack ?? String(err)}`);
      setStatus("에러 발생");
      await stop();
    }
  });
}

void boot();
