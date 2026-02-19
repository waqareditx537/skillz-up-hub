import { z } from "zod";

export const courseFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Course title must be at least 3 characters")
    .max(200, "Course title must be less than 200 characters"),
  description: z
    .string()
    .trim()
    .max(5000, "Description must be less than 5000 characters")
    .optional(),
  price: z
    .number()
    .int()
    .min(0, "Price must be a positive number")
    .max(1000000, "Price seems unreasonably high"),
  mrp: z
    .number()
    .int()
    .min(0, "MRP must be a positive number")
    .max(1000000, "MRP seems unreasonably high"),
  features: z
    .array(
      z.string().trim().max(500, "Feature description too long")
    )
    .min(1, "At least one feature is required")
    .max(20, "Maximum 20 features allowed"),
}).refine((data) => data.mrp >= data.price, {
  message: "MRP must be greater than or equal to price",
  path: ["mrp"],
});

export const paymentProviderSchema = z.object({
  account_number: z
    .string()
    .trim()
    .max(500, "Account number must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  instructions: z
    .string()
    .trim()
    .max(1000, "Instructions must be less than 1000 characters")
    .optional(),
  active: z.boolean().optional(),
});

export type CourseFormData = z.infer<typeof courseFormSchema>;
export type PaymentProviderData = z.infer<typeof paymentProviderSchema>;
