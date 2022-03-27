import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
// import { createVuePlugin } from "vite-plugin-vue2";

export default defineConfig(() => ({
  plugins: [
    vue(),
    //  createVuePlugin()
  ],
}));
