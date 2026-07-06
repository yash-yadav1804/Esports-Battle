const { z } = require("zod");

const registerUserSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(60, "Name cannot exceed 60 characters")
        .regex(/^[A-Za-z\s]+$/, "Name can contain only letters and spaces"),

      email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Please provide a valid email"),

      password: z
        .string()
        .min(6, "Password must be at least 6 characters")
        .max(100, "Password cannot exceed 100 characters")
        .regex(
          /^(?=.*[A-Za-z])(?=.*\d).+$/,
          "Password must contain at least one letter and one number",
        ),

      ign: z
        .string()
        .trim()
        .min(2, "IGN must be at least 2 characters")
        .max(30, "IGN cannot exceed 30 characters"),

      bgmiUID: z
        .string()
        .trim()
        .regex(/^[0-9]{8,12}$/, "BGMI UID must be 8 to 12 digits"),
    })
    .strip(),
});

const loginUserSchema = z.object({
  body: z
    .object({
      email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Please provide a valid email"),

      password: z.string().min(1, "Password is required"),
    })
    .strip(),
});

module.exports = {
  registerUserSchema,
  loginUserSchema,
};
