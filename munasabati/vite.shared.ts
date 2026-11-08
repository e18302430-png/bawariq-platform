import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import type { UserConfig } from "vite";

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

/**
 * مفاتيح Supabase: تُقرأ من VITE_* أو من الأسماء التي يضيفها ربط Supabase داخل Vercel تلقائياً
 * (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_URL ...). المفتاح العام (anon) آمن للمتصفح، وكل الحماية بسياسات RLS.
 */
const pick = (...names: string[]) => names.map((n) => process.env[n]).find((v) => v && v.trim());
const SUPA_URL = pick("VITE_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL");
const SUPA_KEY = pick("VITE_SUPABASE_ANON_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_ANON_KEY", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
const envDefine: Record<string, string> = SUPA_URL && SUPA_KEY ? {
  "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(SUPA_URL),
  "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(SUPA_KEY),
} : {};

/** إعداد مشترك لكل التطبيقات: كل تطبيق يُبنى وينشر مستقلاً */
export function appConfig(port: number): UserConfig {
  return {
    base: "./",
    define: envDefine,
    plugins: [react()],
    css: { postcss: {} },
    resolve: {
      alias: [
        { find: /^@munasabati\/core$/, replacement: r("./packages/core/src/index.ts") },
        { find: /^@munasabati\/cloud$/, replacement: r("./packages/cloud/src/index.ts") },
        { find: /^@munasabati\/ui$/, replacement: r("./packages/ui/src/index.ts") },
        { find: /^@munasabati\/ui\/tokens\.css$/, replacement: r("./packages/ui/src/tokens.css") },
      ],
    },
    server: { port },
    build: {
      outDir: "dist", emptyOutDir: true, chunkSizeWarningLimit: 900, target: "es2020", cssCodeSplit: true,
      rollupOptions: {
        output: {
          // مكتبات ثابتة في ملفات مستقلة: تُخزَّن في المتصفح ولا تُحمَّل من جديد مع كل تحديث للتطبيق
          manualChunks(id) {
            if (id.includes("node_modules/react") || id.includes("node_modules/scheduler")) return "react";
            if (id.includes("node_modules/framer-motion")) return "motion";
            if (id.includes("node_modules/@supabase")) return "supabase";
            if (id.includes("node_modules/qrcode")) return "qrcode";
            if (id.includes("node_modules/lucide-react")) return "icons";
          },
        },
      },
    },
  };
}
