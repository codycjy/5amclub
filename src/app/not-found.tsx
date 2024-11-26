import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container mx-auto max-w-md p-4 h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center">
      <h2 className="text-2xl font-bold mb-4">页面未找到</h2>
      <p className="text-muted-foreground mb-6">抱歉，您访问的页面不存在。</p>
      <Button asChild>
        <Link href="/">返回首页</Link>
      </Button>
    </div>
  );
}
