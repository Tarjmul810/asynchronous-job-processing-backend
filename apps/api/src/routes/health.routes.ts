import { FastifyInstance } from "fastify";
import { pool } from "../lib/db";
import { redis } from "../lib/redis";

export const registerHealthRoutes = async (app: FastifyInstance) => {
  app.get("/health", async () => {
    try {
        await pool.query("SELECT 1");
        await redis.ping();

        return { status: "Healthy"}
    } catch (error) {
      return { status: "Unhealthy"}
    }
  });
};
