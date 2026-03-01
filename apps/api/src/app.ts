import Fastify from "fastify";
import rateLimit from "@fastify/rate-limit";
import cors from "@fastify/cors"
import { registerHealthRoutes } from "./routes/health.routes";
import { registerJobRoutes, searchJobById, searchJobs } from "./routes/job.routes";

export const buildApp = async() => {
  const app = Fastify({
    logger: {
      transport: {
        target: "pino-pretty",
      }
    }
  });

  app.register(cors, {
    origin: "*",
    methods: ["GET", "POST"],
  })

  await app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
  })

  registerHealthRoutes(app);
  registerJobRoutes(app);
  searchJobs(app);
  searchJobById(app)
  
  return app;
};