import { Worker } from "bullmq";
import { redis } from "./lib/redis";
import { pool } from "./lib/db";
import { err } from "@repo/types";

const worker = new Worker(
  "jobQueue",
  async (job) => {
    const { jobId } = job.data;
    console.log(`Processing job ${jobId}`);

    const updateRunning = await pool.query(
      `UPDATE jobs
    SET status = $1,
        updated_at = NOW()
    WHERE id = $2 AND status = $3
    RETURNING id`,
      ["RUNNING", jobId, "QUEUED"],
    );

    if (updateRunning.rowCount === 0) {
      console.log("Invalid transition to RUNNING");
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 300));

    const updateCompleted = await pool.query(
      `UPDATE jobs
       SET status = $1,
           result = $2,
           updated_at = NOW()
       WHERE id = $3 AND status = $4
       RETURNING id`,
      ["COMPLETED", JSON.stringify({ done: true }), jobId, "RUNNING"],
    );

    if (updateCompleted.rowCount === 0) {
      console.log("Invalid transition to COMPLETED");
      return;
    }

    console.log(`Job ${jobId} completed`);
  },
  { connection: redis },
);

worker.on("failed", async (job, error) => {
  if (!job) return 

  const { jobId } = job.data;

  const updateAttempts = await pool.query(
    `UPDATE jobs
    SET attempts = attempts + 1,
        updated_at = NOW()
    WHERE id = $1 
    RETURNING attempts, max_attempts`,
    [jobId],
  )


  const { attempts, max_attempts } = updateAttempts.rows[0]

  console.log("Job failed:", jobId, attempts, max_attempts)

  if (attempts >= max_attempts) {
    await pool.query(
       `UPDATE jobs
      SET status = $1,
          error_message = $2,
          updated_at = NOW()
      WHERE id = $3
      RETURNING id`,
      ["FAILED", error.message, jobId],
    )
    console.log("Job marked FAILED:", jobId);
  } else {
    await pool.query(
      `UPDATE jobs
      SET status = $1,
          updated_at = NOW()
      WHERE id = $2
      RETURNING id`,
      ["QUEUED", jobId],
    )
    console.log("Job re-queued:", jobId);
  }
}
);


console.log("Worker started...");
