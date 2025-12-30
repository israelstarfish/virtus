import Link from "next/link";

export default function MobileDropdownItem({ href, icon, title, description }) {
  return (
    <Link
      href={href}
      className="flex w-full items-center gap-4 rounded-md px-1.5 py-2.5 text-secondary transition-colors hover:bg-virtus-700 hover:text-primary"
    >
      <span className="shrink-0">{icon}</span>
      <div>
        <h3 className="font-medium text-primary">{title}</h3>
        <span className="text-sm">{description}</span>
      </div>
    </Link>
  );
}