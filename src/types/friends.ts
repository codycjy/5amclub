// src/types/friend.ts

export interface Friend {
  id: number;
  user1_id: string;
  user2_id: string;
  created_at: string;
}

export interface FriendRequest {
  id: number;
  sender_id: string;
  receiver_id: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  user_id: string;
  username: string;
  avatar_url: string | null;
}
