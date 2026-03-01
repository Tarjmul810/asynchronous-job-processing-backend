import { Result, ok, JobServiceError, err, JobStatus } from "@repo/types";
import { createJobInput } from "../config/jobs.schema";
import { findJobById, findJobs, insertJob } from "../repositories/job.repository";
import { enqueueJob } from "../queue/job.producer";
import { pool } from "../lib/db";

export const createJobService = async (
  input: createJobInput
): Promise<Result<{ jobId: string }, JobServiceError>> => {

  const client = await pool.connect()

 try {

    await client.query("BEGIN");

    const jobId = await insertJob(client, input.payload);

    enqueueJob(jobId);

    await client.query("COMMIT");

    return ok({ jobId });

  } catch (error) {
    await client.query("ROLLBACK");

    return err({
      type: "JOB_NOT_FOUND",
      jobId: "unknown"
    });
  } finally {
    client.release();
  }
};

export const getJobService = async (id: string) => {

  const job = await findJobById(id);

  if (!job) {
    return err({
      type: "JOB_NOT_FOUND",
      jobId: id
    });
  }

  return ok(job);

}

export const getJobServices = async(
  status?: JobStatus,
  limit?: number,
  offset?: number
) => {

  const jobs = await findJobs(status, limit, offset);
  return ok(jobs);
}
