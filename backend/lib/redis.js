import dotenv from "dotenv"
dotenv.config();
console.log("Redis URL:", process.env.UPSTASH_REDIS_URL);

import Redis from "ioredis"
export const redis = new Redis(process.env.UPSTASH_REDIS_URL);
