export type HelloClientMessage = {
  type: "hello";
  sessionId: string;
  client: "desktop" | "web" | string;
  sampleRate?: number;
};

export type AudioChunkMessage = {
  type: "audio_chunk";
  sessionId: string;
  seq: number;
  /** PCM s16le mono */
  sampleRate: number;
  channels: number;
  pcmBase64: string;
};

export type FlushAudioMessage = {
  type: "flush_audio";
  sessionId: string;
};

export type ClientToServerMessage =
  | HelloClientMessage
  | AudioChunkMessage
  | FlushAudioMessage;

export type SubtitleSegmentMessage = {
  type: "subtitle_segment";
  sessionId: string;
  transcript: string;
  translation: string;
  sourceLang?: string;
  sttMs?: number;
  translateMs?: number;
  t: number;
};

export type ServerToClientMessage =
  | SubtitleSegmentMessage
  | { type: "ack"; sessionId: string }
  | { type: "error"; message: string };
