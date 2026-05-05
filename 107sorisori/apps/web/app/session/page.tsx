"use client";

import { useEffect, useMemo, useState } from "react";
import type { ServerToClientMessage, SubtitleSegmentMessage } from "@sorisori/contracts";

export default function SessionPage() {
  const wsBase = process.env.NEXT_PUBLIC_REALTIME_WS_URL ?? "";
  const fallbackSession =
    process.env.NEXT_PUBLIC_DEFAULT_SESSION_ID ?? "mvp-session-001";

  const [sessionId] = useState(fallbackSession);
  const [connected, setConnected] = useState(false);
  const [segments, setSegments] = useState<SubtitleSegmentMessage[]>([]);
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    if (!wsBase.startsWith("ws")) {
      setLastError("NEXT_PUBLIC_REALTIME_WS_URL 이 설정되지 않았습니다. 루트 .env를 확인하세요.");
      return;
    }

    const u = new URL(wsBase);
    u.searchParams.set("sessionId", sessionId);

    const ws = new WebSocket(u.toString());

    ws.addEventListener("open", () => {
      setConnected(true);
      setLastError(null);
      ws.send(JSON.stringify({ type: "hello", sessionId, client: "web" }));
    });

    ws.addEventListener("close", () => setConnected(false));

    ws.addEventListener("message", (ev) => {
      const raw = typeof ev.data === "string" ? ev.data : new TextDecoder().decode(ev.data as ArrayBuffer);
      const parsed = JSON.parse(raw) as ServerToClientMessage;
      if (parsed.type === "subtitle_segment") {
        setSegments((prev) => [parsed, ...prev].slice(0, 120));
        return;
      }
      if (parsed.type === "error") setLastError(parsed.message ?? "unknown_error");
    });

    return () => ws.close();
  }, [wsBase, sessionId]);

  const latest = useMemo(() => segments[0], [segments]);

  return (
    <main>
      <div className="hero">
        <h1>라이브 자막</h1>
        <p>
          `apps/desktop`에서 PC 오디오를 캡처하면 realtime이 `local-ai`를 호출하고, 이 페이지는 WebSocket으로 자막을
          표시합니다.
        </p>
      </div>

      <section className="card">
        <div className="row" style={{ marginBottom: 12 }}>
          <div className="badge" style={{ opacity: connected ? 1 : 0.75 }}>
            <span className={connected ? "dot" : "dot off"} />
            <span>{connected ? "WebSocket 연결됨" : "WebSocket 미연결"}</span>
          </div>

          <div className="badge code">WS: {wsBase || "(env 없음)"}</div>
          <div className="badge code">session: {sessionId}</div>
        </div>

        {latest ? (
          <div>
            <div className="small" style={{ marginBottom: 8 }}>
              번역 결과(한국어)
            </div>
            <div className="big">{latest.translation}</div>
            <details style={{ marginTop: 14 }}>
              <summary>디버그(원문/타이밍)</summary>
              <pre className="code small">{JSON.stringify(latest, null, 2)}</pre>
            </details>
          </div>
        ) : (
          <div className="small">자막이 아직 없습니다. 데스크톱 캡처를 시작하세요.</div>
        )}

        {lastError ? (
          <pre className="code small" style={{ marginTop: 12 }}>
            {lastError}
          </pre>
        ) : null}
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <div className="small" style={{ marginBottom: 10 }}>
          최근 세그먼트({segments.length})
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {segments.slice(0, 10).map((s, idx) => (
            <div
              key={`${s.t}-${idx}`}
              style={{
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 12,
                padding: 12,
                background: "rgba(0,0,0,0.18)",
              }}
            >
              <div style={{ opacity: 0.85 }} className="small code">
                {new Date(s.t).toLocaleString()}
              </div>
              <div style={{ marginTop: 6 }}>{s.translation}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
