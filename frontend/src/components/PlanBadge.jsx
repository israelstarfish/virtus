//frontend/src/components/PlanBadge.jsx

export function PlanBadge({ plan, tier }) {
  if (!plan) return null;
  const planColors = {
    'no-plan': '255,255,255',       // Branco
    test: '255,200,0',              // Amarelo
    basic: '125,125,125',           // Cinza
    pro: '52,78,212',               // Azul
    premium: '247,30,30',           // Vermelho
    enterprise: '102,36,209',       // Roxo
  };

  const isRealPlan = ['basic', 'pro', 'premium', 'enterprise'].includes(plan);
  const bgColor = planColors[plan] || '180,180,180';
  const label = isRealPlan ? `${capitalize(plan)} (${tier})` : capitalize(plan);

  return (
    <span
      className="select-none rounded-sm bg-linear-to-b from-[rgba(var(--bg-color),0.25)] to-[rgba(var(--bg-color),0.075)] px-1.5 py-0.5 font-medium text-primary text-xs capitalize hover:bg-virtus-800"
      style={{ '--bg-color': bgColor }}
    >
      {label}
    </span>
  );
}

function capitalize(text) {
  if (typeof text !== 'string' || !text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

//function capitalize(text) {
//  return text.charAt(0).toUpperCase() + text.slice(1);
//}