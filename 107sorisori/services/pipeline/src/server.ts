import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import type { SubtitleSegmentMessage } from "@sorisori/contracts";

const PIPELINE_HOST = process.env.PIPELINE_HOST ?? "127.0.0.1";
const PIPELINE_PORT = Number(process.env.PIPELINE_PORT ?? "8788");

type StoredSegment = Omit<SubtitleSegmentMessage, "type">;

const sessions = new Map<string, StoredSegment[]>();

const app = new Hono();

app.use("/*", cors());

app.get("/health", (c) => c.json({ ok: true }));

app.post("/sessions/:sessionId/segments", async (c) => {
  const sessionId = c.req.param("sessionId");
  const body = (await c.req.json()) as Partial<SubtitleSegmentMessage>;
  const seg: StoredSegment = {
    sessionId,
    transcript: body.transcript ?? "",
    translation: body.translation ?? "",
    sourceLang: body.sourceLang,
    sttMs: body.sttMs,
    translateMs: body.translateMs,
    t: typeof body.t === "number" ? body.t : Date.now(),
  };
  const list = sessions.get(sessionId) ?? [];
  list.push(seg);
  sessions.set(sessionId, list);
  return c.json({ ok: true, index: list.length - 1 });
});

app.get("/sessions/:sessionId/segments", (c) => {
  const sessionId = c.req.param("sessionId");
  return c.json({ sessionId, segments: sessions.get(sessionId) ?? [] });
});

serve({ fetch: app.fetch, hostname: PIPELINE_HOST, port: PIPELINE_PORT }, () => {
  // eslint-disable-next-line no-console
  console.log(`[pipeline] http://${PIPELINE_HOST}:${PIPELINE_PORT}`);
});
