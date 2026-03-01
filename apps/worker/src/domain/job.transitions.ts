import { JobStatus } from "@repo/types";


const allowedTransitions: Record<JobStatus, JobStatus[]> = {
    PENDING: ["QUEUED"],
    QUEUED: ["RUNNING"],
    RUNNING: ["COMPLETED", "FAILED"],
    COMPLETED: [],
    FAILED: ["QUEUED"]
}


export const canTransition = (
    from: JobStatus,
    to: JobStatus
):boolean => {
    return allowedTransitions[from].includes(to);
}