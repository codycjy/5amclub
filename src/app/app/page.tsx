"use client";

import { Suspense } from "react";
import { CheckinProvider } from "@/contexts/CheckinContext";
import { CheckinForm } from "@/components/checkin/CheckinForm";
import { CheckinCalendar } from "@/components/checkin/CheckinCalendar";
import { CheckinList } from "@/components/checkin/CheckinList";
import { SimpleFriendList } from "@/components/friends/SimpleFriendList";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// 定义Friend接口
interface Friend {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  status: string;
}

export default function AppHomePage() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const supabase = createClient();

  const fetchFriends = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) return;

    const { data, error } = await supabase
      .from("friends")
      .select("*")
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

    if (error) {
      console.error("Error fetching friends:", error);
      return;
    }

    setFriends(data || []);
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  return (
    <CheckinProvider>
      <main className="container mx-auto px-4 py-6">
        <div className="flex">
          {/* 左侧可折叠好友列表 */}
          <div
            className={`transition-all duration-300 ease-in-out ${
              isCollapsed ? "w-12" : "w-64"
            } flex-shrink-0 relative`}
          >
            {/* 折叠按钮 */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute -right-3 top-2 z-10 bg-white shadow-md rounded-full"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>

            {/* 好友列表内容 */}
            <div
              className={`${
                isCollapsed ? "opacity-0" : "opacity-100"
              } transition-opacity duration-300`}
            >
              <Suspense fallback={<LoadingSpinner />}>
                <SimpleFriendList friends={friends} />
              </Suspense>
            </div>
          </div>

          {/* 主要内容区域 */}
          <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6 ml-6">
            {/* 中间内容区 */}
            <div className="md:col-span-2">
              <CheckinForm />
              <div className="mt-6">
                <Suspense fallback={<LoadingSpinner />}>
                  <CheckinList />
                </Suspense>
              </div>
            </div>

            {/* 右侧日历 */}
            <div className="md:col-span-1">
              <Suspense fallback={<LoadingSpinner />}>
                <CheckinCalendar />
              </Suspense>
            </div>
          </div>
        </div>
      </main>
    </CheckinProvider>
  );
}
