import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/violations_dashboard_new/",
  plugins: [react()],
});
