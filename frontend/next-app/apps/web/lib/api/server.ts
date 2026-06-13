import { cookies } from "next/headers"

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000"

/**
 * Fetch from the AETHER backend from a Server Component, forwarding the
 * incoming request's cookies so the backend can resolve the session.
 *
 * Returns `null` on 404 (and on 401, used by /auth/me to mean "guest").
 * Other non-OK responses throw.
 */
export async function serverFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T | null> {
  const cookieHeader = (await cookies()).toString()

  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers: {
      ...init?.headers,
      cookie: cookieHeader,
    },
  })

  if (response.status === 404 || response.status === 401) {
    return null
  }

  if (!response.ok) {
    throw new Error(`Backend request to ${path} failed: ${response.status}`)
  }

  return (await response.json()) as T
}
