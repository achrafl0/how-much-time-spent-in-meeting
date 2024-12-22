import {
  CalendarEvent,
  ProcessedStats,
  DayStats,
  DayEvent,
  ContextSwitch,
  WeekdayPattern,
  ColleagueStats,
} from "./types";
import {
  normalizeEmail,
  isWorkingHour,
  isRecurringMeeting,
  calculateEventDuration,
  calculateHourlyRate,
  calculateTotalWorkingHours,
} from "./utils";

function isValidEvent(
  event: CalendarEvent,
  userEmail: string,
  excludeRecurring: boolean,
  startDate: Date,
  endDate: Date,
): boolean {
  // Check if event is within the selected date range
  if (event.startTime < startDate || event.startTime > endDate) {
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

function calculateEventCost(
  duration: number,
  attendeeCount: number,
  hourlyRate: number,
): number {
  return duration * hourlyRate * attendeeCount;
}

function toDayEvent(event: CalendarEvent, hourlyRate: number | null): DayEvent {
  const duration = calculateEventDuration(event.startTime, event.endTime);
  const attendeeCount = event.attendees.length;
  const totalCost = hourlyRate
    ? calculateEventCost(duration, attendeeCount, hourlyRate)
    : null;

  return {
    summary: event.summary,
    startTime: event.startTime,
    endTime: event.endTime,
    attendees: event.attendees,
    attendeeCount,
    duration,
    totalCost,
  };
}

function groupEventsByDay(events: DayEvent[]): Record<string, DayEvent[]> {
  const days: Record<string, DayEvent[]> = {};
  events.forEach((event) => {
    const date = event.startTime.toISOString().split("T")[0];
    if (!days[date]) {
      days[date] = [];
    }
    days[date].push(event);
  });
  return days;
}

function calculateDayStats(events: DayEvent[]): DayStats {
  const date = events[0]?.startTime || new Date();
  const totalHours = events.reduce((sum, event) => sum + event.duration, 0);
  const totalCost = events.reduce(
    (sum, event) => sum + (event.totalCost || 0),
    0,
  );

  return {
    date: new Date(date.toISOString().split("T")[0]),
    totalHours,
    events,
    totalCost: totalCost || null,
  };
}

function findContextSwitches(events: DayEvent[]): ContextSwitch[] {
  const switches: ContextSwitch[] = [];
  const sortedEvents = [...events].sort(
    (a, b) => a.startTime.getTime() - b.startTime.getTime(),
  );

  for (let i = 0; i < sortedEvents.length - 1; i++) {
    const firstMeeting = sortedEvents[i];
    const secondMeeting = sortedEvents[i + 1];
    const timeBetween =
      (secondMeeting.startTime.getTime() - firstMeeting.endTime.getTime()) /
      (1000 * 60 * 60);

    if (timeBetween > 0 && timeBetween < 0.5) {
      switches.push({
        date: firstMeeting.startTime,
        firstMeeting,
        secondMeeting,
        timeBetween,
      });
    }
  }

  return switches;
}

function calculateWeekdayPatterns(
  eventsByDay: Record<string, DayEvent[]>,
): WeekdayPattern[] {
  const patterns: Record<
    number,
    { totalHours: number; days: number; meetings: number; dailyHours: number[] }
  > = {};

  Object.values(eventsByDay).forEach((events) => {
    const dayOfWeek = events[0].startTime.getDay();
    if (!patterns[dayOfWeek]) {
      patterns[dayOfWeek] = {
        totalHours: 0,
        days: 0,
        meetings: 0,
        dailyHours: [],
      };
    }
    const dailyHours = events.reduce((sum, event) => sum + event.duration, 0);
    patterns[dayOfWeek].totalHours += dailyHours;
    patterns[dayOfWeek].days += 1;
    patterns[dayOfWeek].meetings += events.length;
    patterns[dayOfWeek].dailyHours.push(dailyHours);
  });

  return Object.entries(patterns).map(([dayOfWeek, stats]) => {
    const sortedHours = stats.dailyHours.sort((a, b) => a - b);
    const mid = Math.floor(sortedHours.length / 2);
    const medianHours =
      sortedHours.length % 2 === 0
        ? (sortedHours[mid - 1] + sortedHours[mid]) / 2
        : sortedHours[mid];

    return {
      dayOfWeek: parseInt(dayOfWeek),
      averageHours: stats.totalHours / stats.days,
      totalMeetings: stats.meetings,
      minHours: Math.min(...stats.dailyHours),
      maxHours: Math.max(...stats.dailyHours),
      medianHours,
    };
  });
}

function calculateColleagueStats(
  events: DayEvent[],
  email: string,
): ColleagueStats {
  const meetings = events.filter((event) => event.attendees.includes(email));

  const totalHours = meetings.reduce((sum, event) => sum + event.duration, 0);
  const totalCost = meetings.reduce(
    (sum, event) => sum + (event.totalCost || 0) / event.attendeeCount,
    0,
  );

  const oneOnOneMeetings = meetings.filter(
    (event) => event.attendeeCount === 2,
  );
  const oneOnOneHours = oneOnOneMeetings.reduce(
    (sum, event) => sum + event.duration,
    0,
  );

  // Sort meetings by date for cumulative data
  const sortedMeetings = [...meetings].sort(
    (a, b) => a.startTime.getTime() - b.startTime.getTime(),
  );

  let cumulativeHours = 0;
  const cumulativeData = sortedMeetings.map((meeting) => {
    cumulativeHours += meeting.duration;
    return {
      date: meeting.startTime,
      hours: cumulativeHours,
    };
  });

  // Calculate heatmap data
  const heatmapData = Object.entries(groupEventsByDay(meetings)).map(
    ([dateStr, dayEvents]) => ({
      date: new Date(dateStr),
      meetingHours: dayEvents.reduce((sum, event) => sum + event.duration, 0),
    }),
  );

  return {
    email,
    totalHours,
    oneOnOneHours,
    meetingCount: meetings.length,
    totalCost: totalCost || null,
    meetings: meetings.map((meeting) => ({
      ...meeting,
      date: new Date(meeting.startTime.toISOString().split("T")[0]),
      isOneOnOne: meeting.attendeeCount === 2,
    })),
    cumulativeData,
    heatmapData,
  };
}

export function processEvents(
  events: CalendarEvent[],
  userEmail: string,
  annualSalary: number | null,
  excludeRecurring: boolean = false,
  startDate: Date = new Date(new Date().getFullYear(), 0, 1),
  endDate: Date = new Date(new Date().getFullYear(), 11, 31),
): ProcessedStats {
  const normalizedUserEmail = normalizeEmail(userEmail);
  const validEvents = events.filter((event) =>
    isValidEvent(
      event,
      normalizedUserEmail,
      excludeRecurring,
      startDate,
      endDate,
    ),
  );

  const hourlyRate = annualSalary ? calculateHourlyRate(annualSalary) : null;
  const totalWorkingHours = calculateTotalWorkingHours();

  // Convert to DayEvents and calculate basic stats
  const dayEvents = validEvents.map((event) => toDayEvent(event, hourlyRate));
  const totalHours = dayEvents.reduce((sum, event) => sum + event.duration, 0);
  const totalMeetingCost = hourlyRate ? totalHours * hourlyRate : null;

  // Group events by day
  const eventsByDay = groupEventsByDay(dayEvents);
  const dayStats = Object.values(eventsByDay).map((events) =>
    calculateDayStats(events),
  );

  // Calculate efficiency stats
  const sortedDayStats = [...dayStats].sort(
    (a, b) => b.totalHours - a.totalHours,
  );
  const busiestDays = sortedDayStats.slice(0, 5);
  const freestDays = [...sortedDayStats]
    .sort((a, b) => a.totalHours - b.totalHours)
    .slice(0, 5);

  const weekdayPatterns = calculateWeekdayPatterns(eventsByDay);
  const contextSwitches = findContextSwitches(dayEvents);

  // Calculate colleague stats
  const colleagueEmails = new Set(
    dayEvents.flatMap((event) =>
      event.attendees.filter((email) => email !== normalizedUserEmail),
    ),
  );

  const colleagueStats: Record<string, ColleagueStats> = {};
  colleagueEmails.forEach((email) => {
    colleagueStats[email] = calculateColleagueStats(dayEvents, email);
  });

  const topColleagues = Object.values(colleagueStats)
    .sort((a, b) => b.totalHours - a.totalHours)
    .slice(0, 10)
    .map(({ email, totalHours, meetingCount, totalCost }) => ({
      email,
      totalHours,
      meetingCount,
      totalCost,
    }));

  const bestie = Object.values(colleagueStats)
    .filter((c) => c.oneOnOneHours > 0)
    .sort((a, b) => b.oneOnOneHours - a.oneOnOneHours)[0];

  const colleagueTimeDistribution = Object.values(colleagueStats)
    .sort((a, b) => b.totalHours - a.totalHours)
    .slice(0, 15)
    .map((colleague) => ({
      email: colleague.email,
      hours: colleague.totalHours,
      percentage: (colleague.totalHours / totalHours) * 100,
    }));

  // Calculate heatmap data
  const heatmapData = dayStats.map((day) => ({
    date: day.date,
    meetingHours: day.totalHours,
  }));

  return {
    totalMeetingHours: totalHours,
    allColleagues: Object.values(colleagueStats).sort(
      (a, b) => b.totalHours - a.totalHours,
    ),
    totalWorkingHours,
    meetingTimePercentage: (totalHours / totalWorkingHours) * 100,
    totalMeetingCost,
    topColleagues,
    bestie: bestie
      ? {
          email: bestie.email,
          oneOnOneHours: bestie.oneOnOneHours,
          meetingCount: bestie.meetingCount,
          totalCost: bestie.totalCost,
        }
      : undefined,
    mostExpensiveMeetings: dayEvents
      .filter((event) => event.totalCost !== null)
      .sort((a, b) => (b.totalCost || 0) - (a.totalCost || 0))
      .slice(0, 5)
      .map((event) => ({
        ...event,
        date: event.startTime,
      })),
    colleagueTimeDistribution,
    busiestDays,
    freestDays,
    weekdayPatterns,
    contextSwitches,
    heatmapData,
    colleagueStats,
  };
}
