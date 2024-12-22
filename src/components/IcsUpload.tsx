import { ChangeEvent, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { Loader2 } from "lucide-react";

interface IcsUploadProps {
  onDataReady: (
    fileContent: string,
    salary: number | null,
    email: string,
    excludeRecurring: boolean,
  ) => void;
  isLoading: boolean;
}

export function IcsUpload({ onDataReady, isLoading }: IcsUploadProps) {
  const [salary, setSalary] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [excludeRecurring, setExcludeRecurring] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Please select a file");
      return;
    }
    if (!email) {
      setError("Please enter your email");
      return;
    }

    try {
      const text = await file.text();
      const parsedSalary = salary ? Number(salary) : null;
      onDataReady(text, parsedSalary, email, excludeRecurring);
    } catch {
      setError("Error reading file");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Your Calendar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="file" className="text-sm font-medium">
            ICS File:
          </label>
          <Input
            type="file"
            id="file"
            accept=".ics"
            onChange={handleFileChange}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="salary"
            className="text-sm font-medium flex items-center gap-2"
          >
            Annual Salary
            <span className="text-sm text-muted-foreground italic">
              (Optional)
            </span>
          </label>
          <Input
            type="number"
            id="salary"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            placeholder="Enter your annual salary"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Your Email:
          </label>
          <Input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            disabled={isLoading}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="recurring"
            checked={excludeRecurring}
            onCheckedChange={(checked) =>
              setExcludeRecurring(checked as boolean)
            }
            disabled={isLoading}
          />
          <label
            htmlFor="recurring"
            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Exclude recurring meetings (weekly/daily)
          </label>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button onClick={handleSubmit} className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Parse Calendar"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
