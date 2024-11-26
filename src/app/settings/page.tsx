import { Suspense } from "react";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { SettingsForm } from "@/components/settings/SettingsForm";

async function getSettings() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const { data: settings } = await supabase
    .from("user_settings")
    .select("*")
    .single();

  return settings;
}

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-2xl mx-auto">
        <Suspense fallback={<div>加载中...</div>}>
          <SettingsForm initialData={settings} />
        </Suspense>
      </div>
    </div>
  );
}
