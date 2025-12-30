import MobileDropdownItem from "./MobileDropdownItem";

export default function MobileDropdown({ title, icon, items }) {
  return (
    <div aria-expanded="false" className="group">
      <button
        type="button"
        className="flex size-full items-center gap-2 rounded-md px-1.5 py-2.5 text-secondary transition-colors hover:bg-virtus-700 hover:text-primary"
      >
        {title}
        {icon && <span className="ml-1 size-3">{icon}</span>}
      </button>
      <div className="flex h-fit max-h-0 flex-col gap-4 overflow-hidden px-2 opacity-0 transition-all duration-400 group-aria-expanded:max-h-screen group-aria-expanded:py-2 group-aria-expanded:opacity-100">
        {items.map((item, index) => (
          <MobileDropdownItem key={index} {...item} />
        ))}
      </div>
    </div>
  );
}