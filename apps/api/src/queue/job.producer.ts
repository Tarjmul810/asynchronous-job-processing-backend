import { Queue } from "bullmq";
import { redis } from "../lib/redis";


export const jobQueue = new Queue("jobQueue", { connection: redis });

export const enqueueJob = async (jobId: string) => {

    try {
        await jobQueue.add(
            "processJob",
            { jobId },
            {
                attempts: 3,
                backoff: {
                    type: "exponential",
                    delay: 1000
                }
            }
        );
    } catch (error) {
    console.log("Error enqueuing job:", error);
    throw new Error("Failed to enqueue job");
    }
}