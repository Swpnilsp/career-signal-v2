import Dashboard from "@/components/Dashboard";

export const metadata = {
  title: "CareerSignal AI - Resume & LinkedIn Career Scoring",
  description: "FAANG-grade AI resume evaluation, job description scoring, and tailored optimization engine.",
};

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen bg-background text-foreground">
      <Dashboard />
    </main>
  );
}
