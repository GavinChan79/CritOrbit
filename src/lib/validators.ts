import { z } from "zod";
import { categoryValues, taskTypeValues } from "@/lib/constants";
import { isTaskTypeAllowedForCategory } from "@/lib/helpers";

const baseRequirementSchema = z.object({
  category: z.enum(categoryValues),
  taskType: z.enum(taskTypeValues),
  urgency: z.enum(["RELAXED", "NORMAL", "ASAP"]),
  deadline: z.string().min(1, "Please select a deadline."),
  budget: z
    .string()
    .optional()
    .transform((value) => (value?.trim() ? Number(value) : undefined))
    .refine((value) => value === undefined || Number.isFinite(value), "Enter a valid budget."),
  description: z.string().min(6, "Tell us a little more about the assignment."),
});

function validateCategoryTaskType(
  value: { category: string; taskType: string },
  ctx: z.RefinementCtx,
) {
  if (!isTaskTypeAllowedForCategory(value.category, value.taskType)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["taskType"],
      message: "This task type is not valid for the selected course / field.",
    });
  }
}

export const requirementSchema = baseRequirementSchema.superRefine(validateCategoryTaskType);

export const leadMatchPayloadSchema = z.object({
  draftId: z.string().min(1, "Draft id is required."),
  selectedHelperId: z.string().min(1, "Helper selection is required."),
});

export const legacyLeadPayloadSchema = z.object({
  category: z.enum(categoryValues),
  taskType: z.enum(taskTypeValues),
  urgency: z.enum(["RELAXED", "NORMAL", "ASAP"]),
  deadline: z.string().min(1, "Please select a deadline."),
  budget: z
    .union([z.string(), z.number(), z.undefined(), z.null()])
    .transform((value) => {
      if (value === undefined || value === null || value === "") {
        return undefined;
      }

      if (typeof value === "number") {
        return Number.isFinite(value) ? value : undefined;
      }

      const trimmed = value.trim();
      if (!trimmed) {
        return undefined;
      }

      const parsed = Number(trimmed);
      return Number.isFinite(parsed) ? parsed : Number.NaN;
    })
    .refine((value) => value === undefined || Number.isFinite(value), "Enter a valid budget."),
  description: z.string().min(6, "Tell us a little more about the assignment."),
}).superRefine(validateCategoryTaskType);

export const draftLeadSchema = legacyLeadPayloadSchema;

export const registerSchema = z.object({
  name: z.string().min(2, "Please enter your name."),
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Use at least 8 characters."),
});

export const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Use at least 8 characters."),
});

export const helperTaskTypesSchema = z.enum([
  ...taskTypeValues,
]);

export const helperSpecialtySchema = z.object({
  code: z.string().min(1, "Specialty code is required."),
  label: z.string().min(1, "Specialty label is required."),
  taskTypes: z.array(helperTaskTypesSchema).min(1, "Select at least one task type."),
});

export const helperSchema = z.object({
  name: z.string().min(2, "Helper name is required."),
  category: z.enum(categoryValues),
  shortBio: z.string().min(12, "Add a short bio."),
  displayOrder: z.coerce.number().int().min(0, "Display order must be 0 or more."),
  isActive: z.boolean(),
  specialties: z.array(helperSpecialtySchema).min(1, "Add at least one specialty."),
});

export const adminLeadUpdateSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "ASSIGNED", "COMPLETED"]),
  assignedHelperId: z.string().min(1).nullable(),
  dealClosed: z.boolean(),
  dealValue: z
    .union([z.number(), z.null()])
    .refine((value) => value === null || (Number.isFinite(value) && value >= 0), "Enter a valid deal value."),
  notes: z.string(),
});
