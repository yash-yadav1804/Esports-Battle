const { z } = require("zod");

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

const createTournamentSchema = z.object({
  body: z
    .object({
      title: z
        .string()
        .trim()
        .min(3, "Tournament title must be at least 3 characters")
        .max(80, "Tournament title cannot exceed 80 characters"),

      game: z
        .string()
        .trim()
        .min(2, "Game name is required")
        .max(40, "Game name cannot exceed 40 characters"),

      mode: z
        .string()
        .trim()
        .min(2, "Mode is required")
        .max(30, "Mode cannot exceed 30 characters"),

      entryFee: z.coerce
        .number()
        .min(0, "Entry fee cannot be negative")
        .max(100000, "Entry fee is too high"),

      prizePool: z.coerce
        .number()
        .min(0, "Prize pool cannot be negative")
        .max(10000000, "Prize pool is too high"),

      maxTeams: z.coerce
        .number()
        .int("Max teams must be a whole number")
        .min(2, "At least 2 teams are required")
        .max(1000, "Max teams cannot exceed 1000"),

      startDate: z.coerce.date({
        errorMap: () => ({ message: "Valid start date is required" }),
      }),
    })
    .strip(),
});

const updateTournamentSchema = z.object({
  params: z.object({
    tournamentId: objectId,
  }),

  body: z
    .object({
      title: z
        .string()
        .trim()
        .min(3, "Tournament title must be at least 3 characters")
        .max(80, "Tournament title cannot exceed 80 characters")
        .optional(),

      game: z
        .string()
        .trim()
        .min(2, "Game name is required")
        .max(40, "Game name cannot exceed 40 characters")
        .optional(),

      mode: z
        .string()
        .trim()
        .min(2, "Mode is required")
        .max(30, "Mode cannot exceed 30 characters")
        .optional(),

      entryFee: z.coerce
        .number()
        .min(0, "Entry fee cannot be negative")
        .max(100000, "Entry fee is too high")
        .optional(),

      prizePool: z.coerce
        .number()
        .min(0, "Prize pool cannot be negative")
        .max(10000000, "Prize pool is too high")
        .optional(),

      maxTeams: z.coerce
        .number()
        .int("Max teams must be a whole number")
        .min(2, "At least 2 teams are required")
        .max(1000, "Max teams cannot exceed 1000")
        .optional(),

      startDate: z.coerce.date().optional(),
    })
    .strip(),
});

const tournamentIdParamSchema = z.object({
  params: z.object({
    tournamentId: objectId,
  }),
});

module.exports = {
  createTournamentSchema,
  updateTournamentSchema,
  tournamentIdParamSchema,
};
