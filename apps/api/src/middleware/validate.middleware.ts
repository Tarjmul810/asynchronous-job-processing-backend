import { FastifyRequest, FastifyReply } from "fastify";
import { ZodType } from "zod";

export const validateBody =  (schema: ZodType) => async (request: FastifyRequest, reply: FastifyReply) => {
    const result = await schema.safeParseAsync(request.body);

    if (!result.success) {
        return reply.status(404).send({
            success: false,
            error: "invalid payload"
        })
    }

    request.body = result.data;
}