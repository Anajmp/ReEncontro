import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "./app/components/ui/sonner";
import { AuthProvider } from "./contexts/AuthProvider.tsx";
import App from "./app/App.tsx";
import { CHAVE_TEMA } from "./lib/tema";
import "./styles/index.css";
import * as Sentry from '@sentry/react';
import { PainelAcessibilidade } from "./app/components/shared/PainelAcessibilidade.tsx";
import "@fontsource/atkinson-hyperlegible/400.css";
import "@fontsource/atkinson-hyperlegible/700.css";

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1,
  });
}

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    {/* Tema: sempre começa claro (não segue o sistema); o escuro só com o botão do cabeçalho */}
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey={CHAVE_TEMA} disableTransitionOnChange>
      <BrowserRouter>
        <AuthProvider>
          <App />
          <Toaster position="top-center" richColors />
          <PainelAcessibilidade />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </GoogleOAuthProvider>
);
