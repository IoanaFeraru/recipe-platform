import { z } from "zod";

export const recipeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  ingredients: z.array(
    z.object({
      name: z.string().min(1)
    })
  ).min(1, "At least one ingredient is required"),
  steps: z.array(
    z.object({
      text: z.string().min(1)
    })
  ).min(1, "At least one step is required"),
  minActivePrepTime: z.number().positive("Active time is required"),
  maxActivePrepTime: z.number().positive(),
}).refine(
  data => data.minActivePrepTime <= data.maxActivePrepTime,
  {
    message: "Min active time must be ≤ max active time",
    path: ["maxActivePrepTime"]
  }
);
