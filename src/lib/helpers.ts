import { categoryLabelMap, categoryTaskTypeMap, taskTypeLabelMap } from "@/lib/constants";

export type HelperSpecialty = {
  code: string;
  label: string;
  taskTypes: string[];
};

export type HelperPortfolioItem = {
  id: string;
  title: string;
  imageUrl: string;
  description?: string | null;
  externalLink?: string | null;
  displayOrder: number;
};

export function parseSpecialties(value: unknown): HelperSpecialty[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (
      typeof item === "object" &&
      item !== null &&
      "code" in item &&
      "label" in item &&
      "taskTypes" in item &&
      typeof item.code === "string" &&
      typeof item.label === "string" &&
      Array.isArray(item.taskTypes)
    ) {
      return [
        {
          code: item.code,
          label: item.label,
          taskTypes: item.taskTypes.filter(
            (taskType: unknown): taskType is string => typeof taskType === "string",
          ),
        },
      ];
    }

    return [];
  });
}

export function parsePortfolioItems(value: unknown): HelperPortfolioItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (
      typeof item === "object" &&
      item !== null &&
      "id" in item &&
      "title" in item &&
      "imageUrl" in item &&
      "displayOrder" in item &&
      typeof item.id === "string" &&
      typeof item.title === "string" &&
      typeof item.imageUrl === "string" &&
      typeof item.displayOrder === "number"
    ) {
      return [
        {
          id: item.id,
          title: item.title,
          imageUrl: item.imageUrl,
          description:
            "description" in item && typeof item.description === "string"
              ? item.description
              : null,
          externalLink:
            "externalLink" in item && typeof item.externalLink === "string"
              ? item.externalLink
              : null,
          displayOrder: item.displayOrder,
        },
      ];
    }

    return [];
  });
}

export function specialtyMatchesTaskType(
  specialties: HelperSpecialty[],
  taskType: string,
) {
  return specialties.some((specialty) => specialty.taskTypes.includes(taskType));
}

export function categoryMatches(helperCategory: string, requestCategory: string) {
  return helperCategory === requestCategory;
}

export function getCategoryLabel(category: string) {
  return categoryLabelMap[category as keyof typeof categoryLabelMap] ?? category.replaceAll("_", " ");
}

export function getTaskTypeLabel(taskType: string) {
  return taskTypeLabelMap[taskType as keyof typeof taskTypeLabelMap] ?? taskType.replaceAll("_", " ");
}

export function isTaskTypeAllowedForCategory(category: string, taskType: string) {
  const allowedTaskTypes =
    categoryTaskTypeMap[category as keyof typeof categoryTaskTypeMap];

  return Boolean(allowedTaskTypes?.includes(taskType as never));
}

export function helperMatchesRequest(input: {
  helperCategory: string;
  requestCategory: string;
  specialties: HelperSpecialty[];
  requestTaskType: string;
}) {
  return (
    categoryMatches(input.helperCategory, input.requestCategory) &&
    specialtyMatchesTaskType(input.specialties, input.requestTaskType)
  );
}

export function getHelperMatchPriority(input: {
  helperCategory: string;
  requestCategory: string;
  specialties: HelperSpecialty[];
  requestTaskType: string;
}) {
  const categoryMatch = categoryMatches(input.helperCategory, input.requestCategory);
  const taskTypeMatch = specialtyMatchesTaskType(input.specialties, input.requestTaskType);

  if (categoryMatch && taskTypeMatch) {
    return 0;
  }

  if (categoryMatch) {
    return 1;
  }

  if (taskTypeMatch) {
    return 2;
  }

  return 3;
}
