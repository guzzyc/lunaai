import { z } from "zod";

export const companySchema = z.object({
  name: z.string().min(1, "Name is required"),
  status: z.string().min(1, "Status is required"),
  origin: z.string().min(1, "Origin is required"),

  url: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || /^https?:\/\//.test(val), {
      message: "Invalid URL",
    }),
  notes: z.array(z.string()).optional().default([]),
  resourceUrls: z
    .array(
      z
        .string()
        .trim()
        .refine((val) => !val || /^https?:\/\//.test(val), {
          message: "Invalid URL",
        })
    )
    .optional()
    .default([]),
  tags: z.array(z.string()).optional().default([]),
});

export type CreateCompanyType = z.infer<typeof companySchema>;
