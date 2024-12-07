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

    // 获取好友的 user_id
    const friendIds = friends.map((friend) =>
      friend.user1_id === user.id ? friend.user2_id : friend.user1_id
    );

    // 获取好友的基本信息
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

    // 为每个头像获取签名URL
    const friendsWithSignedUrls = await Promise.all(
      (data || []).map(async (friend) => {
        let signed_avatar_url;
        if (friend.avatar_url) {
          signed_avatar_url = await getSignedUrl(friend.avatar_url);
        }

        // 查找对应的打卡信息
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
  
    // 调用我们创建的删除好友函数
    const { error } = await supabase.rpc('delete_friendship', {
      friend_id: friendId
    });
  
    if (error) {
      console.error("Error deleting friend:", error);
      toast({
        title: "删除失败",
        description: "删除好友时发生错误",
        variant: "destructive",
      });
    } else {
      toast({
        title: "好友删除成功",
        description: "你已经成功删除了这个好友",
        variant: "default",
      });
      // 从当前列表中移除这个好友
      setFriendsInfo(prev => prev.filter(friend => friend.user_id !== friendId));
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
                <div>
                  <span className="font-medium">
                    {friend.username || "未知用户"}
                  </span>
                  <div className="text-sm text-gray-600">
                    当前连续打卡: {friend.current_streak} 天
                  </div>
                  <div className="text-sm text-gray-600">
                    最长连续打卡: {friend.longest_streak} 天
                  </div>
                  <div className="text-sm text-gray-600">
                    总打卡次数: {friend.total_checkins} 次
                  </div>
                </div>
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
