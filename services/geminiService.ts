import { FunFactResponse } from "../types";
import { getLocalFact } from "./facts";

// Kept same signature to minimize code changes in App.tsx
export const getFunFact = async (locationName: string): Promise<FunFactResponse> => {
  // Simulate a small delay to make it feel "active" (optional, can be removed for instant speed)
  // return new Promise((resolve) => {
  //   setTimeout(() => {
  //       resolve(getLocalFact(locationName));
  //   }, 300);
  // });

  return getLocalFact(locationName);
};

