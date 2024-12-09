"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useCheckins } from "@/contexts/CheckinContext";
import { MoodType, moodEmojis } from "@/types/checkins";

interface IpInfoResponse {
  ip: string;
  hostname: string;
  city: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  org: string;
  postal: string;
  timezone: string;
  readme: string;
}

export function CheckinForm() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const { refreshCheckins, refreshCalendarData } = useCheckins();

  const formSchema = z.object({
    mood: z.nativeEnum(MoodType, {
      errorMap: () => ({ message: t("checkinForm.validation.moodRequired") }),
    }),
    content: z.string().max(500, t("checkinForm.validation.contentMaxLength")),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mood: undefined,
      content: "",
    },
  });

  const fetchWithTimeout = async (
    url: string,
    timeout: number,
    headers: HeadersInit = {},
  ): Promise<Response> => {
    const controller = new AbortController();
    const promise = fetch(url, { signal: controller.signal, headers: headers });
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await promise;
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      console.error("Request timed out:", error);
      throw new Error("Request timed out");
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    let city = "",
      country = "",
      lat: number | null = null,
      lon: number | null = null;

    try {
      const user = await supabase.auth.getUser();
      const { data: settings } = await supabase
        .from("user_settings")
        .select("timezone")
        .eq("user_id", user.data.user?.id)
        .single();

      if (!settings || settings.timezone !== userTimezone) {
        await supabase
          .from("user_settings")
          .upsert({ timezone: userTimezone }, { onConflict: "user_id" });
      }

      const locationResponse = await fetchWithTimeout(
        `https://ipapi.co/json/`,
        5000,
      );
      const locationData: IpInfoResponse = await locationResponse.json();

      if (
        locationData.city &&
        locationData.country &&
        locationData.longitude &&
        locationData.latitude
      ) {
        city = locationData.city;
        country = locationData.country;
        lat = locationData.latitude;
        lon = locationData.longitude;
      } else {
        throw new Error("Missing required location data");
      }
    } catch (error) {
      console.error("Error fetching location data:", error);
    }

    try {
      const { error, status } = await supabase.from("checkins").insert({
        mood: values.mood,
        content: values.content,
        city: city,
        country: country,
        lat: lat,
        lon: lon,
      });

      if (error) {
        if (status === 409) {
          toast({
            title: t("checkinForm.toast.alreadyCheckedIn.title"),
            description: t("checkinForm.toast.alreadyCheckedIn.description"),
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: t("checkinForm.toast.success.title"),
          description: t("checkinForm.toast.success.description"),
        });
        await refreshCheckins();
        await refreshCalendarData();
      }
      form.reset();
      router.refresh();
    } catch (error) {
      console.error("Error submitting checkin:", error);
      toast({
        title: t("checkinForm.toast.error.title"),
        description: t("checkinForm.toast.error.description"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const moods = [
    { type: MoodType.HAPPY, label: t("checkinForm.moods.happy") },
    { type: MoodType.NEUTRAL, label: t("checkinForm.moods.neutral") },
    { type: MoodType.SAD, label: t("checkinForm.moods.sad") },
    { type: MoodType.ANGRY, label: t("checkinForm.moods.angry") },
    { type: MoodType.THINKING, label: t("checkinForm.moods.thinking") },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("checkinForm.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="mood"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("checkinForm.moodLabel")}</FormLabel>
                  <div className="flex gap-2 flex-wrap">
                    {moods.map(({ type, label }) => (
                      <Button
                        key={type}
                        type="button"
                        variant={field.value === type ? "default" : "outline"}
                        onClick={() => field.onChange(type)}
                      >
                        {moodEmojis[type]} {label}
                      </Button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("checkinForm.contentLabel")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("checkinForm.contentPlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loading}>
              {loading
                ? t("checkinForm.submitting")
                : t("checkinForm.submitButton")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
