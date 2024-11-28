"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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

// Define types for API responses
interface IpifyResponse {
  ip: string;
}

interface IpApiResponse {
  query: string;
  status: "success" | "fail";
  country?: string;
  city?: string;
  lat?: number;
  lon?: number;
}

const formSchema = z.object({
  mood: z.string().min(1, "请选择心情"),
  content: z.string().max(500, "内容不能超过500字"),
});

export function CheckinForm() {
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mood: "",
      content: "",
    },
  });

  const fetchWithTimeout = async (url: string, timeout: number): Promise<Response> => {
    const controller = new AbortController();
    const promise = fetch(url, { signal: controller.signal });
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
    let city = "", country = "", lat: number | null = null, lon: number | null = null;
    
    try {
      // Fetch user's public IP
      const ipResponse = await fetchWithTimeout("https://api.ipify.org?format=json", 5000);
      const ipData: IpifyResponse = await ipResponse.json();
      const ip = ipData.ip;

      // Fetch location data using the IP
      const locationResponse = await fetchWithTimeout(`http://ip-api.com/json/${ip}`, 5000);
      const locationData: IpApiResponse = await locationResponse.json();

      if (locationData.status === "success" && locationData.city && locationData.country && locationData.lat && locationData.lon) {
        city = locationData.city;
        country = locationData.country;
        lat = typeof locationData.lat === "number" ? locationData.lat : null;
        lon = typeof locationData.lon === "number" ? locationData.lon : null;
      }
    } catch (error) {
      console.error("Error fetching location data:", error);
    }

    try {
      const { error } = await supabase.from("checkins").insert({
        mood: values.mood,
        content: values.content,
        city: city,
        country: country,
        lat: lat,
        lon: lon,
      });

      if (error) throw error;

      toast({
        title: "打卡成功！",
        description: "继续保持每天记录的好习惯吧！",
      });

      form.reset();
      router.refresh();
    } catch (error) {
      console.error("Error submitting checkin:", error);
      toast({
        title: "打卡失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const moods = ["😊 开心", "😐 一般", "😢 难过", "😡 生气", "🤔 思考"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>今日打卡</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="mood"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>今天心情如何？</FormLabel>
                  <div className="flex gap-2 flex-wrap">
                    {moods.map((mood) => (
                      <Button
                        key={mood}
                        type="button"
                        variant={field.value === mood ? "default" : "outline"}
                        onClick={() => field.onChange(mood)}
                      >
                        {mood}
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
                  <FormLabel>写点什么吧</FormLabel>
                  <FormControl>
                    <Textarea placeholder="记录一下今天的心情..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loading}>
              {loading ? "提交中..." : "提交打卡"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}