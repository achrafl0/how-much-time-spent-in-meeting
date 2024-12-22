import { useState } from "react";
import { IcsUpload } from "./components/IcsUpload";
import { StatsView } from "./components/StatsView";
import { parseIcsData, processEvents } from "./utils/calendarProcessor";

interface Stats {
  totalMeetingHours: number;
  totalWorkingHours: number;
  meetingTimePercentage: number;
  totalMeetingCost: number | null;
  topColleagues: Array<{
    email: string;
    totalHours: number;
    meetingCount: number;
    totalCost: number | null;
  }>;
  bestie?: {
    email: string;
    oneOnOneHours: number;
    meetingCount: number;
    totalCost: number | null;
  };
  mostExpensiveMeetings: Array<{
    summary: string;
    date: Date;
    startTime: Date;
    endTime: Date;
    attendees: string[];
    attendeeCount: number;
    duration: number;
    totalCost: number | null;
  }>;
  colleagueTimeDistribution: Array<{
    email: string;
    hours: number;
    percentage: number;
  }>;
}

function App() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDataReady = async (
    fileContent: string,
    salary: number | null,
    email: string,
    excludeRecurring: boolean,
  ) => {
    try {
      setIsLoading(true);
      const events = parseIcsData(fileContent);
      const processedStats = processEvents(
        events,
        email,
        salary,
        excludeRecurring,
      );
      setStats(processedStats);
    } catch (error) {
      console.error("Error processing calendar data:", error);
      alert("Error processing calendar data. Please check the file format.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 lg:px-8">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-8">
          Meeting Cost Calculator
        </h1>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-[400px] lg:sticky lg:top-8 lg:self-start">
            <IcsUpload onDataReady={handleDataReady} isLoading={isLoading} />
          </div>
          <div className="flex-1">{stats && <StatsView {...stats} />}</div>
        </div>
      </div>
    </div>
  );
}

export default App;
