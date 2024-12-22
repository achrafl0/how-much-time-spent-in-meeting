export function normalizeEmail(email: string): string {
  // Remove domain part if it exists
  const withoutDomain = email.split("@")[0];

  // If it's in firstName.lastName format, keep it as is
  if (withoutDomain.includes(".")) {
    return withoutDomain;
  }

  // If it's just a firstName (no dots), keep just that
  if (!withoutDomain.includes(".") && !withoutDomain.includes(" ")) {
    return withoutDomain;
  }

  // Otherwise return the full email
  return email;
}

export function isWorkingHour(hour: number): boolean {
  return hour >= 8 && hour < 18;
}

export function isRecurringMeeting(summary: string): boolean {
  const lowerSummary = summary.toLowerCase().replace("-", "");
  return (
    lowerSummary.includes("weekly") ||
    lowerSummary.includes("daily") ||
    lowerSummary.includes("recurring") ||
    lowerSummary.includes("biweekly") ||
    lowerSummary.includes("monthly") ||
    lowerSummary.includes("retro")
  );
}

export function calculateEventDuration(startTime: Date, endTime: Date): number {
  return (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
}

export function calculateHourlyRate(annualSalary: number): number {
  return (2 * annualSalary) / (10 * 5 * 52);
}

export function calculateTotalWorkingHours(): number {
  return 10 * 5 * 52;
}
