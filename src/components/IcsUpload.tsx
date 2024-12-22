import { useState, ChangeEvent, FormEvent } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { DatePicker } from "./ui/date-picker";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface IcsUploadProps {
  onDataReady: (
    fileContent: string,
    salary: number | null,
    email: string,
    excludeRecurring: boolean,
    startDate: Date,
    endDate: Date,
  ) => void;
  isLoading: boolean;
}

export function IcsUpload({ onDataReady, isLoading }: IcsUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [salary, setSalary] = useState<string>("");
  const [email, setEmail] = useState("");
  const [excludeRecurring, setExcludeRecurring] = useState(false);
  const [startDate, setStartDate] = useState<Date>(
    new Date(new Date().getFullYear(), 0, 1),
  );
  const [endDate, setEndDate] = useState<Date>(
    new Date(new Date().getFullYear(), 11, 31),
  );

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file || !email) {
      alert("Please select a file and enter your email");
      return;
    }

    try {
      const fileContent = await file.text();
      onDataReady(
        fileContent,
        salary ? parseFloat(salary) : null,
        email,
        excludeRecurring,
        startDate,
        endDate,
      );
    } catch (err) {
      console.error("Error reading file:", err);
      alert("Error reading file. Please try again.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Your Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file">ICS File</Label>
              <Input
                id="file"
                type="file"
                accept=".ics"
                onChange={handleFileChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Your Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary" className="flex items-center gap-2">
                Annual Salary
                <span className="text-sm text-muted-foreground italic">
                  (optional)
                </span>
              </Label>
              <Input
                id="salary"
                type="number"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="e.g. 100000"
              />
            </div>

            <div className="space-y-2">
              <Label>Start Date</Label>
              <DatePicker
                date={startDate}
                onSelect={(date) => date && setStartDate(date)}
              />
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <DatePicker
                date={endDate}
                onSelect={(date) => date && setEndDate(date)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="excludeRecurring"
                checked={excludeRecurring}
                onCheckedChange={(checked) =>
                  setExcludeRecurring(checked as boolean)
                }
              />
              <Label
                htmlFor="excludeRecurring"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Exclude recurring meetings
              </Label>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Processing..." : "Calculate"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
