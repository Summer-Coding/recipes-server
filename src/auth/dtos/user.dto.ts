import { AuthUser, UserIdentity } from '@supabase/supabase-js';

export class UserDto implements AuthUser {
  id: string;
  app_metadata: { [key: string]: any; provider?: string };
  user_metadata: { [key: string]: any };
  aud: string;
  confirmation_sent_at?: string;
  recovery_sent_at?: string;
  email_change_sent_at?: string;
  new_email?: string;
  invited_at?: string;
  action_link?: string;
  email?: string;
  phone?: string;
  created_at: string;
  confirmed_at?: string;
  email_confirmed_at?: string;
  phone_confirmed_at?: string;
  last_sign_in_at?: string;
  role?: string;
  updated_at?: string;
  identities?: UserIdentity[];
}
