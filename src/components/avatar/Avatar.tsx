"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Avatar as AvatarUI,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface AvatarProps {
  url: string | null;
  onUpload: (filePath: string) => void;
  fallback: string;
}

export function Avatar({ url, onUpload, fallback }: AvatarProps) {
  const { t } = useTranslation();
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type and size
      const fileType = file.type;
      if (!fileType.startsWith("image/")) {
        throw new Error(t("avatar.errors.invalidType"));
      }

      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > 5) {
        throw new Error(t("avatar.errors.fileSize"));
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error(t("avatar.errors.userNotFound"));

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      onUpload(fileName);

      toast({
        title: t("avatar.success.title"),
        description: t("avatar.success.description"),
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: t("avatar.errors.uploadFailed.title"),
        description: t("avatar.errors.uploadFailed.description"),
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <AvatarUI className="h-24 w-24">
        <AvatarImage src={url || undefined} alt={t("avatar.altText")} />
        <AvatarFallback>{fallback}</AvatarFallback>
      </AvatarUI>
      <div>
        <label htmlFor="avatar-upload">
          <Button
            variant="outline"
            disabled={uploading}
            onClick={() => document.getElementById("avatar-upload")?.click()}
          >
            {uploading ? t("avatar.uploading") : t("avatar.changeAvatar")}
          </Button>
        </label>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          onChange={uploadAvatar}
          style={{ display: "none" }}
          disabled={uploading}
        />
      </div>
    </div>
  );
}
