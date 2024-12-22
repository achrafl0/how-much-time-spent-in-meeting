import ICAL from "ical.js";

interface CalendarEvent {
  summary: string;
  startTime: Date;
  endTime: Date;
  attendees: string[];
  status: string;
}

interface Colleague {
  email: string;
  totalHours: number;
  meetingCount: number;
  oneOnOneHours: number;
  totalCost: number | null;
}

interface ProcessedStats {
  totalMeetingHours: number;
  totalWorkingHours: number;
  meetingTimePercentage: number;
  totalMeetingCost: number | null;
  topColleagues: Array<{
    email: string;
    totalHours: number;
    meetingCount: number;
    totalCost: number | null;
  }>;
  bestie?: {
    email: string;
    oneOnOneHours: number;
    meetingCount: number;
    totalCost: number | null;
  };
  mostExpensiveMeetings: Array<{
    summary: string;
    date: Date;
    startTime: Date;
    endTime: Date;
    attendees: string[];
    attendeeCount: number;
    duration: number;
    totalCost: number | null;
  }>;
  colleagueTimeDistribution: Array<{
    email: string;
    hours: number;
    percentage: number;
  }>;
}

function normalizeEmail(email: string): string {
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

export function parseIcsData(icsString: string): CalendarEvent[] {
  try {
    const jcalData = ICAL.parse(icsString);
    const comp = new ICAL.Component(jcalData);
    const vevents = comp.getAllSubcomponents("vevent");

    return vevents.map((vevent: ICAL.Component): CalendarEvent => {
      const event = new ICAL.Event(vevent);

      // For Google Calendar exports, we can safely get the email from the URI
      const attendees = vevent
        .getAllProperties("attendee")
        .map((prop) => prop.getFirstValue())
        .filter((value): value is string => typeof value === "string")
        .map((value) => value.replace("mailto:", ""))
        .filter(
          (value) =>
            !value.includes("resource.calendar.google") &&
            !value.includes("team") &&
            !value.includes("ovrsalle"),
        )
        .map(normalizeEmail); // Normalize emails to handle different formats

      // Get the user's status from the attendee properties
      let status = "NEEDS-ACTION";
      vevent.getAllProperties("attendee").forEach((prop) => {
        const partstat = prop.getParameter("partstat");
        if (partstat && typeof partstat === "string") {
          status = partstat;
        }
      });

      return {
        summary: event.summary || "",
        startTime: event.startDate.toJSDate(),
        endTime: event.endDate.toJSDate(),
        attendees: [...new Set(attendees)], // Remove duplicates after normalization
        status,
      };
    });
  } catch (error) {
    console.error("Error parsing ICS data:", error);
    return [];
  }
}

function isWorkingHour(hour: number): boolean {
  return hour >= 8 && hour < 18;
}

function isRecurringMeeting(summary: string): boolean {
  const lowerSummary = summary.toLowerCase().replace("-", "");
  return (
    lowerSummary.includes("weekly") ||
    lowerSummary.includes("daily") ||
    lowerSummary.includes("recurring") ||
    lowerSummary.includes("biweekly") ||
    lowerSummary.includes("monthly")
  );
}

function isValidEvent(
  event: CalendarEvent,
  userEmail: string,
  excludeRecurring: boolean,
): boolean {
  // Check if event is in 2024
  if (event.startTime.getFullYear() !== 2024) {
    return false;
  }

  // Check if event is during working hours (Google Calendar uses local time)
  const startHour = event.startTime.getHours();
  if (!isWorkingHour(startHour)) {
    return false;
  }

  // Check if user is alone
  if (event.attendees.length <= 1) {
    return false;
  }

  // Check if user has declined
  const userAttendee = event.attendees.includes(userEmail);
  if (!userAttendee || event.status === "DECLINED") {
    return false;
  }

  // Check for recurring meetings if excluded
  if (excludeRecurring && isRecurringMeeting(event.summary)) {
    return false;
  }

  return true;
}

function calculateEventDuration(event: CalendarEvent): number {
  return (
    (event.endTime.getTime() - event.startTime.getTime()) / (1000 * 60 * 60)
  );
}

function calculateEventCost(event: CalendarEvent, hourlyRate: number): number {
  const duration = calculateEventDuration(event);
  return duration * hourlyRate * event.attendees.length; // Cost for all attendees
}

export function processEvents(
  events: CalendarEvent[],
  userEmail: string,
  annualSalary: number | null,
  excludeRecurring: boolean = false,
): ProcessedStats {
  const normalizedUserEmail = normalizeEmail(userEmail);
  const validEvents = events.filter((event) =>
    isValidEvent(event, normalizedUserEmail, excludeRecurring),
  );

  const hourlyRate = annualSalary ? (2 * annualSalary) / (10 * 5 * 52) : null;
  const totalWorkingHours = 10 * 5 * 52;

  let totalHours = 0;
  const colleagueStats: Record<string, Colleague> = {};
  const expensiveMeetings: Array<{
    summary: string;
    date: Date;
    startTime: Date;
    endTime: Date;
    attendees: string[];
    attendeeCount: number;
    duration: number;
    totalCost: number | null;
  }> = [];

  validEvents.forEach((event) => {
    const duration = calculateEventDuration(event);
    totalHours += duration;

    const meetingCost = hourlyRate
      ? calculateEventCost(event, hourlyRate)
      : null;
    const costPerPerson = meetingCost
      ? meetingCost / event.attendees.length
      : null;

    if (meetingCost) {
      expensiveMeetings.push({
        summary: event.summary,
        date: event.startTime,
        startTime: event.startTime,
        endTime: event.endTime,
        attendees: event.attendees,
        attendeeCount: event.attendees.length,
        duration,
        totalCost: meetingCost,
      });
    }

    event.attendees.forEach((attendee) => {
      if (attendee !== normalizedUserEmail) {
        if (!colleagueStats[attendee]) {
          colleagueStats[attendee] = {
            email: attendee,
            totalHours: 0,
            meetingCount: 0,
            oneOnOneHours: 0,
            totalCost: null,
          };
        }
        colleagueStats[attendee].totalHours += duration;
        colleagueStats[attendee].meetingCount += 1;

        if (costPerPerson) {
          colleagueStats[attendee].totalCost =
            (colleagueStats[attendee].totalCost || 0) + costPerPerson;
        }

        if (event.attendees.length === 2) {
          colleagueStats[attendee].oneOnOneHours += duration;
        }
      }
    });
  });

  const bestie = Object.values(colleagueStats)
    .filter((c) => c.oneOnOneHours > 0)
    .sort((a, b) => b.oneOnOneHours - a.oneOnOneHours)[0];

  const topColleagues = Object.values(colleagueStats)
    .sort((a, b) => b.totalHours - a.totalHours)
    .slice(0, 10)
    .map(({ email, totalHours, meetingCount, totalCost }) => ({
      email,
      totalHours,
      meetingCount,
      totalCost,
    }));

  const colleagueTimeDistribution = Object.values(colleagueStats)
    .sort((a, b) => b.totalHours - a.totalHours)
    .slice(0, 15)
    .map((colleague) => ({
      email: colleague.email,
      hours: colleague.totalHours,
      percentage: (colleague.totalHours / totalHours) * 100,
    }));

  return {
    totalMeetingHours: totalHours,
    totalWorkingHours,
    meetingTimePercentage: (totalHours / totalWorkingHours) * 100,
    totalMeetingCost: hourlyRate ? totalHours * hourlyRate : null,
    topColleagues,
    bestie: bestie
      ? {
          email: bestie.email,
          oneOnOneHours: bestie.oneOnOneHours,
          meetingCount: bestie.meetingCount,
          totalCost: bestie.totalCost,
        }
      : undefined,
    mostExpensiveMeetings: expensiveMeetings
      .sort((a, b) => (b.totalCost || 0) - (a.totalCost || 0))
      .slice(0, 5),
    colleagueTimeDistribution,
  };
}
