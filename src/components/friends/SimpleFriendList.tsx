"use client";

import { createClient } from "@/lib/supabase/client";
import {
  Avatar as AvatarUI,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import { useState, useEffect } from "react";
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

export const SimpleFriendList: React.FC<FriendListProps> = ({ friends }) => {
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
      friend.user1_id === user.id ? friend.user2_id : friend.user1_id,
    );

    const { data } = await supabase
      .from("user_settings")
      .select("user_id, username, avatar_url")
      .in("user_id", friendIds);

    const { data: streakData, error: streakError } = await supabase.rpc(
      "get_all_friend_streak",
      { in_user_id: user.id },
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
          (streak: any) => streak.user_id === friend.user_id,
        );

        return {
          ...friend,
          signed_avatar_url,
          current_streak: streakInfo?.current_streak || 0,
          longest_streak: streakInfo?.longest_streak || 0,
          total_checkins: streakInfo?.total_checkins || 0,
        };
      }),
    );

    setFriendsInfo(friendsWithSignedUrls);
  };

  useEffect(() => {
    fetchFriendsInfo();
  }, [friends]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{t("friends.list.title")}</h2>
      {friendsInfo.length === 0 ? (
        <p className="text-gray-500">{t("friends.list.noFriends")}</p>
      ) : (
        <ul className="space-y-3">
          {friendsInfo.map((friend) => (
            <li
              key={friend.user_id}
              className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <AvatarUI className="h-8 w-8">
                <AvatarImage
                  src={friend.signed_avatar_url}
                  alt={t("friends.list.avatarAlt", {
                    username: friend.username,
                  })}
                />
                <AvatarFallback>
                  {friend.username?.[0]?.toUpperCase() ||
                    t("friends.list.unknownUserInitial")}
                </AvatarFallback>
              </AvatarUI>
              <div className="min-w-0">
                <div className="font-medium truncate">
                  {friend.username || t("friends.list.unknownUser")}
                </div>
                <div className="text-xs text-gray-500">
                  {t("friends.list.streakCount", {
                    count: friend.current_streak,
                  })}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
