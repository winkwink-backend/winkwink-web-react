export type SecretData =
  | { type: "text"; payload: string; mode: string }
  | { type: "audio"; payload: Uint8Array; mode: string }
  | { type: "image"; payload: File; mode: string }
  | { type: "camera"; payload: File; mode: string }
  | { type: "sandwich"; payload: File; mode: string };
