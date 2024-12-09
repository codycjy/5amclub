"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface SendFriendRequestProps {
  onRequestSent: () => void;
}

export const SendFriendRequest: React.FC<SendFriendRequestProps> = ({
  onRequestSent,
}) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSendRequest = async () => {
    if (!email) {
      toast({
        title: t("sendFriendRequest.toast.invalidUsername.title"),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const currentUser = (await supabase.auth.getUser()).data.user;
    if (!currentUser) {
      toast({
        title: t("sendFriendRequest.toast.notLoggedIn.title"),
        description: t("sendFriendRequest.toast.notLoggedIn.description"),
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const { data: currentUserData, error: currentUserError } = await supabase
      .from("user_settings")
      .select("username")
      .eq("user_id", currentUser.id)
      .maybeSingle();

    if (currentUserError || !currentUserData) {
      console.error("Error getting current user:", currentUserError);
      toast({
        title: t("sendFriendRequest.toast.getUserError.title"),
        description: t("sendFriendRequest.toast.getUserError.description"),
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const { data: userSettings, error: userError } = await supabase
      .from("user_settings")
      .select("user_id, username")
      .eq("username", email)
      .maybeSingle();

    if (userError || !userSettings) {
      console.error("Error finding user:", userError, email);
      toast({
        title: t("sendFriendRequest.toast.userNotFound.title"),
        description: t("sendFriendRequest.toast.userNotFound.description"),
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const receiverId = userSettings.user_id;

    const { error } = await supabase.from("friend_requests").insert({
      sender_id: currentUser.id,
      receiver_id: receiverId,
      sender_username: currentUserData.username,
      status: "pending",
    });

    if (error) {
      console.error("Error sending friend request:", error);
      toast({
        title: t("sendFriendRequest.toast.sendError.title"),
        description: t("sendFriendRequest.toast.sendError.description"),
        variant: "destructive",
      });
    } else {
      toast({
        title: t("sendFriendRequest.toast.success.title"),
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
        placeholder={t("sendFriendRequest.placeholder")}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button onClick={handleSendRequest} disabled={loading}>
        {loading
          ? t("sendFriendRequest.sending")
          : t("sendFriendRequest.sendButton")}
      </Button>
    </div>
  );
};
