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
import {createClient} from "@/lib/supabase/client";

const formSchema = z.object({
  mood: z.string().min(1, "请选择心情"),
  content: z.string().min(1, "请输入内容").max(500, "内容不能超过500字"),
});

export function CheckinForm() {
  const [loading, setLoading] = useState(false);
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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const { error } = await supabase.from("checkins").insert({
        mood: values.mood,
        content: values.content,
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
  }

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
