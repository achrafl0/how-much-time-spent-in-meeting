import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { formatHours } from "../../../lib/format";

interface HeatmapValue {
  date: Date;
  meetingHours: number;
}

interface MeetingHeatmapProps {
  data: HeatmapValue[];
  startDate: Date;
  endDate: Date;
  title?: string;
}

/*

.react-calendar-heatmap .color-github-0 {
  fill: #eeeeee;
}
.react-calendar-heatmap .color-github-1 {
  fill: #d6e685;
}
.react-calendar-heatmap .color-github-2 {
  fill: #8cc665;
}
.react-calendar-heatmap .color-github-3 {
  fill: #44a340;
}
.react-calendar-heatmap .color-github-4 {
  fill: #1e6823;
}
*/
const getColorScale =
  (minValue: number, maxValue: number) => (value: number) => {
    if (minValue === maxValue) return "color-empty";

    if (value === 0) return "color-empty";

    // Here we should use tailwind colors based on the max/min value
    const percent = (value - minValue) / (maxValue - minValue);

    if (percent < 0.2) return "color-gitlab-1";
    if (percent < 0.4) return "color-gitlab-2";
    if (percent < 0.6) return "color-gitlab-3";
    if (percent < 0.8) return "color-gitlab-4";
    return "color-gitlab-5";
  };

export function MeetingHeatmap({
  data,
  startDate,
  endDate,
  title = "Meeting Activity",
}: MeetingHeatmapProps) {
  const values = data.map((item) => ({
    date: item.date,
    count: item.meetingHours,
  }));

  const minValue = Math.min(...values.map((value) => value.count));
  const maxValue = Math.max(...values.map((value) => value.count));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <CalendarHeatmap
            startDate={startDate}
            endDate={endDate}
            values={values}
            classForValue={(value) => {
              if (!value) {
                return "color-empty";
              }
              return getColorScale(minValue, maxValue)(value.count);
            }}
            // @ts-expect-error - we need to use the date object
            tooltipDataAttrs={(value) => {
              if (!value || !value.date) return {};
              return {
                "data-tip": `${value?.date.toISOString().slice(0, 10)} has count: ${
                  value?.count
                }`,
              };
            }}
            showWeekdayLabels={true}
            titleForValue={(value) => {
              if (!value) return "No meetings";
              return `${value.date}: ${formatHours(value.count)}`;
            }}
          />
          <div className="flex justify-center items-center gap-2 text-sm">
            <span>Less</span>
            <div className="flex gap-1">
              <div
                className={`w-3 h-3 rounded ${getColorScale(minValue, maxValue)(0)}`}
              />
              <div
                className={`w-3 h-3 rounded ${getColorScale(minValue, maxValue)(2)}`}
              />
              <div
                className={`w-3 h-3 rounded ${getColorScale(minValue, maxValue)(4)}`}
              />
              <div
                className={`w-3 h-3 rounded ${getColorScale(minValue, maxValue)(6)}`}
              />
              <div
                className={`w-3 h-3 rounded ${getColorScale(minValue, maxValue)(8)}`}
              />
              <div
                className={`w-3 h-3 rounded ${getColorScale(minValue, maxValue)(10)}`}
              />
            </div>
            <span>More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
