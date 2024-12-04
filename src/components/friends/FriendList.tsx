"use client";

import { createClient } from "@/lib/supabase/client";
import {
  Avatar as AvatarUI,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface FriendInfo {
  user_id: string;
  username: string;
  avatar_url?: string;
  signed_avatar_url?: string;
}

interface FriendListProps {
  friends: any[];
}

export const FriendList: React.FC<FriendListProps> = ({ friends }) => {
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

    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    // 获取好友的 user_id
    const friendIds = friends.map((friend) =>
      friend.user1_id === user.id ? friend.user2_id : friend.user1_id
    );

    const { data, error } = await supabase
      .from("user_settings")
      .select("user_id, username, avatar_url")
      .in("user_id", friendIds);

    if (error) {
      console.error("Error fetching friends info:", error);
      return;
    }

    // 为每个头像获取签名URL
    const friendsWithSignedUrls = await Promise.all(
      (data || []).map(async (friend) => {
        let signed_avatar_url;
        if (friend.avatar_url) {
          signed_avatar_url = await getSignedUrl(friend.avatar_url);
        }
        return {
          ...friend,
          signed_avatar_url,
        };
      })
    );

    setFriendsInfo(friendsWithSignedUrls);
  };

  useEffect(() => {
    fetchFriendsInfo();
  }, [friends]);

  const handleRemoveFriend = async (friendId: string) => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    const { data: friendship, error: friendshipError } = await supabase
      .from("friends")
      .select("*")
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .or(`user1_id.eq.${friendId},user2_id.eq.${friendId}`)
      .maybeSingle();

    if (friendshipError) {
      console.error("Error fetching friendship:", friendshipError);
      return;
    }

    if (friendship) {
      const { error: deleteError } = await supabase
        .from("friends")
        .delete()
        .eq("id", friendship.id);

      if (deleteError) {
        console.error("Error deleting friend:", deleteError);
      } else {
        alert("已成功删除好友");
        // 重新获取好友列表
        fetchFriendsInfo();
      }
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">你的好友</h2>
      {friendsInfo.length === 0 ? (
        <p>你还没有好友。</p>
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
                    alt={friend.username || "用户头像"}
                  />
                  <AvatarFallback>
                    {friend.username?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </AvatarUI>
                <span className="font-medium">
                  {friend.username || "未知用户"}
                </span>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleRemoveFriend(friend.user_id)}
              >
                删除
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
