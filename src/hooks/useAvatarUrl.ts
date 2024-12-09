// Create a new custom hook (e.g., in hooks/useAvatarUrl.ts)
import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

export function useAvatarUrl(avatarPath: string | null) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const supabase = createClient();

  // Use useMemo to memoize the getSignedUrl function
  const getSignedUrl = useMemo(() => {
    return async () => {
      if (avatarPath) {
        const { data } = await supabase.storage
          .from("avatars")
          .createSignedUrl(avatarPath, 3600);

        if (data) {
          setSignedUrl(data.signedUrl);
        }
      }
    };
  }, [avatarPath]); // Only recreate if avatarPath changes

  useEffect(() => {
    getSignedUrl();

    // Set up a refresh interval (optional - to refresh before URL expires)
    const interval = setInterval(getSignedUrl, 3000000); // Refresh every 50 minutes

    return () => clearInterval(interval);
  }, [getSignedUrl]);

  return signedUrl;
}
