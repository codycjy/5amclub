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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

export function SignInForm() {
  const { t } = useTranslation();
  
  // Define the form schema type with translated messages
  const formSchema = z.object({
    email: z.string().email(t('auth.validation.email')),
    password: z.string().min(6, t('auth.validation.password')),
  });

  type FormValues = z.infer<typeof formSchema>;

  const [loading, setLoading] = useState<boolean>(false);
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

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
          options: {
            emailRedirectTo: `${location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        toast({
          title: t('auth.signup.success.title'),
          description: t('auth.signup.success.description'),
          variant: "default",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });
        if (error) throw error;
        toast({
          title: t('auth.signin.success'),
          variant: "default",
        });
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: isSignUp ? t('auth.signup.error.title') : t('auth.signin.error.title'),
        description:
          error instanceof Error &&
          error.message === "Invalid login credentials"
            ? t('auth.signin.error.invalidCredentials')
            : t('auth.error.tryAgain'),
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
          {t('auth.signin.action')}
        </Button>
        <Button
          type="button"
          variant={isSignUp ? "default" : "outline"}
          onClick={() => setIsSignUp(true)}
        >
          {t('auth.signup.action')}
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('auth.form.email')}</FormLabel>
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
                <FormLabel>{t('auth.form.password')}</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="******" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading 
              ? t('auth.form.processing')
              : isSignUp 
                ? t('auth.signup.action')
                : t('auth.signin.action')}
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm text-muted-foreground">
        {isSignUp ? (
          <>
            {t('auth.signup.haveAccount')}{" "}
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={() => setIsSignUp(false)}
            >
              {t('auth.signup.goToSignIn')}
            </Button>
          </>
        ) : (
          <>
            {t('auth.signin.noAccount')}{" "}
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={() => setIsSignUp(true)}
            >
              {t('auth.signin.goToSignUp')}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}