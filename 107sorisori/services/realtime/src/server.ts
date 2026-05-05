import http from "node:http";
import { WebSocketServer } from "ws";
import type { RawData, WebSocket } from "ws";
import type { ClientToServerMessage, SubtitleSegmentMessage } from "@sorisori/contracts";

const REALTIME_HOST = process.env.REALTIME_HOST ?? "127.0.0.1";
const REALTIME_PORT = Number(process.env.REALTIME_PORT ?? "8787");
const LOCAL_AI_URL = (process.env.LOCAL_AI_URL ?? "http://127.0.0.1:8789").replace(/\/$/, "");
const PIPELINE_URL = (
  process.env.PIPELINE_PUBLIC_URL ??
  process.env.PIPELINE_URL ??
  `http://${process.env.PIPELINE_HOST ?? "127.0.0.1"}:${process.env.PIPELINE_PORT ?? "8788"}`
).replace(/\/$/, "");

const FLUSH_MS = Number(process.env.REALTIME_FLUSH_MS ?? "2200");

type SessionAgg = {
  sampleRate: number;
  pcm: Buffer[];
  channels: number;
  lastFlushAt: number;
  flushTimer?: NodeJS.Timeout;
  busy: boolean;
};

function safeJsonParse(raw: string): unknown {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function isClientMessage(msg: unknown): msg is ClientToServerMessage {
  if (!msg || typeof msg !== "object") return false;
  const t = (msg as { type?: unknown }).type;
  return t === "hello" || t === "audio_chunk" || t === "flush_audio";
}

async function appendSegment(sessionId: string, seg: SubtitleSegmentMessage) {
  try {
    const { type: _type, ...rest } = seg;
    await fetch(`${PIPELINE_URL}/sessions/${encodeURIComponent(sessionId)}/segments`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(rest),
    });
  } catch {
    // 저장 실패여도 라이브 자막은 계속 진행
  }
}

async function processPcm(sampleRate: number, pcmMonoS16Le: Buffer) {
  const body = {
    sample_rate: sampleRate,
    pcm_base64: pcmMonoS16Le.toString("base64"),
  };
  const res = await fetch(`${LOCAL_AI_URL}/process_pcm`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`local_ai_failed: ${res.status} ${text}`);
  }
  return (await res.json()) as Record<string, unknown>;
}

async function flushSession(
  sockets: Set<WebSocket>,
  sessionId: string,
  st: SessionAgg,
) {
  if (st.busy) return;
  if (st.pcm.length === 0) return;

  st.busy = true;
  const merged = Buffer.concat(st.pcm);
  st.pcm = [];
  st.lastFlushAt = Date.now();

  try {
    const result = await processPcm(st.sampleRate, merged);
    const transcript = String(result.text ?? "").trim();
    const translationRaw = String(result.translation ?? "").trim();
    const translation = translationRaw || transcript;

    const seg: SubtitleSegmentMessage = {
      type: "subtitle_segment",
      sessionId,
      transcript,
      translation,
      sourceLang: typeof result.language === "string" ? result.language : undefined,
      sttMs: typeof result.sttMs === "number" ? result.sttMs : undefined,
      translateMs: typeof result.translateMs === "number" ? result.translateMs : undefined,
      t: Date.now(),
    };

    await appendSegment(sessionId, seg);

    const payload = JSON.stringify(seg);
    for (const ws of sockets) {
      if (ws.readyState === ws.OPEN) ws.send(payload);
    }
  } catch (err) {
    const payload = JSON.stringify({
      type: "error",
      message: err instanceof Error ? err.message : String(err),
    } satisfies Record<string, unknown>);
    for (const ws of sockets) {
      if (ws.readyState === ws.OPEN) ws.send(payload);
    }
  } finally {
    st.busy = false;
  }
}

function scheduleFlush(
  sockets: Set<WebSocket>,
  sessionId: string,
  sessions: Map<string, SessionAgg>,
) {
  const st = sessions.get(sessionId);
  if (!st) return;

  if (st.flushTimer) clearTimeout(st.flushTimer);
  st.flushTimer = setTimeout(() => {
    void flushSession(sockets, sessionId, st);
  }, FLUSH_MS);
}

const server = http.createServer((_req, res) => {
  res.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
  res.end("SoriSori realtime gateway OK\n");
});

const wss = new WebSocketServer({ server, path: "/ws" });

const sessionsSockets = new Map<string, Set<WebSocket>>();
const sessionAgg = new Map<string, SessionAgg>();

function ensureSession(sessionId: string): Set<WebSocket> {
  let s = sessionsSockets.get(sessionId);
  if (!s) {
    s = new Set();
    sessionsSockets.set(sessionId, s);
  }
  return s;
}

function cleanupSocket(ws: WebSocket) {
  const emptySessions: string[] = [];
  for (const [sid, set] of sessionsSockets.entries()) {
    const removed = set.delete(ws);
    if (!removed) continue;
    if (set.size === 0) {
      sessionsSockets.delete(sid);
      emptySessions.push(sid);
    }
  }
  for (const sid of emptySessions) {
    const agg = sessionAgg.get(sid);
    if (agg?.flushTimer) clearTimeout(agg.flushTimer);
    sessionAgg.delete(sid);
  }
}

wss.on("connection", (ws) => {
  ws.on("message", (data: RawData) => {
    const raw =
      typeof data === "string" ? data : Buffer.isBuffer(data) ? data.toString("utf8") : data.toString();
    const msg = safeJsonParse(raw);
    if (!isClientMessage(msg)) {
      ws.send(JSON.stringify({ type: "error", message: "invalid_message" }));
      return;
    }

    if (msg.type === "hello") {
      const sid = msg.sessionId;
      ensureSession(sid).add(ws);
      if (!sessionAgg.has(sid)) {
        sessionAgg.set(sid, {
          sampleRate: typeof msg.sampleRate === "number" ? msg.sampleRate : 48000,
          pcm: [],
          channels: 1,
          lastFlushAt: Date.now(),
          busy: false,
        });
      }
      ws.send(JSON.stringify({ type: "ack", sessionId: sid }));
      return;
    }

    const sid = msg.sessionId;
    const sockets = ensureSession(sid);
    sockets.add(ws);

    let st = sessionAgg.get(sid);
    if (!st) {
      st = {
        sampleRate: msg.type === "audio_chunk" ? msg.sampleRate : 48000,
        pcm: [],
        channels: msg.type === "audio_chunk" ? msg.channels : 1,
        lastFlushAt: Date.now(),
        busy: false,
      };
      sessionAgg.set(sid, st);
    }

    if (msg.type === "audio_chunk") {
      const buf = Buffer.from(msg.pcmBase64, "base64");
      if (buf.length === 0) return;
      st.sampleRate = msg.sampleRate || st.sampleRate;
      st.channels = msg.channels || st.channels;
      st.pcm.push(buf);

      scheduleFlush(sockets, sid, sessionAgg);
      return;
    }

    if (msg.type === "flush_audio") {
      void flushSession(sockets, sid, st);
    }
  });

  ws.on("close", () => cleanupSocket(ws));
});

server.listen(REALTIME_PORT, REALTIME_HOST, () => {
  // eslint-disable-next-line no-console
  console.log(
    `[realtime] ws://${REALTIME_HOST}:${REALTIME_PORT}/ws local_ai=${LOCAL_AI_URL} pipeline=${PIPELINE_URL} flush=${FLUSH_MS}ms`,
  );
});
