import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Toaster } from "sonner"
import { ErrorBoundary } from "react-error-boundary"
import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import "@/index.css"
import App from "@/App.tsx"
import { GlobalErrorFallback } from "@/components/GlobalErrorFallback.tsx"
import { queryClient } from "@/lib/react-query"

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ErrorBoundary
            FallbackComponent={GlobalErrorFallback}
            onReset={() => {
                window.location.reload();
            }}
            onError={(error) => {
                console.error("Global Error Caught:", error);
            }}
        >
            <QueryClientProvider client={queryClient}>
                <App />
                <Toaster position="top-center" richColors />
                <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
        </ErrorBoundary>
    </StrictMode>,
)
