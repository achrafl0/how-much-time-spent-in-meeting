// Format name from "first.last" to "First Last" or "first" to "First"
export function formatName(name: string): string {
  return name
    .split(".")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

// Format cost as a localized string with currency symbol
export function formatCost(cost: number | null): string {
  return cost ? `$${cost.toLocaleString()}` : "-";
}

// Format hours with one decimal place
export function formatHours(hours: number): string {
  return `${hours.toFixed(1)} hours`;
}

// Format percentage with one decimal place
export function formatPercentage(percentage: number): string {
  return `${percentage.toFixed(1)}%`;
}
