// src/utils/conversions.ts
export const lbsToKg = (lbs: number) => lbs / 2.20462;
export const kgToLbs = (kg: number) => kg * 2.20462;

export const displayWeight = (kg: number, unit: "lbs" | "kg") => {
  if (unit === "kg") return kg.toFixed(1);
  return Math.round(kgToLbs(kg)); // Usually people like lbs as whole numbers
};
