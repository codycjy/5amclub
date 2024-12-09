// src/app/friends/page.tsx

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { FriendList } from "@/components/friends/FriendList";
import { FriendRequests } from "@/components/friends/FriendRequest";
import { SendFriendRequest } from "@/components/friends/SendFriendRequest";

export default function FriendsPage() {
  const [friends, setFriends] = useState<any[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchFriends = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    const { data, error } = await supabase
      .from("friends")
      .select("user1_id, user2_id, created_at")
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

    if (error) {
      console.error("Error fetching friends:", error);
      return;
    }

    setFriends(data || []);
  };

  const fetchFriendRequests = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    // Incoming requests
    const { data: incoming, error: incomingError } = await supabase
      .from("friend_requests")
      .select("id, sender_id, receiver_id, status, created_at")
      .eq("receiver_id", user.id)
      .eq("status", "pending");

    if (incomingError) {
      console.error("Error fetching incoming friend requests:", incomingError);
      return;
    }

    // Sent requests
    const { error: sentError } = await supabase
      .from("friend_requests")
      .select("id, sender_id, receiver_id, status, created_at")
      .eq("sender_id", user.id)
      .eq("status", "pending");

    if (sentError) {
      console.error("Error fetching sent friend requests:", sentError);
      return;
    }

    setIncomingRequests(incoming || []);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchFriends();
      await fetchFriendRequests();
      setLoading(false);
    };

    fetchData();

    // 订阅数据库变化以实现实时更新（可选）
    const friendsSubscription = supabase
      .channel("realtime:friends")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "friends" },
        () => fetchFriends(),
      )
      .subscribe();

    const requestsSubscription = supabase
      .channel("realtime:friend_requests")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "friend_requests" },
        () => fetchFriendRequests(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(friendsSubscription);
      supabase.removeChannel(requestsSubscription);
    };
  }, []);

  if (loading) {
    return <div className="p-4">加载中...</div>;
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">好友</h1>
      <SendFriendRequest onRequestSent={fetchFriendRequests} />
      <div className="mt-8">
        <FriendRequests
          incomingRequests={incomingRequests}
          onRequestHandled={fetchFriendRequests}
        />
      </div>
      <div className="mt-8">
        <FriendList friends={friends} />
      </div>
    </div>
  );
}
