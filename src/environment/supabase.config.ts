import { registerAs } from '@nestjs/config';

export default registerAs('supabase', () => ({
  url: process.env.SUPABASE_URL as string,
  key: process.env.SUPABASE_KEY as string,
  privateKey: process.env.SUPABASE_PRIVATE_KEY as string,
  jwtSecret: process.env.SUPABASE_JWT_SECRET as string,
}));

export interface SupabaseConfig {
  url: string;
  key: string;
  privateKey: string;
  jwtSecret: string;
}
