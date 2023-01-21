import { createHash } from "crypto";

/**
 * Transforms a password string to a SHA256 encrypted version. Return null if the password is empty.
 * @param  {String | null} password the original password string
 * @return {String | null}      a SHA256 encrypted string
 */
export function hashPassword(password) {
  if(password == null) return null
  return createHash("sha256").update(password).digest("hex");
}
