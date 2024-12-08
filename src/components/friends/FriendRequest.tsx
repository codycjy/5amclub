"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Avatar as AvatarUI,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface FriendRequestsProps {
  incomingRequests: any[];
  onRequestHandled: () => void;
}

export const FriendRequests: React.FC<FriendRequestsProps> = ({
  incomingRequests,
  onRequestHandled,
}) => {
  const { t } = useTranslation();
  const supabase = createClient();

  const handleAccept = async (requestId: number) => {
    const { error } = await supabase
      .from("friend_requests")
      .update({
        status: "accepted",
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (error) {
      console.error("Error accepting friend request:", error);
      return;
    }
    toast({
      title: t("friendRequests.toast.accepted"),
      variant: "default",
    });
    onRequestHandled();
  };

  const handleReject = async (requestId: number) => {
    const { error } = await supabase
      .from("friend_requests")
      .update({
        status: "rejected",
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (error) {
      console.error("Error rejecting friend request:", error);
      return;
    }
    toast({
      title: t("friendRequests.toast.rejected"),
      variant: "default",
    });
    onRequestHandled();
  };

  if (incomingRequests.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-2">{t("friendRequests.title")}</h2>
        <p>{t("friendRequests.noRequests")}</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">{t("friendRequests.title")}</h2>
      <ul className="space-y-4">
        {incomingRequests.map((request) => (
          <li
            key={request.id}
            className="flex items-center justify-between p-4 bg-gray-100 rounded-lg"
          >
            <FriendRequestItem request={request} />
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => handleAccept(request.id)}
              >
                {t("friendRequests.acceptButton")}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleReject(request.id)}
              >
                {t("friendRequests.rejectButton")}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

const FriendRequestItem: React.FC<{ request: any }> = ({ request }) => {
  const { t } = useTranslation();
  const supabase = createClient();
  const [senderInfo, setSenderInfo] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);

  const fetchSenderInfo = async () => {
    const { data: requestData, error: requestError } = await supabase
      .from("friend_requests")
      .select("sender_id")
      .eq("id", request.id)
      .single();

    if (requestError) {
      console.error("Error fetching friend request:", requestError);
      return;
    }

    const { data: userData, error: userError } = await supabase
      .from("user_settings")
      .select("username, avatar_url")
      .eq("user_id", requestData.sender_id)
      .single();

    if (userError) {
      console.error("Error fetching user info:", userError);
      return;
    }

    setSenderInfo({
      username: userData.username,
      avatar_url: userData.avatar_url,
    });

    if (userData.avatar_url) {
      const { data: signedUrl } = await supabase.storage
        .from("avatars")
        .createSignedUrl(userData.avatar_url, 3600);

      if (signedUrl) {
        setAvatarUrl(signedUrl.signedUrl);
      }
    }
  };

  useEffect(() => {
    fetchSenderInfo();
  }, [request.id]);

  return (
    <div className="flex items-center gap-3">
      <AvatarUI className="h-10 w-10">
        <AvatarImage 
          src={avatarUrl} 
          alt={senderInfo?.username || t("friendRequests.unknownUser")} 
        />
        <AvatarFallback>
          {senderInfo?.username?.[0]?.toUpperCase() || "U"}
        </AvatarFallback>
      </AvatarUI>
      <span className="font-medium">
        {senderInfo?.username || t("friendRequests.unknownUser")}
      </span>
    </div>
  );
};