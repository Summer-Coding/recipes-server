import { ApiError, User, Session } from '@supabase/supabase-js';

export type SupabaseSignInResult = {
  user: User | null;
  session: Session | null;
  error: ApiError | null;
};

export type SupabaseSignUpResult =
  | {
      user: User;
      data: User;
      error: null;
    }
  | {
      user: null;
      data: null;
      error: ApiError;
    };

export const defaultError: ApiError = {
  message: 'Unauthorized',
  status: 401,
};

export const defaultUser: User = {
  id: 'id',
  email: 'test@test.com',
  app_metadata: {},
  user_metadata: {
    roles: ['user', 'admin'],
  },
  aud: 'aud',
  created_at: 'createdAt',
};

export const defaultSession: Session = {
  access_token: 'accessToken',
  token_type: 'tokenType',
  user: { ...defaultUser },
};
