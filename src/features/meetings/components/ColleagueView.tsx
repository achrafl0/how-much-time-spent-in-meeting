import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { formatName, formatCost, formatHours } from "../../../lib/format";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { MeetingHeatmap } from "./MeetingHeatmap";
import { differenceInDays, eachDayOfInterval, format } from "date-fns";

interface ColleagueMeeting {
  summary: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  duration: number;
  totalCost: number | null;
  isOneOnOne: boolean;
  attendeeCount: number;
}

interface ColleagueStats {
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

interface ColleagueViewProps {
  colleagues: Array<{
    email: string;
    totalHours: number;
  }>;
  startDate: Date;
  endDate: Date;
  selectedColleague: ColleagueStats | null;
  onColleagueSelect: (email: string) => void;
}

function calculateAverageMeetingsPerDay({
  meetings,
  startDate,
  endDate,
}: {
  meetings: ColleagueMeeting[];
  startDate: Date;
  endDate: Date;
}): number {
  const meetingsByDay = meetings.reduce(
    (acc, meeting) => {
      const dateKey = meeting.date.toISOString().split("T")[0];
      acc[dateKey] = (acc[dateKey] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const totalDays = Math.abs(differenceInDays(endDate, startDate));
  const totalMeetings = Object.values(meetingsByDay).reduce(
    (sum, count) => sum + count,
    0,
  );

  return totalDays ? totalMeetings / totalDays : 0;
}

function calculateMeetingsPerDayData({
  meetings,
  startDate,
  endDate,
}: {
  meetings: ColleagueMeeting[];
  startDate: Date;
  endDate: Date;
}): Array<{ date: Date; count: number }> {
  // Sort meetings by date
  const sortedMeetings = [...meetings].sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );

  // Get all days in the interval
  const allDays = eachDayOfInterval({ start: startDate, end: endDate });

  let cumulativeMeetings = 0;

  return allDays.map((currentDate) => {
    // Count meetings up to and including this date
    while (
      cumulativeMeetings < sortedMeetings.length &&
      sortedMeetings[cumulativeMeetings].date <= currentDate
    ) {
      cumulativeMeetings++;
    }

    // Calculate days since start (add 1 to avoid division by zero)
    const daysSinceStart = Math.max(
      1,
      differenceInDays(currentDate, startDate) + 1,
    );

    return {
      date: currentDate,
      count: cumulativeMeetings / daysSinceStart,
    };
  });
}

export function ColleagueView({
  colleagues,
  selectedColleague,
  onColleagueSelect,
  startDate,
  endDate,
}: ColleagueViewProps) {
  return (
    <div className="space-y-6">
      <div className="w-[350px]">
        <Select
          value={selectedColleague?.email}
          onValueChange={onColleagueSelect}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a colleague" />
          </SelectTrigger>
          <SelectContent>
            {colleagues.map((colleague) => (
              <SelectItem key={colleague.email} value={colleague.email}>
                {formatName(colleague.email)} (
                {formatHours(colleague.totalHours)})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedColleague && (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Average Meetings per Day</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {calculateAverageMeetingsPerDay({
                    meetings: selectedColleague.meetings,
                    startDate,
                    endDate,
                  }).toFixed(1)}
                </div>
                <p className="text-sm text-muted-foreground">
                  meetings per working day
                </p>
              </CardContent>
            </Card>
          </div>

          <MeetingHeatmap
            data={selectedColleague.heatmapData}
            startDate={startDate}
            endDate={endDate}
          />

          <Card>
            <CardHeader>
              <CardTitle>Average Meetings per Day Evolution</CardTitle>
              <p className="text-sm text-muted-foreground">
                Rolling average of meetings per day from start date until each
                point
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={calculateMeetingsPerDayData({
                      meetings: selectedColleague.meetings,
                      startDate,
                      endDate,
                    })}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date: Date) => format(date, "MMM d")}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tickFormatter={(value: number) => value.toFixed(2)}
                      domain={[0, "auto"]}
                    />
                    <Tooltip
                      labelFormatter={(date: Date) =>
                        format(date, "MMM d, yyyy")
                      }
                      formatter={(value: number) => [
                        `${value.toFixed(2)} meetings/day`,
                        "Average meetings per day",
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#2563eb"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Overview with {formatName(selectedColleague.email)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span>Total time together:</span>
                  <span className="font-medium">
                    {formatHours(selectedColleague.totalHours)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>One-on-one time:</span>
                  <span className="font-medium">
                    {formatHours(selectedColleague.oneOnOneHours)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total meetings:</span>
                  <span className="font-medium">
                    {selectedColleague.meetingCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total cost:</span>
                  <span className="font-medium">
                    {formatCost(selectedColleague.totalCost)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Time Together Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={selectedColleague.cumulativeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date: Date) => date.toLocaleDateString()}
                    />
                    <YAxis tickFormatter={(value) => `${value.toFixed(1)}h`} />
                    <Tooltip
                      labelFormatter={(date: Date) => date.toLocaleDateString()}
                      formatter={(value: number) => [
                        `${value.toFixed(1)} hours`,
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="hours"
                      stroke="#2563eb"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Meeting History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedColleague.meetings
                  .sort((a, b) => b.duration - a.duration)
                  .map((meeting, index) => (
                    <div key={index} className="border-b pb-4 last:border-0">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">{meeting.summary}</span>
                        <span className="text-muted-foreground">
                          {formatHours(meeting.duration)}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {meeting.date.toLocaleDateString()}
                        {" • "}
                        {meeting.startTime.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {" - "}
                        {meeting.endTime.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {" • "}
                        {meeting.isOneOnOne
                          ? "One-on-one"
                          : `${meeting.attendeeCount} attendees`}
                        {" • "}
                        {formatCost(meeting.totalCost)}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
