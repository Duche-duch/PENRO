import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Toaster, toast } from "sonner";

type ToastType = "success" | "error" | "info";

type UIContextValue = {
  pageLoading: boolean;
  setPageLoading: (loading: boolean) => void;
  notify: (type: ToastType, message: string) => void;
};

const UIContext = createContext<UIContextValue | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [pageLoading, setPageLoading] = useState(false);

  const value = useMemo<UIContextValue>(
    () => ({
      pageLoading,
      setPageLoading,
      notify: (type, message) => {
        if (type === "success") toast.success(message);
        if (type === "error") toast.error(message);
        if (type === "info") toast.info(message);
      },
    }),
    [pageLoading],
  );

  return (
    <UIContext.Provider value={value}>
      {children}
      <Toaster richColors position="top-right" closeButton duration={3500} />
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUI must be used within UIProvider");
  }
  return context;
}
