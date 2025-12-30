import Logo from "./Logo";
import NavMenu from "./NavMenu";
import UserMenu from "./UserMenu";
import LanguageSwitcher from "./LanguageSwitcher";
import MobileMenu from "./MobileMenu";

export default function Header() {
  return (
    <header className="group sticky top-0 z-50 max-h-screen min-h-20 w-full border-virtus-600 border-b bg-background/75 backdrop-blur-2xl max-xl:overflow-auto">
      <div className="container flex min-h-20 flex-wrap place-items-center justify-between px-4 sm:px-6 xl:grid xl:grid-cols-3">
        <Logo />
        <div className="hidden w-fit place-self-center xl:block">
          <NavMenu />
        </div>
        <div className="xl:flex hidden items-center gap-4 justify-self-end">
          <UserMenu />
          <LanguageSwitcher />
        </div>
        <MobileMenu />
      </div>
    </header>
  );
}