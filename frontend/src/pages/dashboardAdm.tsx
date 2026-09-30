interface DashboardAdmProps {
  onLogout: () => void;
}

export function DasboardAdm({ onLogout }: DashboardAdmProps) {
  return (
    <div className="min-h-screen bg-[#C5CBB0] flex flex-wrap items-center justify-center gap-12 p-8">
      <h1 className="text-2xl font-bold text-red-800">Ainda em obra </h1>
    </div>
  );
}
