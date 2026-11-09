import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { handleEmailRequest } from "./server/email.ts";

export default defineConfig(({ mode }) => {
  const env = { ...process.env, ...loadEnv(mode, process.cwd(), "") };

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: "resend-api-dev-server",
        configureServer(server) {
          server.middlewares.use("/api/send-email", (req, res) => {
            void handleEmailRequest(req, res, { env });
          });
        },
      },
    ],
  };
});
