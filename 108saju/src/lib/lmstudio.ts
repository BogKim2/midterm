export type LMStudioConfig = {
  baseUrl: string
  model: string
}

export function getLMStudioConfig(): LMStudioConfig | null {
  const baseUrl = import.meta.env.VITE_LMSTUDIO_BASE_URL || '/v1'
  const model = import.meta.env.VITE_LMSTUDIO_MODEL

  if (!model) {
    return null
  }

  return { baseUrl, model }
}
