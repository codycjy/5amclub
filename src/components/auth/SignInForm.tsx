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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import supabase from "@/lib/supabase/client";

// Define the form schema type
const formSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(6, "密码至少6个字符"),
});

// Define the form values type
type FormValues = z.infer<typeof formSchema>;

export function SignInForm() {
  const [loading, setLoading] = useState<boolean>(false);
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
        });
        if (error) throw error;
        toast({
          title: "注册成功！",
          description: "请查看邮箱确认注册",
          variant: "default",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });
        if (error) throw error;
        toast({
          title: "登录成功！",
          variant: "default",
        });
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: isSignUp ? "注册失败" : "登录失败",
        description:
          error instanceof Error &&
          error.message === "Invalid login credentials"
            ? "邮箱或密码错误"
            : "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-center gap-4">
        <Button
          type="button"
          variant={isSignUp ? "outline" : "default"}
          onClick={() => setIsSignUp(false)}
        >
          登录
        </Button>
        <Button
          type="button"
          variant={isSignUp ? "default" : "outline"}
          onClick={() => setIsSignUp(true)}
        >
          注册
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>邮箱</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="your@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>密码</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="******" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "处理中..." : isSignUp ? "注册" : "登录"}
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm text-muted-foreground">
        {isSignUp ? (
          <>
            已有账号？{" "}
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={() => setIsSignUp(false)}
            >
              去登录
            </Button>
          </>
        ) : (
          <>
            还没有账号？{" "}
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={() => setIsSignUp(true)}
            >
              去注册
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
