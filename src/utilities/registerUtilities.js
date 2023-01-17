import { createHash } from "crypto";

export function hashPassword(string) {
  if(string == null) return null
  return createHash("sha256").update(string).digest("hex");
}
