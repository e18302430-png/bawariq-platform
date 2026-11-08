// يجمع التطبيقات الأربعة (كل واحد مبني مستقلاً) في مجلد واحد للنشر:
//   artifact/index.html        ← صفحة الهبوط
//   artifact/client/           ← تطبيق العميل
//   artifact/vendors/          ← بوابة الموردين
//   artifact/venues/           ← بوابة القاعات
// ويكتب artifact/page.html: نسخة صفحة الهبوط بدون هيكل المستند (لنشرها كصفحة Artifact رئيسية)
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const out = join(root, "artifact");
rmSync(out, { recursive: true, force: true });
mkdirSync(out);
cpSync(join(root, "apps/web/dist"), out, { recursive: true });
for (const app of ["client", "vendors", "venues", "admin"]) cpSync(join(root, `apps/${app}/dist`), join(out, app), { recursive: true });

const html = readFileSync(join(out, "index.html"), "utf8");
const head = html.match(/<head>([\s\S]*?)<\/head>/i)[1]
  .replace(/<meta charset[^>]*>/i, "")
  .replace(/<meta name="viewport"[^>]*>/i, '<meta name="claude:viewport-fit-sides" content="cover">');
const body = html.match(/<body>([\s\S]*?)<\/body>/i)[1];
writeFileSync(join(out, "page.html"), `${head.trim()}\n${body.trim()}\n`);

const files = [];
const walk = (d, rel = "") => readdirSync(d).forEach((f) => {
  const p = join(d, f), r = rel ? `${rel}/${f}` : f;
  if (statSync(p).isDirectory()) walk(p, r); else if (r !== "index.html" && r !== "page.html") files.push(r);
});
walk(out);
writeFileSync(join(out, "files.json"), JSON.stringify(files, null, 2));
console.log(`bundled ${files.length} files into artifact/`);
