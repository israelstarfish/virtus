// components/upgrade/PlanCard.tsx
import PlanFeature from "./PlanFeature";

export default function PlanCard({ name, price, description, ram, projects, color }: any) {
  return (
    <div
      className="flex-1 rounded-md border-2 p-4 bg-gradient-to-b from-[rgba(0,0,0,0.15)] to-transparent"
      style={{
        borderColor: `rgba(${color}, 0.25)`,
        background: `linear-gradient(to bottom, rgba(${color}, 0.15), transparent)`,
      }}
    >
      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center">
          <p className="font-semibold text-base">{name}</p>
          <p className="font-bold text-xl" style={{ color: `rgb(${color})` }}>
            {price}
          </p>
        </div>
        <p className="text-sm text-gray-300">{description}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <PlanFeature label="RAM" value={ram} color={color} />
        <PlanFeature label="Projetos" value={projects} color={color} />
      </div>

      <button
        className="w-full h-9 px-3 text-sm font-normal rounded-md transition-all hover:cursor-pointer"
        style={{
          backgroundColor: `rgba(${color}, 0.1)`,
        }}
      >
        Mais Detalhes
      </button>
    </div>
  );
}