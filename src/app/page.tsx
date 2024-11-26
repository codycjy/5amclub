import { Suspense } from "react";
import { CheckinForm } from "@/components/checkin/CheckinForm";
import { CheckinCalendar } from "@/components/checkin/CheckinCalendar";
import { CheckinList } from "@/components/checkin/CheckinList";

export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <CheckinForm />
          <div className="mt-6">
            <Suspense fallback={<div>加载中...</div>}>
              <CheckinList />
            </Suspense>
          </div>
        </div>
        <div className="md:col-span-1">
          <Suspense fallback={<div>加载中...</div>}>
            <CheckinCalendar />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
