// يحوّل بناء الملف الواحد (dist-single/index.html) إلى صفحة جاهزة للنشر كـ Artifact
import { readFileSync, writeFileSync } from "node:fs";

const [, , src = "dist-single/index.html", out = "dist-single/farha-artifact.html"] = process.argv;
const html = readFileSync(src, "utf8");
const head = html.match(/<head>([\s\S]*?)<\/head>/i)[1];
const body = html.match(/<body>([\s\S]*?)<\/body>/i)[1];
const keep = head
  .replace(/<meta charset[^>]*>/i, "")
  .replace(/<meta name="viewport"[^>]*>/i, '<meta name="claude:viewport-fit-sides" content="cover">');
writeFileSync(out, `${keep.trim()}\n${body.trim()}\n`);
console.log("wrote", out, (Buffer.byteLength(readFileSync(out)) / 1024).toFixed(0) + " KB");
