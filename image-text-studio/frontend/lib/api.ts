import type { Edit, ExportFormat, FontInfo, ImageMeta, Rule } from "./types";

const BASE = process.env.NEXT_PUBLIC_API_BASE || "";

async function check(r: Response): Promise<Response> {
  if (!r.ok) {
    let msg = `${r.status}`;
    try {
      const j = await r.json();
      msg = typeof j.detail === "string" ? j.detail : JSON.stringify(j.detail);
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  return r;
}

export async function detect(file: File, signal?: AbortSignal): Promise<ImageMeta> {
  const fd = new FormData();
  fd.append("file", file);
  const r = await check(await fetch(`${BASE}/api/detect`, { method: "POST", body: fd, signal }));
  return r.json();
}

export async function getImage(id: string): Promise<ImageMeta> {
  return (await check(await fetch(`${BASE}/api/images/${id}`))).json();
}

export function originalUrl(id: string, maxSide?: number) {
  return `${BASE}/api/images/${id}/original${maxSide ? `?max_side=${maxSide}` : ""}`;
}

export async function render(
  imageId: string,
  edits: Edit[],
  opts: { format?: ExportFormat; quality?: number; maxSide?: number; signal?: AbortSignal } = {},
): Promise<{ blob: Blob; ms: number }> {
  const r = await check(
    await fetch(`${BASE}/api/replace`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_id: imageId,
        edits,
        format: opts.format ?? "png",
        quality: opts.quality ?? 95,
        max_side: opts.maxSide,
      }),
      signal: opts.signal,
    }),
  );
  return { blob: await r.blob(), ms: Number(r.headers.get("X-Render-Ms") || 0) };
}

export async function findReplace(imageId: string, rules: Rule[], edits: Edit[]): Promise<Edit[]> {
  const r = await check(
    await fetch(`${BASE}/api/find-replace`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_id: imageId, rules, edits }),
    }),
  );
  return (await r.json()).edits;
}

export async function batch(imageIds: string[], rules: Rule[], format: ExportFormat): Promise<Blob> {
  const r = await check(
    await fetch(`${BASE}/api/batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_ids: imageIds, rules, format }),
    }),
  );
  return r.blob();
}

export async function addBlock(imageId: string, quad: number[][]) {
  const r = await check(
    await fetch(`${BASE}/api/images/${imageId}/blocks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quad }),
    }),
  );
  return r.json();
}

export async function deleteBlock(imageId: string, blockId: string) {
  await check(await fetch(`${BASE}/api/images/${imageId}/blocks/${blockId}`, { method: "DELETE" }));
}

export async function fonts(): Promise<FontInfo[]> {
  return (await check(await fetch(`${BASE}/api/fonts`))).json();
}

export async function uploadFont(file: File): Promise<FontInfo> {
  const fd = new FormData();
  fd.append("file", file);
  return (await check(await fetch(`${BASE}/api/fonts`, { method: "POST", body: fd }))).json();
}

export function fontFileUrl(id: string) {
  return `${BASE}/api/fonts/${id}/file`;
}

export function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
