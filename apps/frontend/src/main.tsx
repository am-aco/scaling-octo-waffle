import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Toaster } from "sonner"
import { ErrorBoundary } from "react-error-boundary"
import "./index.css"
import App from "./App.tsx"
import { GlobalErrorFallback } from "./components/GlobalErrorFallback.tsx"

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
            <App />
            <Toaster position="top-center" richColors />
        </ErrorBoundary>
    </StrictMode>,
)
