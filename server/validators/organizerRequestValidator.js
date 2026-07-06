const { z } = require("zod");

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

const createOrganizerRequestSchema = z.object({
  body: z
    .object({
      organizationName: z
        .string()
        .trim()
        .min(2, "Organization name must be at least 2 characters")
        .max(80, "Organization name cannot exceed 80 characters"),

      contactNumber: z
        .string()
        .trim()
        .regex(
          /^[0-9+\-\s]{10,18}$/,
          "Contact number must be valid and 10 to 18 characters",
        ),

      reason: z
        .string()
        .trim()
        .min(30, "Reason must be at least 30 characters")
        .max(1000, "Reason cannot exceed 1000 characters"),

      experience: z
        .string()
        .trim()
        .max(500, "Experience cannot exceed 500 characters")
        .optional()
        .or(z.literal("")),

      socialLink: z
        .string()
        .trim()
        .max(200, "Social link cannot exceed 200 characters")
        .optional()
        .or(z.literal("")),
    })
    .strip(),
});

const organizerRequestActionSchema = z.object({
  params: z.object({
    requestId: objectId,
  }),

  body: z
    .object({
      adminNote: z
        .string()
        .trim()
        .max(500, "Admin note cannot exceed 500 characters")
        .optional()
        .or(z.literal("")),
    })
    .strip()
    .optional(),
});

module.exports = {
  createOrganizerRequestSchema,
  organizerRequestActionSchema,
};
