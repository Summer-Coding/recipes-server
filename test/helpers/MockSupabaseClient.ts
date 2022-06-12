import { UserCredentials, AdminUserAttributes } from '@supabase/supabase-js';
import { SupabaseClient } from '@supabase/supabase-js';

export class MockSupabaseClient extends SupabaseClient {
  public static auth = class {
    public async signUp(
      { email, password, phone }: UserCredentials,
      options: { data?: object },
    ) {
      return null;
    }

    public async signIn(
      { email, phone, password, refreshToken, provider, oidc }: UserCredentials,
      { shouldCreateUser: boolean },
    ) {
      return null;
    }

    static api = class {
      public async getUserById(id: string) {
        return null;
      }
      public async updateUserById(id: string, attributes: AdminUserAttributes) {
        return null;
      }
    };
  };
}
