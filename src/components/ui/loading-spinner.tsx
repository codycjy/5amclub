// components/ui/loading-spinner.tsx
import { Loader2 } from "lucide-react";

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className="flex justify-center items-center min-h-[200px]">
      <Loader2 className={`h-8 w-8 animate-spin text-primary ${className}`} />
    </div>
  );
}
