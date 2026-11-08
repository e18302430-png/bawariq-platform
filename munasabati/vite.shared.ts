import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import type { UserConfig } from "vite";

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

/** إعداد مشترك لكل التطبيقات: كل تطبيق يُبنى وينشر مستقلاً */
export function appConfig(port: number): UserConfig {
  return {
    base: "./",
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
    build: { outDir: "dist", emptyOutDir: true, chunkSizeWarningLimit: 900 },
  };
}
