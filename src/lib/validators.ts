import { z } from "zod";
import {
  categoryValues,
  helperExperienceLevelValues,
  helperPriceAnchorValues,
  helperPriceTierValues,
  helperTrustLevelValues,
  helperResponseTimeOptions,
  helperDeliveryTimeOptions,
  helperStatusValues,
  helperTypeValues,
  taskTypeValues,
} from "@/lib/constants";
import { isTaskTypeAllowedForCategory } from "@/lib/helpers";
import {
  getHelperApplicationFileSizeLimit,
  helperApplicationUploadKinds,
  isAllowedApplicationFile,
  isHelperApplicationBlobPathname,
} from "@/lib/helper-applications";

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
  type: z.enum(helperTypeValues),
  teamSize: z
    .union([z.coerce.number().int().min(1, "Team size must be at least 1."), z.null(), z.undefined()])
    .transform((value) => (value === undefined ? null : value)),
  isVerified: z.boolean(),
  projectsCompleted: z.coerce.number().int().min(0, "Projects completed must be 0 or more."),
  experienceLevel: z.enum(helperExperienceLevelValues),
  trustLevel: z.enum(helperTrustLevelValues),
  responseTime: z.enum(helperResponseTimeOptions).optional(),
  deliveryTime: z.enum(helperDeliveryTimeOptions).optional(),
  repeatClients: z
    .union([z.coerce.number().int().min(0, "Repeat clients must be 0 or more."), z.null(), z.undefined()])
    .transform((value) => (value === undefined ? null : value)),
  priceTier: z.enum(helperPriceTierValues),
  submittedPriceAnchor: z.enum(helperPriceAnchorValues),
  priceAnchor: z.enum(helperPriceAnchorValues),
  priceLockedByAdmin: z.boolean(),
  status: z.enum(helperStatusValues),
  category: z.enum(categoryValues),
  shortBio: z.string().min(12, "Add a short bio."),
  portfolioNote: z.string().trim().optional().transform((value) => value || undefined),
  email: z.email("Enter a valid email address.").optional(),
  whatsappNumber: z
    .string()
    .trim()
    .regex(/^\d{9,15}$/, "Use digits only for WhatsApp number.")
    .optional(),
  displayOrder: z.coerce.number().int().min(0, "Display order must be 0 or more."),
  isActive: z.boolean(),
  specialties: z.array(helperSpecialtySchema).min(1, "Add at least one specialty."),
}).superRefine((value, ctx) => {
  if (value.type === "TEAM" && !value.teamSize) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["teamSize"],
      message: "Team size is required for Studio helpers.",
    });
  }

  if (value.type === "INDIVIDUAL" && value.teamSize) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["teamSize"],
      message: "Team size should only be used for Studio helpers.",
    });
  }

  if (
    (value.trustLevel === "VERIFIED_HELPER" || value.trustLevel === "TRUSTED_HELPER") &&
    !value.isVerified
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["trustLevel"],
      message: "Verified or trusted helpers must have identity verification approved.",
    });
  }

  const seenCodes = new Set<string>();
  value.specialties.forEach((specialty, index) => {
    const normalizedCode = specialty.code.trim().toLowerCase();
    if (seenCodes.has(normalizedCode)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["specialties", index, "label"],
        message: "Duplicate specialties are not allowed.",
      });
    }
    seenCodes.add(normalizedCode);
  });
});

export const helperApplicationSchema = z.object({
  name: z.string().min(2, "Full name is required."),
  type: z.enum(helperTypeValues),
  teamSize: z
    .union([z.coerce.number().int().min(1, "Team size must be at least 1."), z.null(), z.undefined()])
    .transform((value) => (value === undefined ? null : value)),
  category: z.enum(categoryValues),
  experience: z.enum(helperExperienceLevelValues),
  portfolioNote: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || undefined),
  priceAnchor: z.enum(helperPriceAnchorValues),
  email: z.email("Enter a valid email address."),
  whatsappNumber: z
    .string()
    .trim()
    .regex(/^\d{9,15}$/, "Use digits only for WhatsApp number."),
  confirmations: z.object({
    originalWork: z.literal(true),
    noScamGhosting: z.literal(true),
    platformLiability: z.literal(true),
    deadlinesCommunication: z.literal(true),
    serviceTerms: z.literal(true),
  }),
}).superRefine((value, ctx) => {
  if (value.type === "TEAM" && !value.teamSize) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["teamSize"],
      message: "Team size is required for Team / Studio applications.",
    });
  }

  if (value.type === "INDIVIDUAL" && value.teamSize) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["teamSize"],
      message: "Team size should be blank for Individual applications.",
    });
  }
});

export const helperApplicationDecisionSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
});

