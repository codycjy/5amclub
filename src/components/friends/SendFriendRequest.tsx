"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface SendFriendRequestProps {
  onRequestSent: () => void;
}

export const SendFriendRequest: React.FC<SendFriendRequestProps> = ({
  onRequestSent,
}) => {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSendRequest = async () => {
    if (!email) {
      toast({
        title: "请输入有效的用户名",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    // 获取当前用户ID
    const currentUser = (await supabase.auth.getUser()).data.user;
    if (!currentUser) {
      toast({
        title: "未登录",
        description: "请先登录后再操作",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // 获取当前用户的用户名
    const { data: currentUserData, error: currentUserError } = await supabase
      .from("user_settings")
      .select("username")
      .eq("user_id", currentUser.id)
      .maybeSingle();

    if (currentUserError || !currentUserData) {
      console.error("Error getting current user:", currentUserError);
      toast({
        title: "获取用户信息失败",
        description: "请稍后重试",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // 获取接收者用户 ID
    const { data: userSettings, error: userError } = await supabase
      .from("user_settings")
      .select("user_id, username")
      .eq("username", email)
      .maybeSingle();

    if (userError || !userSettings) {
      console.error("Error finding user:", userError, email);
      toast({
        title: "找不到该用户",
        description: "请检查用户名是否正确",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const receiverId = userSettings.user_id;

    // 创建好友请求
    const { error } = await supabase.from("friend_requests").insert({
      sender_id: currentUser.id,
      receiver_id: receiverId,
      sender_username: currentUserData.username,
      status: "pending",
    });

    if (error) {
      console.error("Error sending friend request:", error);
      toast({
        title: "发送好友请求失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    } else {
      toast({
        title: "已发送好友请求",
        variant: "default",
      });
      setEmail("");
      onRequestSent();
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        type="text"
        placeholder="输入用户名发送好友请求"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button onClick={handleSendRequest} disabled={loading}>
        {loading ? "发送中..." : "发送"}
      </Button>
    </div>
  );
};