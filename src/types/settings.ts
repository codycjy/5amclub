export interface UserSettings {
  id: number;
  user_id: string;
  checkin_start_time: string; // 格式 "HH:mm"
  checkin_end_time: string; // 格式 "HH:mm"
  timezone: string;
  created_at: string;
  updated_at: string;
}
