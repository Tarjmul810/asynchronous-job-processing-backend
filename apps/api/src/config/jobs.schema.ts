import { z } from "zod";

export const createJobSchema = z.object({
    payload: z.unknown()
})

export type createJobInput = z.infer<typeof createJobSchema>