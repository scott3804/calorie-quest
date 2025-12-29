export const calculateBMR = (
  weightKg: number,
  heightCm: number,
  age: number,
  gender: "male" | "female"
) => {
  // Mifflin-St Jeor Equation
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === "male" ? base + 5 : base - 161;
};

export const getRecommendedTDEE = (
  bmr: number,
  activityLevel: number = 1.2
) => {
  return Math.round(bmr * activityLevel);
};
