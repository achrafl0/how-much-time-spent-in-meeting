import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatName, formatHours, formatPercentage } from "../../../lib/format";

interface TimeDistribution {
  email: string;
  hours: number;
  percentage: number;
}

interface TimeDistributionChartProps {
  data: TimeDistribution[];
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

export function TimeDistributionChart({ data }: TimeDistributionChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Time Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="hours"
                nameKey="email"
                cx="50%"
                cy="45%"
                outerRadius={150}
                label={({ email, percentage }) =>
                  `${formatName(email)} (${formatPercentage(percentage)})`
                }
                labelLine={{ strokeWidth: 2 }}
                paddingAngle={2}
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [
                  formatHours(value),
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
  );
}
