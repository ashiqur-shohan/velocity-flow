import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from './contexts/AuthContext.tsx'
import { OrgProvider } from './contexts/OrgContext.tsx'

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <OrgProvider>
      <App />
    </OrgProvider>
  </AuthProvider>
);
