const { z } = require("zod");

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

const createTeamSchema = z.object({
  body: z
    .object({
      teamName: z
        .string()
        .trim()
        .min(3, "Team name must be at least 3 characters")
        .max(30, "Team name cannot exceed 30 characters")
        .regex(
          /^[A-Za-z0-9 _-]+$/,
          "Team name can contain only letters, numbers, spaces, underscore and hyphen",
        ),
    })
    .strip(),
});

const teamIdParamSchema = z.object({
  params: z.object({
    teamId: objectId,
  }),
});

const playerIdParamSchema = z.object({
  params: z.object({
    playerId: objectId,
  }),
});

const newCaptainIdParamSchema = z.object({
  params: z.object({
    newCaptainId: objectId,
  }),
});

module.exports = {
  createTeamSchema,
  teamIdParamSchema,
  playerIdParamSchema,
  newCaptainIdParamSchema,
};
