import { Suspense } from "react";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { PageContainer } from "@/components/layout/PageContainer";

export default async function SettingsPage() {
  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto min-h-[400px]">
        {" "}
        {/* 添加最小高度 */}
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-[400px]">
              <LoadingSpinner />
            </div>
          }
        >
          <SettingsForm />
        </Suspense>
      </div>
    </PageContainer>
  );
}
