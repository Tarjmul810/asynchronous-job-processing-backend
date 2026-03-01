import { FastifyReply, FastifyRequest } from "fastify";
import { createJobInput } from "../config/jobs.schema";
import {
  createJobService,
  getJobService,
  getJobServices,
} from "../services/job.service";
import { APIResponse } from "@repo/types";
import { success } from "zod";
import { jobQueryInput } from "../config/job.query.schema";

export const jobController = async (
  request: FastifyRequest<{ Body: createJobInput }>,
  reply: FastifyReply,
) => {
  const result = await createJobService(request.body);

  if (!result.ok) {
    const response: APIResponse<null> = {
      success: false,
      error: result.error.type,
    };

    return reply.status(400).send(response);
  }

  const response: APIResponse<{ jobId: string }> = {
    success: true,
    data: result.value,
  };

  return reply.status(201).send(response);
};

export const getJobController = async (
  request: FastifyRequest<{ Params: { jobId: string } }>,
  reply: FastifyReply,
) => {
  const result = await getJobService(request.params.jobId);


  if (!result.ok) {
    const response: APIResponse<null> = {
      success: false,
      error: result.error.type,
    };

    return reply.status(404).send(response);
  }

  const response: APIResponse<typeof result.value> = {
    success: true,
    data: result.value,
  };

  return reply.status(200).send(response);
};

export const getJobsController = async (
  request: FastifyRequest<{
    Querystring: jobQueryInput
  }>,
  reply: FastifyReply,
) => {
  const { status, limit, offset } = request.query;

  const parsedLimit = limit ? Number(limit) : 10;
  const parsedOffset = offset ? Number(offset) : 0;

  const result = await getJobServices(status , parsedLimit, parsedOffset);

  if (!result.ok) {
    return reply.status(404).send({
      success: false,
      data: result.error,
    });
  }

  return reply.status(200).send({
    success: true,
    data: result.value,
  });
};
