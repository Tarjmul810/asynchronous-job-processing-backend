export type JobStatus =
  | "PENDING"
  | "QUEUED"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED";

type BaseJob = {
  id: string;
  payload: unknown;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  updatedAt: Date;
};

export type PendingJob = BaseJob & {
  status: "PENDING";
};

export type QueuedJob = BaseJob & {
  status: "QUEUED";
};

export type RunningJob = BaseJob & {
  status: "RUNNING";
};

export type CompletedJob = BaseJob & {
  status: "COMPLETED";
  result: unknown;
};

export type FailedJob = BaseJob & {
  status: "FAILED";
  errorMessage: string;
};

export type Job =
  | PendingJob
  | QueuedJob
  | RunningJob
  | CompletedJob
  | FailedJob;