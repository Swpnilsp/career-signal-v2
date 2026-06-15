import Dashboard from "@/components/Dashboard";

export const metadata = {
  title: "GetHired AI (CareerSignal) | Tech Resume Scorer & Tailor Matcher",
  description: "Instant AI-powered tech resume evaluation, job description matching alignment, and custom bullet-point tailoring optimizer.",
};

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen bg-background text-foreground">
      <Dashboard />
    </main>
  );
}
