import { TimeOverview } from "./TimeOverview";
import { BestieCard } from "./BestieCard";
import { ExpensiveMeetingsList } from "./ExpensiveMeetingsList";
import { ColleaguesList } from "./ColleaguesList";
import { TimeDistributionChart } from "./TimeDistributionChart";

interface Colleague {
  email: string;
  totalHours: number;
  meetingCount: number;
  totalCost: number | null;
}

interface Bestie {
  email: string;
  oneOnOneHours: number;
  meetingCount: number;
  totalCost: number | null;
}

interface ExpensiveMeeting {
  summary: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  attendees: string[];
  attendeeCount: number;
  duration: number;
  totalCost: number | null;
}

interface StatsViewProps {
  totalMeetingHours: number;
  meetingTimePercentage: number;
  totalMeetingCost: number | null;
  topColleagues: Colleague[];
  bestie?: Bestie;
  mostExpensiveMeetings: ExpensiveMeeting[];
  colleagueTimeDistribution: Array<{
    email: string;
    hours: number;
    percentage: number;
  }>;
}

export function StatsView({
  totalMeetingHours,
  meetingTimePercentage,
  totalMeetingCost,
  topColleagues,
  bestie,
  mostExpensiveMeetings,
  colleagueTimeDistribution,
}: StatsViewProps) {
  return (
    <div className="space-y-6">
      <TimeOverview
        totalMeetingHours={totalMeetingHours}
        meetingTimePercentage={meetingTimePercentage}
        totalMeetingCost={totalMeetingCost}
      />

      {bestie && <BestieCard {...bestie} />}

      <ExpensiveMeetingsList meetings={mostExpensiveMeetings} />

      <TimeDistributionChart data={colleagueTimeDistribution} />

      <ColleaguesList
        colleagues={topColleagues}
        totalMeetingHours={totalMeetingHours}
      />
    </div>
  );
}
