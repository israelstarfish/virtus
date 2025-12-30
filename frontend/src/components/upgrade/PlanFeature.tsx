// components/upgrade/PlanFeature.tsx

export default function PlanFeature({ label, value, color }: any) {
  return (
    <div
      className="flex flex-col items-center rounded-md border-2 px-2 py-2"
      style={{ borderColor: `rgba(${color}, 0.15)` }}
    >
      <p className="text-sm font-medium">{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  );
}