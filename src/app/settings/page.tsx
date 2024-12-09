import { Suspense } from "react";
import { SettingsForm } from "@/components/settings/SettingsForm";

export default async function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-2xl mx-auto">
        <Suspense fallback={<div>加载中...</div>}>
          <SettingsForm />
        </Suspense>
      </div>
    </div>
  );
}
