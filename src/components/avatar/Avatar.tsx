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

interface AvatarProps {
  url: string | null;
  onUpload: (filePath: string) => void;
  fallback: string;
}

export function Avatar({ url, onUpload, fallback }: AvatarProps) {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      const file = event.target.files?.[0];
      if (!file) return;

      // 验证文件类型和大小
      const fileType = file.type;
      if (!fileType.startsWith("image/")) {
        throw new Error("请上传图片文件");
      }

      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > 5) {
        throw new Error("文件大小不能超过5MB");
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("未找到用户");

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      onUpload(fileName);

      toast({
        title: "上传成功",
        description: "头像已更新",
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "上传失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <AvatarUI className="h-24 w-24">
        <AvatarImage src={url || undefined} alt="Avatar" />
        <AvatarFallback>{fallback}</AvatarFallback>
      </AvatarUI>
      <div>
        <label htmlFor="avatar-upload">
          <Button
            variant="outline"
            disabled={uploading}
            onClick={() => document.getElementById("avatar-upload")?.click()}
          >
            {uploading ? "上传中..." : "更换头像"}
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
