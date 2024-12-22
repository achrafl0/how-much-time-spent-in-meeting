import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { formatCost, formatHours } from "../../../lib/format";
import { MeetingHeatmap } from "./MeetingHeatmap";

interface DayEvent {
  summary: string;
  startTime: Date;
  endTime: Date;
  attendees: string[];
  attendeeCount: number;
  duration: number;
  totalCost: number | null;
}

interface DayStats {
  date: Date;
  totalHours: number;
  events: DayEvent[];
  totalCost: number | null;
}

interface ContextSwitch {
  date: Date;
  firstMeeting: DayEvent;
  secondMeeting: DayEvent;
  timeBetween: number;
}

interface WeekdayPattern {
  dayOfWeek: number;
  averageHours: number;
  totalMeetings: number;
  minHours: number;
  medianHours: number;
  maxHours: number;
}

interface EfficiencyViewProps {
  busiestDays: DayStats[];
  freestDays: DayStats[];
  weekdayPatterns: WeekdayPattern[];
  contextSwitches: ContextSwitch[];
  heatmapData: Array<{
    date: Date;
    meetingHours: number;
  }>;
  startDate: Date;
  endDate: Date;
}

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function EfficiencyView({
  busiestDays,
  freestDays,
  weekdayPatterns,
  contextSwitches,
  heatmapData,
  endDate,
  startDate,
}: EfficiencyViewProps) {
  return (
    <div className="space-y-6">
      <MeetingHeatmap
        data={heatmapData}
        startDate={startDate}
        endDate={endDate}
      />

      <Card>
        <CardHeader>
          <CardTitle>Busiest Days</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {busiestDays.map((day) => (
              <div
                key={day.date.toISOString()}
                className="border-b pb-4 last:border-0"
              >
                <div className="flex justify-between mb-2">
                  <span className="font-medium">
                    {day.date.toLocaleDateString()}
                  </span>
                  <span>{formatHours(day.totalHours)}</span>
                </div>
                <ul className="space-y-2">
                  {day.events.map((event, index) => (
                    <li key={index} className="text-sm">
                      <div className="flex justify-between">
                        <span>{event.summary}</span>
                        <span>{formatHours(event.duration)}</span>
                      </div>
                      <div className="text-muted-foreground">
                        {event.startTime.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {" - "}
                        {event.endTime.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {" • "}
                        {event.attendeeCount} attendees
                        {" • "}
                        {formatCost(event.totalCost)}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Freest Days</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {freestDays.map((day) => (
              <div
                key={day.date.toISOString()}
                className="border-b pb-4 last:border-0"
              >
                <div className="flex justify-between mb-2">
                  <span className="font-medium">
                    {day.date.toLocaleDateString()}
                  </span>
                  <span>{formatHours(day.totalHours)}</span>
                </div>
                {day.events.length > 0 ? (
                  <ul className="space-y-2">
                    {day.events.map((event, index) => (
                      <li key={index} className="text-sm">
                        <div className="flex justify-between">
                          <span>{event.summary}</span>
                          <span>{formatHours(event.duration)}</span>
                        </div>
                        <div className="text-muted-foreground">
                          {event.startTime.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {" - "}
                          {event.endTime.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {" • "}
                          {event.attendeeCount} attendees
                          {" • "}
                          {formatCost(event.totalCost)}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No meetings</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Patterns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {weekdayPatterns.map((pattern) => (
              <div
                key={pattern.dayOfWeek}
                className="flex justify-between items-center"
              >
                <span className="font-medium">{DAYS[pattern.dayOfWeek]}</span>
                <div className="text-sm text-muted-foreground">
                  <span>{formatHours(pattern.averageHours)} avg.</span>
                  {" • "}
                  <span>{formatHours(pattern.minHours)} min</span>
                  {" • "}
                  <span>{formatHours(pattern.medianHours)} med</span>
                  {" • "}
                  <span>{formatHours(pattern.maxHours)} max</span>
                  {" • "}
                  <span>{pattern.totalMeetings} meetings total</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Context Switches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contextSwitches.map((cs, index) => (
              <div key={index} className="border-b pb-4 last:border-0">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">
                    {cs.date.toLocaleDateString()}
                  </span>
                  <span className="text-muted-foreground">
                    {formatHours(cs.timeBetween)} gap
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <div className="flex justify-between">
                      <span>{cs.firstMeeting.summary}</span>
                      <span>{formatHours(cs.firstMeeting.duration)}</span>
                    </div>
                    <div className="text-muted-foreground">
                      {cs.firstMeeting.startTime.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {" - "}
                      {cs.firstMeeting.endTime.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between">
                      <span>{cs.secondMeeting.summary}</span>
                      <span>{formatHours(cs.secondMeeting.duration)}</span>
                    </div>
                    <div className="text-muted-foreground">
                      {cs.secondMeeting.startTime.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {" - "}
                      {cs.secondMeeting.endTime.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