export const helperApplicationUploadedFileSchema = z
  .object({
    url: z.url("Uploaded file URL is invalid."),
    pathname: z
      .string()
      .min(1, "Uploaded file pathname is required.")
      .refine(
        (value) => isHelperApplicationBlobPathname(value),
        "Uploaded file pathname is invalid.",
      ),
    filename: z.string().min(1, "Uploaded file name is required."),
    contentType: z.string().min(1, "Uploaded file type is required."),
    size: z.coerce
      .number()
      .int()
      .positive("Uploaded file size must be greater than 0."),
    kind: z.enum(helperApplicationUploadKinds),
  })
  .superRefine((value, ctx) => {
    if (!isAllowedApplicationFile(value.filename, value.contentType)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["filename"],
        message: "Uploaded file type is not supported.",
      });
    }

    if (value.size > getHelperApplicationFileSizeLimit(value.kind)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["size"],
        message:
          value.kind === "PORTFOLIO"
            ? "Each portfolio file must be under 20MB."
            : "Each IC file must be under 10MB.",
      });
    }
  });

export const helperApplicationSubmissionSchema = helperApplicationSchema.extend({
  portfolioFiles: z
    .array(helperApplicationUploadedFileSchema)
    .min(1, "Upload at least one portfolio file.")
    .max(5, "Upload up to 5 portfolio files.")
    .superRefine((files, ctx) => {
      files.forEach((file, index) => {
        if (file.kind !== "PORTFOLIO") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [index, "kind"],
            message: "Portfolio uploads must be tagged as portfolio files.",
          });
        }
      });
    }),
  identityFrontFile: helperApplicationUploadedFileSchema
    .optional()
    .nullable(),
  identityBackFile: helperApplicationUploadedFileSchema
    .optional()
    .nullable(),
}).superRefine((value, ctx) => {
  const hasFront = Boolean(value.identityFrontFile);
  const hasBack = Boolean(value.identityBackFile);

  if (hasFront !== hasBack) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["identityFrontFile"],
      message: "Upload both IC Front and IC Back, or leave both blank.",
    });
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["identityBackFile"],
      message: "Upload both IC Front and IC Back, or leave both blank.",
    });
  }

  if (value.identityFrontFile && value.identityFrontFile.kind !== "IDENTITY_FRONT") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["identityFrontFile", "kind"],
      message: "IC Front upload is invalid.",
    });
  }

  if (value.identityBackFile && value.identityBackFile.kind !== "IDENTITY_BACK") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["identityBackFile", "kind"],
      message: "IC Back upload is invalid.",
    });
  }
});

export const helperSelfProfileSchema = z.object({
  name: z.string().min(2, "Helper name is required."),
  category: z.enum(categoryValues),
  shortBio: z.string().min(12, "Add a short bio."),
  portfolioNote: z.string().trim().optional().transform((value) => value || undefined),
  priceAnchor: z.enum(helperPriceAnchorValues),
  publicPriceAnchor: z.enum(helperPriceAnchorValues).optional(),
  priceLockedByAdmin: z.boolean().optional(),
  whatsappNumber: z
    .string()
    .trim()
    .regex(/^\d{9,15}$/, "Use digits only for WhatsApp number."),
  responseTime: z.enum(helperResponseTimeOptions),
  deliveryTime: z.enum(helperDeliveryTimeOptions),
});

export const helperPortfolioSchema = z.object({
  title: z.string().min(2, "Portfolio title is required."),
  description: z.string().trim().optional().transform((value) => value || undefined),
  displayOrder: z.coerce.number().int().min(0, "Display order must be 0 or more."),
});

export const helperPortfolioUploadSchema = z.object({
  title: z.string().trim().optional().transform((value) => value || undefined),
  description: z.string().trim().optional().transform((value) => value || undefined),
  displayOrder: z
    .union([z.coerce.number().int().min(0, "Display order must be 0 or more."), z.undefined()])
    .transform((value) => value ?? 0),
});

export const forgotPasswordSchema = z.object({
  email: z.email("Enter a valid email address."),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required."),
    password: z.string().min(8, "Use at least 8 characters."),
    confirmPassword: z.string().min(8, "Use at least 8 characters."),
  })
  .superRefine((value, ctx) => {
    if (value.password !== value.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Passwords do not match.",
      });
    }
  });

export const helperVerificationStatusSchema = z.object({
  status: z.enum(["VERIFIED", "REJECTED"]),
  adminNote: z.string().trim().optional().transform((value) => value || undefined),
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

export const adminLeadPaymentLinkSchema = z.object({
  amount: z.union([
    z.coerce.number().int().positive("Enter a valid whole-number RM amount."),
    z
      .string()
      .trim()
      .regex(/^\d+$/, "Enter a valid whole-number RM amount."),
  ]),
  note: z.string().trim().optional().transform((value) => value || undefined),
});

export const adminLeadPaymentActionSchema = z.object({
  action: z.enum([
    "MARK_AS_PAID",
    "MARK_RELEASE_READY",
    "MARK_AS_RELEASED",
    "MARK_AS_REFUNDED",
  ]),
  paymentRef: z.string().trim().optional().transform((value) => value || undefined),
  releaseRef: z.string().trim().optional().transform((value) => value || undefined),
  note: z.string().trim().optional().transform((value) => value || undefined),
});
