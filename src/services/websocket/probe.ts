export type GatewayProbeStatus = 'challenge' | 'closed' | 'error' | 'open'

export interface GatewayProbeResult {
  message: string
  status: GatewayProbeStatus
}

export function probeGateway(url: string, timeoutMs = 5000): Promise<GatewayProbeResult> {
  return new Promise((resolve) => {
    const socket = new WebSocket(url)
    let settled = false
    let opened = false

    const timer = window.setTimeout(() => {
      finish({
        status: 'error',
        message: `在 ${timeoutMs / 1000} 秒内没有收到网关响应，请确认 OpenClaw 是否已启动，以及地址是否正确。`,
      })
    }, timeoutMs)

    function cleanup() {
      window.clearTimeout(timer)
      socket.removeEventListener('open', handleOpen)
      socket.removeEventListener('message', handleMessage)
      socket.removeEventListener('error', handleError)
      socket.removeEventListener('close', handleClose)
    }

    function safeClose() {
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close(1000, 'probe complete')
      }
    }

    function finish(result: GatewayProbeResult) {
      if (settled) {
        return
      }

      settled = true
      cleanup()
      safeClose()
      resolve(result)
    }

    function handleOpen() {
      opened = true
    }

    function handleMessage(event: MessageEvent) {
      const text = typeof event.data === 'string' ? event.data : String(event.data)

      try {
        const parsed = JSON.parse(text) as { event?: string }

        if (parsed.event === 'connect.challenge') {
          finish({
            status: 'challenge',
            message: '网关可达，并已返回 connect.challenge，说明服务已启动，当前卡点只剩鉴权握手。',
          })
          return
        }

        finish({
          status: 'open',
          message: '网关可达，并返回了响应消息，但不是预期的 connect.challenge。',
        })
      } catch {
        finish({
          status: 'open',
          message: '网关可达，并返回了非 JSON 消息。',
        })
      }
    }

    function handleError() {
      finish({
        status: 'error',
        message: '无法建立 WebSocket 连接，请确认 OpenClaw 网关是否启动，或当前地址是否正确。',
      })
    }

    function handleClose() {
      if (settled) {
        return
      }

      finish({
        status: opened ? 'closed' : 'error',
        message: opened
          ? 'WebSocket 已建立，但网关在返回鉴权 challenge 之前就关闭了连接。'
          : '连接在建立前即被关闭，请确认地址、端口和本地网关进程状态。',
      })
    }

    socket.addEventListener('open', handleOpen)
    socket.addEventListener('message', handleMessage)
    socket.addEventListener('error', handleError)
    socket.addEventListener('close', handleClose)
  })
}
