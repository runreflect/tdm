export interface Message {
  id: number,
  inserted_at: string,
  message?: string,
  user_id: string,
  channel_id: number,
}
