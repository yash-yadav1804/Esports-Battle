const { z } = require("zod");

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

const validMaps = [
  "Erangel",
  "Miramar",
  "Sanhok",
  "Vikendi",
  "Livik",
  "Karakin",
];

const createMatchRoomSchema = z.object({
  params: z.object({
    tournamentId: objectId,
  }),

  body: z
    .object({
      matchNumber: z.coerce
        .number()
        .int("Match number must be a whole number")
        .min(1, "Match number must be at least 1")
        .max(100, "Match number cannot exceed 100"),

      map: z.enum(validMaps).optional(),

      roomId: z.coerce
        .number()
        .int("Room ID must be a whole number")
        .min(1, "Room ID is required"),

      roomPassword: z
        .string()
        .trim()
        .min(3, "Room password must be at least 3 characters")
        .max(50, "Room password cannot exceed 50 characters"),

      matchTime: z.coerce.date({
        errorMap: () => ({ message: "Valid match time is required" }),
      }),
    })
    .strip(),
});

const updateMatchRoomSchema = z.object({
  params: z.object({
    matchRoomId: objectId,
  }),

  body: z
    .object({
      matchNumber: z.coerce
        .number()
        .int("Match number must be a whole number")
        .min(1, "Match number must be at least 1")
        .max(100, "Match number cannot exceed 100")
        .optional(),

      map: z.enum(validMaps).optional(),

      roomId: z.coerce
        .number()
        .int("Room ID must be a whole number")
        .min(1, "Room ID is required")
        .optional(),

      roomPassword: z
        .string()
        .trim()
        .min(3, "Room password must be at least 3 characters")
        .max(50, "Room password cannot exceed 50 characters")
        .optional(),

      matchTime: z.coerce.date().optional(),
    })
    .strip(),
});

const matchRoomIdParamSchema = z.object({
  params: z.object({
    matchRoomId: objectId,
  }),
});

module.exports = {
  createMatchRoomSchema,
  updateMatchRoomSchema,
  matchRoomIdParamSchema,
};
