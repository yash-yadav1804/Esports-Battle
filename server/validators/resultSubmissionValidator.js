const { z } = require("zod");

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

const submitResultSchema = z.object({
  body: z
    .object({
      tournamentId: objectId,
      matchRoomId: objectId,

      kills: z.coerce
        .number()
        .int("Kills must be a whole number")
        .min(0, "Kills cannot be negative")
        .max(100, "Kills cannot exceed 100"),

      position: z.coerce
        .number()
        .int("Position must be a whole number")
        .min(1, "Position must be at least 1")
        .max(100, "Position cannot exceed 100"),
    })
    .strip(),
});

const submissionIdParamSchema = z.object({
  params: z.object({
    submissionId: objectId,
  }),
});

const rejectSubmissionSchema = z.object({
  params: z.object({
    submissionId: objectId,
  }),

  body: z
    .object({
      adminNote: z
        .string()
        .trim()
        .min(3, "Rejection note must be at least 3 characters")
        .max(500, "Rejection note cannot exceed 500 characters"),
    })
    .strip(),
});

module.exports = {
  submitResultSchema,
  submissionIdParamSchema,
  rejectSubmissionSchema,
};
