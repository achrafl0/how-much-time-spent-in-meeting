import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Progress } from "../../../components/ui/progress";
import { formatCost, formatHours, formatPercentage } from "../../../lib/format";

interface TimeOverviewProps {
  totalMeetingHours: number;
  meetingTimePercentage: number;
  totalMeetingCost: number | null;
}

export function TimeOverview({
  totalMeetingHours,
  meetingTimePercentage,
  totalMeetingCost,
}: TimeOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Time Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Meeting Time</span>
            <span className="text-sm text-muted-foreground">
              {formatPercentage(meetingTimePercentage)}
            </span>
          </div>
          <Progress value={meetingTimePercentage} />
        </div>
        <div className="grid gap-2 text-sm">
          <div className="flex justify-between">
            <span>Total time in meetings:</span>
            <span className="font-medium">
              {formatHours(totalMeetingHours)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Total cost impact:</span>
            <span className="font-medium">{formatCost(totalMeetingCost)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
