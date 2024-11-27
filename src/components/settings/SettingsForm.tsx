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
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

const formSchema = z
  .object({
    checkin_start_time: z.string(),
    checkin_end_time: z.string(),
  })
  .refine(
    (data) => {
      const start = new Date(`2000-01-01T${data.checkin_start_time}`);
      const end = new Date(`2000-01-01T${data.checkin_end_time}`);
      return end.getTime() - start.getTime() >= 3600000; // 至少1小时
    },
    {
      message: "打卡时间段至少需要1小时",
      path: ["checkin_end_time"],
    }
  );

export function SettingsForm() {
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      checkin_start_time: "05:00",
      checkin_end_time: "06:00",
    },
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const { data: settings, error } = await supabase
          .from("user_settings")
          .select("*")
          .single();

        if (error) {
          console.error("Error loading settings:", error);
          return;
        }

        if (settings) {
          form.reset({
            checkin_start_time: settings.checkin_start_time,
            checkin_end_time: settings.checkin_end_time,
          });
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, [form, supabase]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const { error } = await supabase.from("user_settings").upsert(
        {
          checkin_start_time: values.checkin_start_time,
          checkin_end_time: values.checkin_end_time,
          timezone: userTimezone,
        },
        {
          onConflict: "user_id",
        }
      );

      if (error) throw error;

      toast({
        title: "设置保存成功！",
        description: "打卡时间已更新",
        variant: "default",
      });
      router.refresh();
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "保存设置失败",
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
        <CardTitle>打卡设置</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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