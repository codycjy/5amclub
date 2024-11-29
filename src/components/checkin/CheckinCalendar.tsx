"use client";

import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { createClient } from "@/lib/supabase/client";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

type StreakInfo = {
  current_streak: number;
  longest_streak: number;
  total_checkins: number;
};

// 辅助函数：转换UTC日期到本地日期字符串
function toLocalDateString(utcDate: string): string {
  const date = new Date(utcDate);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];
}

export function CheckinCalendar() {
  const [value, setValue] = useState<Value>(new Date());
  const [checkinDates, setCheckinDates] = useState<string[]>([]);
  const [streakInfo, setStreakInfo] = useState<StreakInfo>({
    current_streak: 0,
    longest_streak: 0,
    total_checkins: 0,
  });
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      // 获取打卡记录
      const { data: checkinData, error: checkinError } = await supabase
        .from("checkins")
        .select("created_at");

      if (checkinError) {
        console.error("Error fetching checkins:", checkinError);
        return;
      }

      // 将UTC时间转换为本地日期
      const dates = checkinData.map((checkin) =>
        toLocalDateString(checkin.created_at)
      );
      setCheckinDates(dates);

      // 获取连续打卡信息
      const { data: streakData, error: streakError } = await supabase.rpc(
        "get_streak_info"
      );

      if (streakError) {
        console.error("Error fetching streak info:", streakError);
        return;
      }

      setStreakInfo(streakData[0]);
    }

    fetchData();
  });

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-center mb-2">打卡统计</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-green-50 p-2 rounded">
            <div className="text-2xl font-bold text-green-600">
              {streakInfo.current_streak}
            </div>
            <div className="text-sm text-gray-600">当前连续</div>
          </div>
          <div className="bg-blue-50 p-2 rounded">
            <div className="text-2xl font-bold text-blue-600">
              {streakInfo.longest_streak}
            </div>
            <div className="text-sm text-gray-600">最长连续</div>
          </div>
          <div className="bg-purple-50 p-2 rounded">
            <div className="text-2xl font-bold text-purple-600">
              {streakInfo.total_checkins}
            </div>
            <div className="text-sm text-gray-600">总打卡</div>
          </div>
        </div>
      </div>

      <Calendar
        onChange={setValue}
        value={value}
        tileClassName={({ date }) => {
          // 转换日历日期为本地日期字符串进行比较
          const dateStr = toLocalDateString(date.toISOString());
          return checkinDates.includes(dateStr) ? "bg-green-200" : null;
        }}
      />
    </div>
  );
}
