import Link from "next/link";

export default function DesktopDropdown({ title, icon, items }) {
  return (
    <li className="relative group">
      <button className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-secondary text-sm transition-colors hover:bg-blue-200/5 hover:text-primary">
        {title}
        {icon && <span className="ml-1 size-3">{icon}</span>}
      </button>
      <div className="absolute left-0 top-full z-50 hidden w-max min-w-[300px] flex-col gap-2 rounded-md bg-background p-4 shadow-lg group-hover:flex">
        {items.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className="flex items-start gap-3 rounded-md px-2 py-2 text-secondary hover:bg-virtus-700 hover:text-primary"
          >
            <span className="mt-1 shrink-0">{item.icon}</span>
            <div>
              <h3 className="font-medium text-primary">{item.title}</h3>
              <p className="text-sm">{item.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </li>
  );
}