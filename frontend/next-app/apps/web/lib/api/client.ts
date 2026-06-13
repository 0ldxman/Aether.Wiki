const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? ""

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

function extractErrorMessage(detail: unknown): string {
  if (typeof detail === "string") return detail
  if (Array.isArray(detail)) {
    return detail
      .map((item) =>
        typeof item === "object" && item !== null && "msg" in item
          ? String((item as { msg: unknown }).msg)
          : JSON.stringify(item)
      )
      .join("; ")
  }
  return "Неизвестная ошибка"
}

/**
 * Fetch from the AETHER backend from a Client Component, sending the
 * session cookie so the backend can resolve the current user.
 */
export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new ApiError(response.status, extractErrorMessage(body?.detail))
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}
