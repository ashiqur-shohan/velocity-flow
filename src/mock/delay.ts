// Simulates real API network delay
// Replace this entire file's usage with nothing when connecting real backend
export const delay = (ms: number = 400) =>
  new Promise((resolve) => setTimeout(resolve, ms));
