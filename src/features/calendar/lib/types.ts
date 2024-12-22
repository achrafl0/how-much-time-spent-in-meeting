export interface CalendarEvent {
  summary: string;
  startTime: Date;
  endTime: Date;
  attendees: string[];
  status: string;
}

export interface DayEvent {
  summary: string;
  startTime: Date;
  endTime: Date;
  attendees: string[];
  attendeeCount: number;
  duration: number;
  totalCost: number | null;
}

export interface DayStats {
  date: Date;
  totalHours: number;
  events: DayEvent[];
  totalCost: number | null;
}

export interface ContextSwitch {
  date: Date;
  firstMeeting: DayEvent;
  secondMeeting: DayEvent;
  timeBetween: number;
}

export interface WeekdayPattern {
  dayOfWeek: number;
  averageHours: number;
  totalMeetings: number;
}

export interface ColleagueMeeting {
  summary: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  duration: number;
  totalCost: number | null;
  isOneOnOne: boolean;
  attendeeCount: number;
}

export interface ColleagueStats {
  email: string;
  totalHours: number;
  oneOnOneHours: number;
  meetingCount: number;
  totalCost: number | null;
  meetings: ColleagueMeeting[];
  cumulativeData: Array<{
    date: Date;
    hours: number;
  }>;
  heatmapData: Array<{
    date: Date;
    meetingHours: number;
  }>;
}

export interface ProcessedStats {
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
  // Efficiency stats
  busiestDays: DayStats[];
  freestDays: DayStats[];
  weekdayPatterns: WeekdayPattern[];
  contextSwitches: ContextSwitch[];
  heatmapData: Array<{
    date: Date;
    meetingHours: number;
  }>;
  // Colleague stats by email
  colleagueStats: Record<string, ColleagueStats>;
}
