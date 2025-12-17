import { z } from "zod";

/**
 * Validation schema for recipe creation and editing.
 *
 * This schema enforces the minimum business rules required for a recipe
 * to be considered valid before persistence. It intentionally focuses on
 * structural correctness and critical constraints; optional metadata
 * (tags, dietary options, images, etc.) is validated elsewhere.
 */
export const recipeSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    ingredients: z
      .array(
        z.object({
          name: z.string().min(1),
        })
      )
      .min(1, "At least one ingredient is required"),
    steps: z
      .array(
        z.object({
          text: z.string().min(1),
        })
      )
      .min(1, "At least one step is required"),
    minActivePrepTime: z.number().positive("Active time is required"),
    maxActivePrepTime: z.number().positive(),
  })
  .refine((data) => data.minActivePrepTime <= data.maxActivePrepTime, {
    message: "Min active time must be ≤ max active time",
    path: ["maxActivePrepTime"],
  });
