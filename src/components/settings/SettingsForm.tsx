"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/avatar/Avatar";

const formSchema = z
  .object({
    username: z
      .string()
      .min(3, "用户名至少3个字符")
      .max(20, "用户名最多20个字符")
      .regex(/^[a-zA-Z0-9_-]+$/, "用户名只能包含字母、数字、下划线和横线"),
    checkin_start_time: z.string(),
    checkin_end_time: z.string(),
    avatar_url: z.string().optional(),
  })
  .refine(
    (data) => {
      const start = new Date(`2000-01-01T${data.checkin_start_time}`);
      const end = new Date(`2000-01-01T${data.checkin_end_time}`);
      return end.getTime() - start.getTime() >= 3600000;
    },
    {
      message: "打卡时间段至少需要1小时",
      path: ["checkin_end_time"],
    }
  );

type FormValues = z.infer<typeof formSchema>;

export function SettingsForm() {
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      checkin_start_time: "05:00",
      checkin_end_time: "06:00",
      avatar_url: undefined,
    },
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) throw userError;

        if (user) {
          setUserEmail(user.email || "");
        }

        const { data: settings, error } = await supabase
          .from("user_settings")
          .select("*")
          .single();

        if (error) {
          if (error.code !== "PGRST116") {
            console.error("Error loading settings:", error);
          }
          return;
        }

        if (settings) {
          // 如果有头像，获取签名URL
          if (settings.avatar_url) {
            const { data, error } = await supabase.storage
              .from("avatars")
              .createSignedUrl(settings.avatar_url, 3600);

            if (!error && data) {
              console.log(data.signedUrl);
              setAvatarUrl(data.signedUrl);
            }
          }

          form.reset({
            username: settings.username || "",
            checkin_start_time: settings.checkin_start_time,
            checkin_end_time: settings.checkin_end_time,
            avatar_url: settings.avatar_url,
          });
        }
      } catch (error) {
        console.error("Error loading settings:", error);
        toast({
          title: "加载设置失败",
          description: "请刷新页面重试",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, [form, supabase, toast]);

  async function onSubmit(values: FormValues) {
    setLoading(true);
    try {
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("未找到用户");

      // 检查用户名是否已存在
      if (values.username) {
        const { data: existingUser } = await supabase
          .from("user_settings")
          .select("username")
          .eq("username", values.username)
          .neq("user_id", user.id)
          .single();

        if (existingUser) {
          toast({
            title: "用户名已存在",
            description: "请选择其他用户名",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      }

      const { error } = await supabase.from("user_settings").upsert(
        {
          user_id: user.id,
          username: values.username,
          checkin_start_time: values.checkin_start_time,
          checkin_end_time: values.checkin_end_time,
          timezone: userTimezone,
          avatar_url: values.avatar_url,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      );

      if (error) throw error;

      toast({
        title: "设置已保存",
        description: "您的个人信息已更新",
      });

      router.refresh();
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "保存失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div>加载中...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>个人设置</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col items-center gap-4 mb-6">
              <Avatar
                url={avatarUrl}
                onUpload={async (fileName) => {
                  const { data, error } = await supabase.storage
                    .from("avatars")
                    .createSignedUrl(fileName, 3600);

                  if (!error && data) {
                    setAvatarUrl(data.signedUrl);
                    form.setValue("avatar_url", fileName);
                  }
                }}
                fallback={userEmail?.[0]?.toUpperCase()}
              />
            </div>

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>用户名</FormLabel>
                  <FormControl>
                    <Input placeholder="设置你的用户名" {...field} />
                  </FormControl>
                  <FormDescription>
                    这将是你的唯一标识符。如果未设置，将显示你的邮箱：
                    {userEmail}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="checkin_start_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>打卡开始时间</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="checkin_end_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>打卡结束时间</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="text-sm text-muted-foreground">
              当前时区: {Intl.DateTimeFormat().resolvedOptions().timeZone}
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "保存中..." : "保存设置"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
