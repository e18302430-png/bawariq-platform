// يولّد supabase/seed.sql: قاعات وموردون أمثلة (اختياري) حتى لا تبدو المنصة فارغة قبل تسجيل التجار الحقيقيين.
// الإدارة تقدر تحذفها من لوحة الإدارة في أي وقت.
import { writeFileSync } from "node:fs";
import { build } from "esbuild";

const out = await build({ entryPoints: [new URL("../packages/core/src/catalog.ts", import.meta.url).pathname], bundle: true, write: false, format: "esm", platform: "node" });
const mod = await import("data:text/javascript;base64," + Buffer.from(out.outputFiles[0].text).toString("base64"));
const q = (v) => "'" + JSON.stringify(v).replace(/'/g, "''") + "'::jsonb";
const rows = (table, list) => list.map((x) => `insert into public.${table} (id, data, published, status) values ('${x.id}', ${q(x)}, true, 'active') on conflict (id) do nothing;`).join("\n");
writeFileSync(new URL("../supabase/seed.sql", import.meta.url), `-- أمثلة اختيارية: قاعات وموردون للتجربة (احذفها من لوحة الإدارة بعد تسجيل التجار الحقيقيين)\n${rows("suppliers", mod.SEED_SUPPLIERS)}\n${rows("venues", mod.SEED_VENUES)}\n`);
console.log("seed.sql:", mod.SEED_SUPPLIERS.length, "suppliers,", mod.SEED_VENUES.length, "venues");
