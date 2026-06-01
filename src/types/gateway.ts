export type GatewayLogLevel = 'info' | 'success' | 'warn' | 'error'

export interface GatewayLogEntry {
  id: string
  level: GatewayLogLevel
  message: string
  timestamp: string
}

export interface GatewayMessage {
  type: string
  [key: string]: unknown
}

export interface GatewayResponseFrame {
  type: 'res'
  id: string
  ok: boolean
  payload?: unknown
  error?: {
    message?: string
    type?: string
    [key: string]: unknown
  }
  [key: string]: unknown
}
