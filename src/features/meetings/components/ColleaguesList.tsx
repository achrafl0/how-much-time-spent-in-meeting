import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Progress } from "../../../components/ui/progress";
import { formatName, formatCost, formatHours } from "../../../lib/format";

interface Colleague {
  email: string;
  totalHours: number;
  meetingCount: number;
  totalCost: number | null;
}

interface ColleaguesListProps {
  colleagues: Colleague[];
  totalMeetingHours: number;
}

export function ColleaguesList({
  colleagues,
  totalMeetingHours,
}: ColleaguesListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 10 Collaborators</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {colleagues.map((colleague) => (
            <li
              key={colleague.email}
              className="border-b pb-4 last:border-0 last:pb-0"
            >
              <div className="flex flex-col gap-2">
                <span className="font-medium">
                  {formatName(colleague.email)}
                </span>
                <div className="grid grid-cols-3 text-sm text-muted-foreground">
                  <span>{formatHours(colleague.totalHours)}</span>
                  <span>{colleague.meetingCount} meetings</span>
                  <span>{formatCost(colleague.totalCost)}</span>
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
  );
}
