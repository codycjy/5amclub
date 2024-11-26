import { SignInForm } from "@/components/auth/SignInForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthPage() {
  return (
    <div className="container mx-auto max-w-md p-4 h-screen flex items-center">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>登录</CardTitle>
        </CardHeader>
        <CardContent>
          <SignInForm />
        </CardContent>
      </Card>
    </div>
  );
}
