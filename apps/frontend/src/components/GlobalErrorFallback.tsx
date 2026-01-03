import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";

interface GlobalErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function GlobalErrorFallback({
  error,
  resetErrorBoundary,
}: GlobalErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="mx-auto w-24 h-24 border-4 border-destructive/20 bg-destructive/10 rounded-full flex items-center justify-center mb-6 animate-in fade-in zoom-in duration-500">
          <AlertTriangle className="h-12 w-12 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Something went wrong
          </h1>
          <p className="text-muted-foreground text-lg">
            We encountered an unexpected error. Our team has been notified.
          </p>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg text-left overflow-auto max-h-48 text-sm font-mono border border-border">
          <p className="text-destructive font-semibold mb-1">Error Details:</p>
          <p className="text-muted-foreground break-words">
            {error.message || "Unknown error occurred"}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button 
            onClick={resetErrorBoundary} 
            size="lg" 
            className="gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Try Again
          </Button>
          <Button 
            onClick={() => window.location.href = '/'} 
            variant="outline" 
            size="lg" 
            className="gap-2"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
