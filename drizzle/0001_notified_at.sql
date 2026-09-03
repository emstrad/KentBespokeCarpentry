-- Records when the single notification email for an enquiry was sent.
ALTER TABLE "enquiries" ADD COLUMN IF NOT EXISTS "notified_at" timestamp with time zone;
