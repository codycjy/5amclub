"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { MoodType } from "@/types/checkins";

interface Checkin {
  id: number;
  created_at: string;
  mood: MoodType;
  content: string;
  user_id: string;
  updated_at: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

interface StreakInfo {
  current_streak: number;
  longest_streak: number;
  total_checkins: number;
}

interface CheckinContextType {
  checkins: Checkin[];
  checkinDates: string[];
  streakInfo: StreakInfo;
  refreshCheckins: () => Promise<void>;
  refreshCalendarData: () => Promise<void>;
}

const CheckinContext = createContext<CheckinContextType>({
  checkins: [],
  checkinDates: [],
  streakInfo: {
    current_streak: 0,
    longest_streak: 0,
    total_checkins: 0,
  },
  refreshCheckins: async () => {},
  refreshCalendarData: async () => {},
});

function toLocalDateString(utcDate: string): string {
  const date = new Date(utcDate);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];
}

export function CheckinProvider({ children }: { children: ReactNode }) {
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [checkinDates, setCheckinDates] = useState<string[]>([]);
  const [streakInfo, setStreakInfo] = useState<StreakInfo>({
    current_streak: 0,
    longest_streak: 0,
    total_checkins: 0,
  });
  const supabase = createClient();

  const refreshCheckins = useCallback(async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("checkins")
        .select("*")
        .eq("user_id", userData?.user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // 确保 mood 字段符合 MoodType 枚举
      const validatedCheckins = (data || []).map((checkin) => ({
        ...checkin,
        mood: checkin.mood as MoodType,
      }));

      setCheckins(validatedCheckins);
    } catch (error) {
      console.error("Error fetching checkins:", error);
      setCheckins([]);
    }
  }, []);

  const refreshCalendarData = useCallback(async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const { data: checkinData, error: checkinError } = await supabase
        .from("checkins")
        .select("created_at")
        .eq("user_id", userData?.user?.id);

      if (checkinError) throw checkinError;
      const dates = checkinData.map((checkin) =>
        toLocalDateString(checkin.created_at),
      );
      setCheckinDates(dates);

      const { data: streakData, error: streakError } =
        await supabase.rpc("get_streak_info");

      if (streakError) throw streakError;
      setStreakInfo(streakData[0]);
    } catch (error) {
      console.error("Error fetching calendar data:", error);
    }
  }, []);

  return (
    <CheckinContext.Provider
      value={{
        checkins,
        checkinDates,
        streakInfo,
        refreshCheckins,
        refreshCalendarData,
      }}
    >
      {children}
    </CheckinContext.Provider>
  );
}

export const useCheckins = () => {
  const context = useContext(CheckinContext);
  if (!context) {
    throw new Error("useCheckins must be used within a CheckinProvider");
  }
  return context;
};
