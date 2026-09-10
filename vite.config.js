import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(
          __dirname,
          "index.html"
        ),

        contato: resolve(
          __dirname,
          "contato/index.html"
        ),

        marcelo: resolve(
          __dirname,
          "pessoas/marcelo/index.html"
        ),

        guido: resolve(
          __dirname,
          "pessoas/guido/index.html"
        ),

        edu: resolve(
          __dirname,
          "pessoas/edu/index.html"
        )
      }
    }
  }
});