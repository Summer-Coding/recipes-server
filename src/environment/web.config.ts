import { registerAs } from '@nestjs/config';

export default registerAs('web', () => ({
  webUrl: process.env.WEB_URL as string,
}));

export interface WebConfig {
  webUrl: string;
}
