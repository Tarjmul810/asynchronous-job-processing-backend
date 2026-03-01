import { z } from "zod";

export const jobQuerySchema = z.object({
    status: z.enum(["PENDING", "QUEUED", "RUNNING", "COMPLETED", "FAILED"]).optional(),
    limit: z.string().optional(),
    offset: z.string().optional(),
})

export type jobQueryInput = z.infer<typeof jobQuerySchema>