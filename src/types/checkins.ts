export enum MoodType {
  HAPPY = 1,
  NEUTRAL = 2,
  SAD = 3,
  ANGRY = 4,
  THINKING = 5,
}

export const moodEmojis: Record<MoodType, string> = {
  [MoodType.HAPPY]: "😊",
  [MoodType.NEUTRAL]: "😐",
  [MoodType.SAD]: "😢",
  [MoodType.ANGRY]: "😡",
  [MoodType.THINKING]: "🤔",
};

export interface Checkin {
  id: number;
  created_at: string;
  mood: MoodType;
  content: string;
  city?: string;
  country?: string;
  lat?: number;
  lon?: number;
  user_id: string;
  local_date: string;
  updated_at: string;
}
