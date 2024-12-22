import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { formatName, formatCost, formatHours } from "../../../lib/format";

interface BestieProps {
  email: string;
  oneOnOneHours: number;
  meetingCount: number;
  totalCost: number | null;
}

export function BestieCard({
  email,
  oneOnOneHours,
  meetingCount,
  totalCost,
}: BestieProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Work Bestie 👥</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-lg font-semibold">{formatName(email)}</p>
        <div className="grid gap-1 text-sm">
          <div className="flex justify-between">
            <span>One-on-one time:</span>
            <span>{formatHours(oneOnOneHours)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total meetings:</span>
            <span>{meetingCount}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Cost together:</span>
            <span>{formatCost(totalCost)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
