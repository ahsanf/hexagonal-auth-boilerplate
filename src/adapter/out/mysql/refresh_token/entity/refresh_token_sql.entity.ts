export type RefreshTokenSqlEntity = {
  id?: number;
  user_id: number;
  token: string;
  expired_at: Date;
  created_at?: Date;
  updated_at?: Date;
  user_agent?: string;
  ip_address?: string;
  mac_address?: string;
};