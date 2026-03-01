export type JobNotFoundError = {
  type: "JOB_NOT_FOUND";
  jobId: string;
};

export type JobAlreadyCompletedError = {
  type: "JOB_ALREADY_COMPLETED";
  jobId: string;
};

export type JobMaxAttemptsExceededError = {
  type: "JOB_MAX_ATTEMPTS_EXCEEDED";
  jobId: string;
};

export type JobServiceError =
  | JobNotFoundError
  | JobAlreadyCompletedError
  | JobMaxAttemptsExceededError;

