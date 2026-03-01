import { FastifyInstance } from "fastify";
import {
  getJobController,
  getJobsController,
  jobController,
} from "../controllers/job.controller";
import { validateBody } from "../middleware/validate.middleware";
import { createJobInput, createJobSchema } from "../config/jobs.schema";
import { findJobById } from "../repositories/job.repository";
import { jobQueryInput, jobQuerySchema } from "../config/job.query.schema";

export const registerJobRoutes = async (app: FastifyInstance) => {
  app.post<{ Body: createJobInput }>(
    "/jobs",
    { preHandler: validateBody(createJobSchema) },
    jobController,
  );
};

export const searchJobById = async (app: FastifyInstance) => {
  app.get<{ Params: { jobId: string } }>("/jobs/:jobId", getJobController);
};

export const searchJobs = async (app: FastifyInstance) => {
  app.get<{
    Querystring: jobQueryInput
  }>("/jobs", getJobsController);
};
