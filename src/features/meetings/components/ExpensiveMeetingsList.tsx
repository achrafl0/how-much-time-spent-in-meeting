import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../components/ui/tooltip";
import { formatName, formatCost, formatHours } from "../../../lib/format";

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

interface ExpensiveMeetingsListProps {
  meetings: ExpensiveMeeting[];
}

export function ExpensiveMeetingsList({
  meetings,
}: ExpensiveMeetingsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 Most Expensive Meetings 💰</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {meetings.map((meeting, index) => (
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
                  <span>{formatHours(meeting.duration)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Attendees:</span>
                  <TooltipProvider>
                    <Tooltip>
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
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total Cost:</span>
                  <span>{formatCost(meeting.totalCost)}</span>
                </div>
              </div>
              {index < meetings.length - 1 && (
                <div className="border-b border-border my-4" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
