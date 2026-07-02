import { z } from "zod";

/** Shared prediction validation used by the server action and its tests. */
export const predictionSchema = z
  .object({
    matchId: z.string().min(1),
    homeScore: z.coerce.number().int().min(0).max(30),
    awayScore: z.coerce.number().int().min(0).max(30),
    wentToPenalties: z.coerce.boolean(),
    penaltyWinnerTeamId: z.string().nullable().optional(),
  })
  .refine((v) => !v.wentToPenalties || v.homeScore === v.awayScore, {
    message: "Penalties only apply when the score is level.",
    path: ["wentToPenalties"],
  })
  .refine((v) => !v.wentToPenalties || !!v.penaltyWinnerTeamId, {
    message: "Pick who wins the shootout.",
    path: ["penaltyWinnerTeamId"],
  });

export type PredictionValues = z.infer<typeof predictionSchema>;

/** Validation for setting/changing a username. */
export const usernameSchema = z
  .string()
  .trim()
  .min(3, "At least 3 characters.")
  .max(20, "At most 20 characters.")
  .regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers, and underscores only.");
