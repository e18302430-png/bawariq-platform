// يولّد packages/ui/src/icons.tsx باستيراد الأيقونات المستخدمة فعلاً فقط (حجم أصغر للتطبيقات)
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const lucideDir = join(root, "node_modules/lucide-react/dist/esm/icons");
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/([A-Za-z])([0-9])/g, "$1-$2").toLowerCase();
const available = new Set(readdirSync(lucideDir).filter((f) => f.endsWith(".js")).map((f) => f.slice(0, -3)));

const files = [];
const walk = (d) => readdirSync(d).forEach((f) => {
  const p = join(d, f);
  if (f === "node_modules" || f === "dist") return;
  if (statSync(p).isDirectory()) walk(p);
  else if (/\.(tsx?|jsx?)$/.test(f) && !p.endsWith("icons.tsx")) files.push(p);
});
["apps", "packages"].forEach((d) => walk(join(root, d)));

const names = new Set(["Sparkles"]);
for (const f of files) for (const m of readFileSync(f, "utf8").matchAll(/["'`]([A-Z][A-Za-z0-9]*)["'`]/g)) if (available.has(kebab(m[1]))) names.add(m[1]);
const list = [...names].sort();
writeFileSync(join(root, "packages/ui/src/icons.tsx"), `// ملف مولّد تلقائياً عبر scripts/gen-icons.mjs
import { ${list.join(", ")} } from "lucide-react";
import type { LucideProps } from "lucide-react";

const MAP = { ${list.join(", ")} } as const;
export type IconName = keyof typeof MAP;

export function Icon({ name, size = 20, ...p }: { name: string; size?: number } & Omit<LucideProps, "ref">) {
  const C = (MAP as Record<string, typeof Sparkles>)[name] ?? Sparkles;
  return <C size={size} strokeWidth={1.8} aria-hidden="true" {...p} />;
}
`);
console.log(`icons: ${list.length}`);
