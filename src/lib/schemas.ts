import { z } from 'zod';

const BaseEarningRecordSchema = z.object({
  id: z.string().min(1, "Record ID cannot be empty"),
  amount: z.number().finite("Earnings amount must be a finite number").nonnegative("Earnings amount must be non-negative (equal to or greater than zero)"),
  date: z.string().regex(/^\d{4}-\d{2}$/, "Billing date must follow the monthly ledger format (YYYY-MM)"),
  verifiedBy: z.literal('Argyle'),
  argyleTimestamp: z.string().min(1, "Argyle timestamp cannot be empty"),
  status: z.enum(['Growing', 'Stable', 'Seasonal', 'Declining']),
});

// Platform-level schema constraints
export const UberEarningSchema = BaseEarningRecordSchema.extend({
  platform: z.literal('Uber'),
  category: z.enum(['rideshare', 'delivery']),
});

export const DoorDashEarningSchema = BaseEarningRecordSchema.extend({
  platform: z.literal('DoorDash'),
  category: z.literal('delivery'),
});

export const UpworkEarningSchema = BaseEarningRecordSchema.extend({
  platform: z.literal('Upwork'),
  category: z.enum(['freelance_tech', 'freelance_creative']),
});

export const FiverrEarningSchema = BaseEarningRecordSchema.extend({
  platform: z.literal('Fiverr'),
  category: z.enum(['freelance_creative', 'freelance_tech']),
});

export const LyftEarningSchema = BaseEarningRecordSchema.extend({
  platform: z.literal('Lyft'),
  category: z.literal('rideshare'),
});

export const InstacartEarningSchema = BaseEarningRecordSchema.extend({
  platform: z.literal('Instacart'),
  category: z.literal('delivery'),
});

// Fallback schema for generic/unspecified platforms to preserve compatibility
export const GenericEarningSchema = BaseEarningRecordSchema.extend({
  platform: z.string().min(1, "Platform name must be specified"),
  category: z.string().min(1, "Classification category is required")
});

// Unified Union schema to enable targeted platform-level parsing and generic safe fallback
export const EarningRecordSchema = z.union([
  UberEarningSchema,
  DoorDashEarningSchema,
  UpworkEarningSchema,
  FiverrEarningSchema,
  LyftEarningSchema,
  InstacartEarningSchema,
  GenericEarningSchema,
]);

export type ValidatedEarningRecord = z.infer<typeof EarningRecordSchema>;

/**
 * Helper function to validate a batch of array records
 * returns an object of successful validations and error insights.
 */
export function validateEarningsBatch(records: any[]) {
  const validRecords: any[] = [];
  const invalidRecords: { record: any; errors: string[] }[] = [];

  records.forEach((rec, idx) => {
    const parseResult = EarningRecordSchema.safeParse(rec);
    if (parseResult.success) {
      validRecords.push(parseResult.data);
    } else {
      const errorMessages = parseResult.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`);
      invalidRecords.push({
        record: rec,
        errors: errorMessages
      });
      console.warn(`[ZOD VALIDATION FAILED] Skip record at index ${idx}:`, errorMessages, rec);
    }
  });

  return {
    validRecords,
    invalidRecords,
    hasFailures: invalidRecords.length > 0
  };
}


