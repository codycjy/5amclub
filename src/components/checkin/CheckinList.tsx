"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useCheckins } from "@/contexts/CheckinContext";

export function CheckinList() {
  const { checkins, refreshCheckins } = useCheckins();
  const [userTimezone, setUserTimezone] = useState<string>("UTC");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await Promise.all([fetchUserSettings(), refreshCheckins()]);
      setLoading(false);
    };

    initData();
  }, []);

  const fetchUserSettings = async () => {
    try {
      const {data:userData} = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from("user_settings")
        .select("timezone")
        .eq("user_id", userData?.user?.id)
        .single();

      if (error) throw error;
      setUserTimezone(data?.timezone || "UTC");
    } catch (error) {
      console.error("Error fetching user settings:", error);
      setUserTimezone("UTC");
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat("zh-CN", {
        timeZone: userTimezone,
        year: "numeric",
        month: "numeric",
        day: "numeric",
        weekday: "long",
      }).format(date);
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateStr;
    }
  };

  if (loading) {
    return <div>加载中...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">打卡记录</h2>
      {checkins.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-gray-500">
              还没有打卡记录哦，开始第一次打卡吧！
            </p>
          </CardContent>
        </Card>
      ) : (
        checkins.map((checkin) => (
          <Card key={checkin.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{formatDate(checkin.created_at)}</span>
                <span>{checkin.mood}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{checkin.content}</p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(checkin.created_at).toLocaleTimeString("zh-CN", {
                  timeZone: userTimezone,
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
