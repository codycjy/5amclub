"use client";

import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useCheckins } from "@/contexts/CheckinContext";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

export function CheckinCalendar() {
  const [value, setValue] = useState<Value>(new Date());
  const { checkinDates, streakInfo, refreshCalendarData } = useCheckins();

  useEffect(() => {
    refreshCalendarData();
  }, [refreshCalendarData]);

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
          const dateStr = new Date(
            date.getTime() - date.getTimezoneOffset() * 60000
          )
            .toISOString()
            .split("T")[0];
          return checkinDates.includes(dateStr) ? "bg-green-200" : null;
        }}
      />
    </div>
  );
}
