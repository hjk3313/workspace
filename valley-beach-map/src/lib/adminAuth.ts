import { createHash } from "crypto";

export const ADMIN_SESSION_COOKIE = "admin_session";

export function hash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function isValidPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  return !!expected && password === expected;
}

export function isValidSession(cookieValue: string | undefined): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !cookieValue) return false;
  return cookieValue === hash(expected);
}
