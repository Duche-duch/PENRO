
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
import { UIProvider } from "./app/context/UIProvider.tsx";
import { AppErrorBoundary } from "./app/components/AppErrorBoundary.tsx";
import { LeaveApplicationPrintPage } from "./app/components/LeaveApplicationPrintPage.tsx";
  import "./styles/index.css";

const isPrintRoute = window.location.pathname.startsWith("/print/leave-application/");

createRoot(document.getElementById("root")!).render(
  <AppErrorBoundary>
    {isPrintRoute ? (
      <LeaveApplicationPrintPage />
    ) : (
      <UIProvider>
        <App />
      </UIProvider>
    )}
  </AppErrorBoundary>,
);
  