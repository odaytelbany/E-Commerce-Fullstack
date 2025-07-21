import dotenv from "dotenv"
dotenv.config();

import Redis from "ioredis"
export const redis = new Redis(process.env.UPSTASH_REDIS_URL);
