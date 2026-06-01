export interface GatewayConfigRecord {
  authMode: 'token'
  source: 'manual' | 'local-openclaw'
  token: string
  url: string
}

const STORAGE_KEY = 'claw-deploy:gateway-config'

function hasWindow() {
  return typeof window !== 'undefined'
}

export async function loadGatewayConfig(): Promise<GatewayConfigRecord> {
  const fallback: GatewayConfigRecord = {
    authMode: 'token',
    source: 'manual',
    token: '',
    url: 'ws://127.0.0.1:18789',
  }

  if (!hasWindow()) {
    return fallback
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    return fallback
  }

  try {
    const parsed = JSON.parse(raw) as Partial<GatewayConfigRecord>
    return {
      authMode: parsed.authMode === 'token' ? 'token' : 'token',
      source: parsed.source === 'local-openclaw' ? 'local-openclaw' : 'manual',
      token: typeof parsed.token === 'string' ? parsed.token : '',
      url: typeof parsed.url === 'string' && parsed.url.trim() ? parsed.url : fallback.url,
    }
  } catch {
    return fallback
  }
}

export async function saveGatewayConfig(config: GatewayConfigRecord) {
  if (!hasWindow()) {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}
