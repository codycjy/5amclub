"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
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
import { useAvatarUrl } from "@/hooks/useAvatarUrl";

export function SettingsForm() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>("");
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const avatarUrl = useAvatarUrl(avatarPath);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const formSchema = z
    .object({
      username: z
        .string()
        .transform(str => str === '' ? null : str)
        .nullable()
        .refine(
          (val) => {
            if (val === null) return true;
            return val.length >= 3 && val.length <= 20 && /^[a-zA-Z0-9_-]+$/.test(val);
          },
          {
            message: t('settings.form.validation.username')
          }
        ),
      checkin_start_time: z.string(),
      checkin_end_time: z.string(),
      avatar_url: z.string().nullable(),
    })
    .refine(
      (data) => {
        const start = new Date(`2000-01-01T${data.checkin_start_time}`);
        const end = new Date(`2000-01-01T${data.checkin_end_time}`);
        return end.getTime() - start.getTime() >= 3600000;
      },
      {
        message: t('settings.form.validation.timeRange'),
        path: ["checkin_end_time"],
      }
    );

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: null,
      checkin_start_time: "05:00",
      checkin_end_time: "06:00",
      avatar_url: null,
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
          .eq("user_id", user?.id)
          .single();

        if (error) {
          if (error.code !== "PGRST116") {
            console.error("Error loading settings:", error);
          }
          return;
        }

        if (settings) {
          if (settings.avatar_url) {
            setAvatarPath(settings.avatar_url);
          }
          
          form.reset({
            username: settings.username || null,
            checkin_start_time: settings.checkin_start_time,
            checkin_end_time: settings.checkin_end_time,
            avatar_url: settings.avatar_url || null,
          });
        }
      } catch (error) {
        console.error("Error loading settings:", error);
        toast({
          title: t('settings.errors.load.title'),
          description: t('settings.errors.load.description'),
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, [form, supabase, toast, t]);

  async function onSubmit(values: FormValues) {
    setLoading(true);
    try {
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error(t('settings.errors.userNotFound'));

      if (values.username && values.username.trim() !== '') {
        const { data: existingUser } = await supabase
          .from("user_settings")
          .select("username")
          .eq("username", values.username)
          .neq("user_id", user.id)
          .single();

        if (existingUser) {
          toast({
            title: t('settings.errors.usernameTaken.title'),
            description: t('settings.errors.usernameTaken.description'),
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      }

      const { error } = await supabase.from("user_settings").upsert(
        {
          user_id: user.id,
          username: values.username && values.username.trim() !== '' ? values.username : null,
          checkin_start_time: values.checkin_start_time,
          checkin_end_time: values.checkin_end_time,
          timezone: userTimezone,
          avatar_url: values.avatar_url || null,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      );

      if (error) throw error;

      toast({
        title: t('settings.success.title'),
        description: t('settings.success.description'),
      });

      router.refresh();
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: t('settings.errors.save.title'),
        description: t('settings.errors.save.description'),
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
          <div>{t('settings.loading')}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col items-center gap-4 mb-6">
            <Avatar
    url={avatarUrl}
    onUpload={async (fileName) => {
      setAvatarPath(fileName);
      form.setValue("avatar_url", fileName);
    }}
    fallback={userEmail?.[0]?.toUpperCase()}
  />
              <FormDescription>
                {t('settings.form.avatarDescription')}
              </FormDescription>
            </div>

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('settings.form.labels.username')}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={t('settings.form.placeholders.username')}
                      {...field} 
                      value={field.value || ''} 
                    />
                  </FormControl>
                  <FormDescription>
                    {t('settings.form.descriptions.username', {
                      current: field.value || userEmail
                    })}
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
                  <FormLabel>{t('settings.form.labels.startTime')}</FormLabel>
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
                  <FormLabel>{t('settings.form.labels.endTime')}</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="text-sm text-muted-foreground">
              {t('settings.form.timezone', {
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
              })}
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? t('settings.form.saving') : t('settings.form.save')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}