import { z } from "zod";

export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(120),
  email: z.string().trim().email("Please enter a valid email").max(200),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  ideas: z.string().trim().max(5000).optional().or(z.literal("")),
  source: z.enum(["booking", "contact"]),
  /** When false, the email is sent later by POST /api/enquiry/[id]/send (booking modal). */
  notify: z.boolean().optional(),
  /** Honeypot: must be empty. Bots that autofill every field trip it. */
  company: z.string().max(0).optional().or(z.literal("")),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;

export const MAX_FILES = 8;
export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif", "image/gif", "application/pdf"];
