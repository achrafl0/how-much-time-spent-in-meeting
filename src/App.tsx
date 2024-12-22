import { useState } from "react";
import { IcsUpload } from "./components/IcsUpload";
import { StatsView } from "./features/meetings/components/StatsView";
import { Analytics } from "@vercel/analytics/react";
import { EfficiencyView } from "./features/meetings/components/EfficiencyView";
import { ColleagueView } from "./features/meetings/components/ColleagueView";
import { parseIcsData } from "./features/calendar/lib/parser";
import { processEvents } from "./features/calendar/lib/processor";
import type { ProcessedStats } from "./features/calendar/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";

function App() {
  const [stats, setStats] = useState<ProcessedStats | null>(null);
  const [startDate, setStartDate] = useState<Date>(
    new Date(new Date().getFullYear(), 0, 1),
  );
  const [endDate, setEndDate] = useState<Date>(
    new Date(new Date().getFullYear(), 11, 31),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [selectedColleague, setSelectedColleague] = useState<string | null>(
    null,
  );

  const handleDataReady = async (
    fileContent: string,
    salary: number | null,
    email: string,
    excludeRecurring: boolean,
    startDate: Date,
    endDate: Date,
  ) => {
    try {
      setIsLoading(true);
      const events = parseIcsData(fileContent);
      const processedStats = processEvents(
        events,
        email,
        salary,
        excludeRecurring,
        startDate,
        endDate,
      );
      setStats(processedStats);
      setStartDate(startDate);
      setEndDate(endDate);
    } catch (error) {
      console.error("Error processing calendar data:", error);
      alert("Error processing calendar data. Please check the file format.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Analytics />
      <div className="container mx-auto px-4 py-8 lg:px-8">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-8">
          Meeting Cost Calculator
        </h1>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-[400px] lg:sticky lg:top-8 lg:self-start">
            <IcsUpload onDataReady={handleDataReady} isLoading={isLoading} />
          </div>
          {isLoading && <div className="flex-1">Loading...</div>}
          {!isLoading && stats && (
            <div className="flex-1">
              <Tabs defaultValue="stats" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="stats">Stats</TabsTrigger>
                  <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
                  <TabsTrigger value="colleague">Colleague</TabsTrigger>
                </TabsList>
                <TabsContent value="stats">
                  <StatsView {...stats} />
                </TabsContent>
                <TabsContent value="efficiency">
                  <EfficiencyView
                    busiestDays={stats.busiestDays}
                    freestDays={stats.freestDays}
                    weekdayPatterns={stats.weekdayPatterns}
                    startDate={startDate}
                    endDate={endDate}
                    contextSwitches={stats.contextSwitches}
                    heatmapData={stats.heatmapData}
                  />
                </TabsContent>
                <TabsContent value="colleague">
                  <ColleagueView
                    colleagues={stats.topColleagues}
                    startDate={startDate}
                    endDate={endDate}
                    selectedColleague={
                      selectedColleague
                        ? stats.colleagueStats[selectedColleague]
                        : null
                    }
                    onColleagueSelect={setSelectedColleague}
                  />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
