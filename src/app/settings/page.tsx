import { Suspense } from "react";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default async function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-2xl mx-auto">
        <Suspense fallback={<LoadingSpinner />}>
          <SettingsForm />
        </Suspense>
      </div>
    </div>
  );
}
