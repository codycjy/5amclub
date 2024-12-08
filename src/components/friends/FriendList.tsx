"use client";

import { createClient } from "@/lib/supabase/client";
import {
  Avatar as AvatarUI,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface FriendInfo {
  user_id: string;
  username: string;
  avatar_url?: string;
  signed_avatar_url?: string;
  current_streak: number;
  longest_streak: number;
  total_checkins: number;
}

interface FriendListProps {
  friends: any[];
}

export const FriendList: React.FC<FriendListProps> = ({ friends }) => {
  const { t } = useTranslation();
  const supabase = createClient();
  const [friendsInfo, setFriendsInfo] = useState<FriendInfo[]>([]);

  const getSignedUrl = async (avatarPath: string) => {
    const { data } = await supabase.storage
      .from("avatars")
      .createSignedUrl(avatarPath, 3600);
    return data?.signedUrl;
  };

  const fetchFriendsInfo = async () => {
    if (friends.length === 0) {
      setFriendsInfo([]);
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) return;

    const friendIds = friends.map((friend) =>
      friend.user1_id === user.id ? friend.user2_id : friend.user1_id
    );

    const { data } = await supabase
      .from("user_settings")
      .select("user_id, username, avatar_url")
      .in("user_id", friendIds);

    const { data: streakData, error: streakError } = await supabase.rpc(
      "get_all_friend_streak",
      { in_user_id: user.id }
    );

    if (streakError) {
      console.error("Error fetching friends streak info:", streakError);
      return;
    }

    const friendsWithSignedUrls = await Promise.all(
      (data || []).map(async (friend) => {
        let signed_avatar_url;
        if (friend.avatar_url) {
          signed_avatar_url = await getSignedUrl(friend.avatar_url);
        }

        const streakInfo = streakData?.find(
          (streak: any) => streak.user_id === friend.user_id
        );

        return {
          ...friend,
          signed_avatar_url,
          current_streak: streakInfo?.current_streak || 0,
          longest_streak: streakInfo?.longest_streak || 0,
          total_checkins: streakInfo?.total_checkins || 0,
        };
      })
    );

    setFriendsInfo(friendsWithSignedUrls);
  };

  useEffect(() => {
    fetchFriendsInfo();
  }, [friends]);

  const handleRemoveFriend = async (friendId: string) => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) return;

    const { error } = await supabase.rpc('delete_friendship', {
      friend_id: friendId
    });

    if (error) {
      console.error("Error deleting friend:", error);
      toast({
        title: t("friendList.toast.removeError.title"),
        description: t("friendList.toast.removeError.description"),
        variant: "destructive",
      });
    } else {
      toast({
        title: t("friendList.toast.removeSuccess.title"),
        description: t("friendList.toast.removeSuccess.description"),
        variant: "default",
      });
      setFriendsInfo(prev => prev.filter(friend => friend.user_id !== friendId));
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">{t("friendList.title")}</h2>
      {friendsInfo.length === 0 ? (
        <p>{t("friendList.noFriends")}</p>
      ) : (
        <ul className="space-y-4">
          {friendsInfo.map((friend) => (
            <li
              key={friend.user_id}
              className="flex items-center justify-between p-4 bg-gray-100 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <AvatarUI className="h-10 w-10">
                  <AvatarImage
                    src={friend.signed_avatar_url}
                    alt={friend.username || t("friendList.unknownUser")}
                  />
                  <AvatarFallback>
                    {friend.username?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </AvatarUI>
                <div>
                  <span className="font-medium">
                    {friend.username || t("friendList.unknownUser")}
                  </span>
                  <div className="text-sm text-gray-600">
                    {t("friendList.stats.currentStreak", { count: friend.current_streak })}
                  </div>
                  <div className="text-sm text-gray-600">
                    {t("friendList.stats.longestStreak", { count: friend.longest_streak })}
                  </div>
                  <div className="text-sm text-gray-600">
                    {t("friendList.stats.totalCheckins", { count: friend.total_checkins })}
                  </div>
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleRemoveFriend(friend.user_id)}
              >
                {t("friendList.removeButton")}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};