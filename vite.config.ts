import { defineConfig } from "vitest/config";
import dts from "vite-plugin-dts";

export default defineConfig({
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'istanbul'
    }
  },
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es", "cjs"],
      name: "index",
      fileName: (format) => `index.${format}.js`,
    },
  },
  plugins: [dts()]
});
