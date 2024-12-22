import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Tooltip as TooltipUI,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";

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
  totalWorkingHours: number;
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

// Format name from "first.last" to "First Last" or "first" to "First"
function formatName(name: string): string {
  return name
    .split(".")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

// Generate a color palette for the pie chart
const COLORS = [
  "#2563eb",
  "#7c3aed",
  "#db2777",
  "#ea580c",
  "#059669",
  "#0284c7",
  "#4f46e5",
  "#be185d",
  "#c2410c",
  "#047857",
  "#0369a1",
  "#4338ca",
  "#9d174d",
  "#9a3412",
  "#065f46",
  "#075985",
  "#3730a3",
  "#831843",
  "#7c2d12",
  "#064e3b",
];

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
      <Card>
        <CardHeader>
          <CardTitle>Time Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Meeting Time</span>
              <span className="text-sm text-muted-foreground">
                {meetingTimePercentage.toFixed(1)}%
              </span>
            </div>
            <Progress value={meetingTimePercentage} />
          </div>
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span>Total time in meetings:</span>
              <span className="font-medium">
                {totalMeetingHours.toFixed(1)} hours
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total cost impact:</span>
              <span className="font-medium">
                {totalMeetingCost
                  ? `$${totalMeetingCost.toLocaleString()}`
                  : "-"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {bestie && (
        <Card>
          <CardHeader>
            <CardTitle>Your Work Bestie 👥</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-lg font-semibold">{bestie.email}</p>
            <div className="grid gap-1 text-sm">
              <div className="flex justify-between">
                <span>One-on-one time:</span>
                <span>{bestie.oneOnOneHours.toFixed(1)} hours</span>
              </div>
              <div className="flex justify-between">
                <span>Total meetings:</span>
                <span>{bestie.meetingCount}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Cost together:</span>
                <span>
                  {bestie.totalCost
                    ? `$${bestie.totalCost.toLocaleString()}`
                    : "-"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Top 5 Most Expensive Meetings 💰</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {mostExpensiveMeetings.map((meeting, index) => (
              <div key={index} className="space-y-4">
                <h3 className="font-semibold">{meeting.summary}</h3>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{meeting.date.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time:</span>
                    <span>
                      {meeting.startTime.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      -{" "}
                      {meeting.endTime.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>{meeting.duration.toFixed(1)} hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Attendees:</span>
                    <TooltipProvider>
                      <TooltipUI>
                        <TooltipTrigger asChild>
                          <span className="cursor-help underline decoration-dotted">
                            {meeting.attendeeCount} people
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[300px]">
                          <ul className="list-none p-0 m-0 space-y-1">
                            {meeting.attendees.map((attendee) => (
                              <li key={attendee}>{formatName(attendee)}</li>
                            ))}
                          </ul>
                        </TooltipContent>
                      </TooltipUI>
                    </TooltipProvider>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Total Cost:</span>
                    <span>
                      {meeting.totalCost
                        ? `$${meeting.totalCost.toLocaleString()}`
                        : "-"}
                    </span>
                  </div>
                </div>
                {index < mostExpensiveMeetings.length - 1 && (
                  <div className="border-b border-border my-4" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Time Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={colleagueTimeDistribution}
                  dataKey="hours"
                  nameKey="email"
                  cx="50%"
                  cy="45%"
                  outerRadius={150}
                  label={({ email, percentage }) =>
                    `${formatName(email)} (${percentage.toFixed(1)}%)`
                  }
                  labelLine={{ strokeWidth: 2 }}
                  paddingAngle={2}
                >
                  {colleagueTimeDistribution.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `${value.toFixed(1)} hours`,
                    formatName(name),
                  ]}
                />
                <Legend
                  formatter={(value) => formatName(value)}
                  layout="horizontal"
                  align="center"
                  verticalAlign="bottom"
                  wrapperStyle={{ paddingTop: "20px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top 10 Collaborators</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {topColleagues.map((colleague) => (
              <li
                key={colleague.email}
                className="border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="flex flex-col gap-2">
                  <span className="font-medium">
                    {formatName(colleague.email)}
                  </span>
                  <div className="grid grid-cols-3 text-sm text-muted-foreground">
                    <span>{colleague.totalHours.toFixed(1)} hours</span>
                    <span>{colleague.meetingCount} meetings</span>
                    <span>
                      {colleague.totalCost
                        ? `$${colleague.totalCost.toLocaleString()}`
                        : "-"}
                    </span>
                  </div>
                  <Progress
                    value={(colleague.totalHours / totalMeetingHours) * 100}
                    className="h-2"
                  />
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
