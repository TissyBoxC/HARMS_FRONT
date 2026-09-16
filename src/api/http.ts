type JsonRecord = Record<string, unknown>

export class ApiError extends Error {
  readonly status: number
  readonly payload: unknown

  constructor(status: number, message: string, payload: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === 'object' && value !== null

const readMessage = (payload: unknown, fallback: string, status?: number) => {
  if (typeof payload === 'string' && /No static resource|没有找到静态资源/i.test(payload)) {
    return '账户查询服务尚未加载，请更新后端服务后重试。'
  }
  if (typeof payload === 'string' && /method .*not supported|request method .*not supported/i.test(payload)) {
    return '当前后端版本尚未加载该查询接口，请部署最新后端服务后重试。'
  }
  if (isRecord(payload)) {
    const message = payload.message
    const detail = payload.detail
    const error = payload.error
    if (typeof message === 'string' && message.trim()) return message
    if (typeof detail === 'string' && detail.trim()) return detail
    if (typeof error === 'string' && error.trim()) return error
  }

  const statusMessage: Record<number, string> = {
    401: '登录状态已失效，请重新登录。',
    403: '当前账号没有执行此操作的权限。',
    404: '请求的内容不存在。',
    405: '当前后端版本尚未加载该查询接口，请部署最新后端服务后重试。',
    409: '当前内容存在关联数据，暂时无法完成操作。',
    422: '提交内容未通过校验，请检查填写信息。',
    500: '服务暂时繁忙，请稍后重试。',
  }
  return status && statusMessage[status] ? statusMessage[status] : fallback
}

const parseResponseBody = async (response: Response) => {
  const text = await response.text()

  if (!text) {
    return null
  }

  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

export const requestJson = async <T>(path: string, init: RequestInit): Promise<T> => {
  let response: Response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        ...init.headers,
      },
    })
  } catch {
    throw new ApiError(0, '当前无法连接服务，请稍后重试。', null)
  }

  const payload = response.status === 204 ? null : await parseResponseBody(response)

  if (!response.ok) {
    throw new ApiError(response.status, readMessage(payload, '提交失败，请稍后重试。', response.status), payload)
  }

  return payload as T
}
