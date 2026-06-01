import type { GatewayMessage, GatewayResponseFrame } from '@/types/gateway'

interface GatewayClientOptions {
  onAuthenticated?: (payload: unknown) => void
  onClose?: (event: CloseEvent) => void
  onError?: (event: Event) => void
  onLog?: (message: string) => void
  onMessage?: (message: GatewayMessage | string) => void
  onOpen?: () => void
  token?: string
}

interface RequestFrame {
  id: string
  method: string
  params: Record<string, unknown>
  type: 'req'
}

export class GatewayClient {
  private socket: WebSocket | null = null
  private connectNonce: string | null = null
  private connectRequestId: string | null = null
  private connectSent = false
  private authenticated = false
  private pendingRequests = new Map<
    string,
    {
      resolve: (value: GatewayResponseFrame) => void
      reject: (reason?: unknown) => void
      timeoutId: number
    }
  >()

  constructor(
    private readonly url: string,
    private readonly options: GatewayClientOptions = {},
  ) {}

  connect() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return
    }

    this.connectNonce = null
    this.connectRequestId = null
    this.connectSent = false
    this.authenticated = false
    this.socket = new WebSocket(this.url)
    this.socket.addEventListener('open', () => {
      this.options.onLog?.('WebSocket 已建立，等待网关 challenge')
      this.options.onOpen?.()
    })
    this.socket.addEventListener('close', (event) => {
      this.options.onClose?.(event)
    })
    this.socket.addEventListener('error', (event) => {
      this.options.onError?.(event)
    })
    this.socket.addEventListener('message', (event) => {
      this.handleMessage(event.data)
    })
  }

  disconnect() {
    if (!this.socket) {
      return
    }

    this.socket.close()
    this.socket = null
    this.rejectPendingRequests(new Error('WebSocket 已断开'))
    this.connectNonce = null
    this.connectRequestId = null
    this.connectSent = false
    this.authenticated = false
  }

  send(message: GatewayMessage) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket 尚未连接')
    }

    this.socket.send(JSON.stringify(message))
  }

  async request(method: string, params: Record<string, unknown>, timeoutMs = 60_000) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket 尚未连接')
    }

    if (!this.authenticated) {
      throw new Error('OpenClaw 网关尚未完成认证')
    }

    const id = crypto.randomUUID()

    const frame: RequestFrame = {
      id,
      method,
      params,
      type: 'req',
    }

    return await new Promise<GatewayResponseFrame>((resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        this.pendingRequests.delete(id)
        reject(new Error(`网关请求超时：${method}`))
      }, timeoutMs)

      this.pendingRequests.set(id, {
        resolve,
        reject,
        timeoutId,
      })

      this.socket?.send(JSON.stringify(frame))
    })
  }

  private handleMessage(raw: unknown) {
    const text = typeof raw === 'string' ? raw : String(raw)

    try {
      const parsed = JSON.parse(text) as GatewayMessage

      if (parsed.type === 'event' && parsed.event === 'connect.challenge') {
        const payload = parsed.payload as { nonce?: string } | undefined
        const nonce = typeof payload?.nonce === 'string' ? payload.nonce.trim() : ''

        if (!nonce) {
          this.options.onLog?.('收到 connect.challenge，但缺少 nonce')
          return
        }

        this.connectNonce = nonce
        this.options.onLog?.('已收到 connect.challenge，准备发送握手请求')
        this.sendConnect()
        this.options.onMessage?.(parsed)
        return
      }

      if (parsed.type === 'res' && typeof parsed.id === 'string' && parsed.id === this.connectRequestId) {
        if (parsed.ok) {
          this.authenticated = true
          this.options.onAuthenticated?.(parsed.payload)
        } else {
          const errorMessage =
            typeof parsed.error === 'object' && parsed.error && 'message' in parsed.error
              ? String(parsed.error.message)
              : 'connect 握手失败'
          this.options.onLog?.(errorMessage)
        }
      }

      if (parsed.type === 'res' && typeof parsed.id === 'string') {
        const pending = this.pendingRequests.get(parsed.id)

        if (pending) {
          window.clearTimeout(pending.timeoutId)
          this.pendingRequests.delete(parsed.id)
          pending.resolve(parsed as GatewayResponseFrame)
        }
      }

      this.options.onMessage?.(parsed)
    } catch {
      this.options.onMessage?.(text)
    }
  }

  private sendConnect() {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return
    }

    if (this.connectSent) {
      return
    }

    if (!this.connectNonce) {
      return
    }

    const token = this.options.token?.trim()

    if (!token) {
      this.options.onLog?.('未配置 gateway token，无法完成 connect 握手')
      return
    }

    this.connectSent = true
    this.connectRequestId = crypto.randomUUID()

    const frame: RequestFrame = {
      id: this.connectRequestId,
      method: 'connect',
      type: 'req',
      params: {
        minProtocol: 4,
        maxProtocol: 4,
        client: {
          id: 'gateway-client',
          displayName: 'Claw Deploy',
          version: '0.1.0',
          mode: 'backend',
          platform: navigator.platform || 'tauri',
        },
        auth: {
          token,
        },
        role: 'operator',
        scopes: ['operator.admin', 'operator.read', 'operator.write'],
        caps: [],
      },
    }

    this.options.onLog?.('已发送 connect 握手请求（role=operator, scopes=operator.admin/operator.read/operator.write）')
    this.socket.send(JSON.stringify(frame))
  }

  private rejectPendingRequests(reason: Error) {
    this.pendingRequests.forEach((pending) => {
      window.clearTimeout(pending.timeoutId)
      pending.reject(reason)
    })
    this.pendingRequests.clear()
  }
}
