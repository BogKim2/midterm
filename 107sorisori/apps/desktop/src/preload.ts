import { contextBridge, ipcRenderer } from "electron";

export type SorisoriDefaults = {
  wsUrl: string;
  sessionId: string;
  sampleRate: number;
};

contextBridge.exposeInMainWorld("sorisori", {
  async getDefaults(): Promise<SorisoriDefaults> {
    return await ipcRenderer.invoke("sorisori:getDefaults");
  },
});
