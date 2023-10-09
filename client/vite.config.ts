import react from "@vitejs/plugin-react";
import {defineConfig} from "vite";
import checker from "vite-plugin-checker";
import svgr from "vite-plugin-svgr";
import viteTsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
    plugins: [
        react(),
        checker({
            overlay: {initialIsOpen: false, position: "br"},
            typescript: true,
            eslint: {
                lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
            },
        }),
        viteTsconfigPaths(),
        svgr(),
    ],

    server: {
        host: "0.0.0.0",
        port: 5173,
    },
    build: {outDir: "build"},

    optimizeDeps: {
        esbuildOptions: {
            // Node.js global to browser globalThis
            define: {
                global: "globalThis",
            },
        },
    },

    css: {
        preprocessorOptions: {
            scss: {
                quietDeps: true,
            },
        },
    },
});
