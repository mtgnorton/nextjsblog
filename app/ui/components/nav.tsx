import NavLinks from "./nav-links";
import ThemeChange from "./theme-change";
export default function Nav() {
  return (
    <div className="flex flex-row justify-between ">
        <div className="flex flex-row gap-2"> 
            <NavLinks />
        </div>
        <div>
            <ThemeChange />
        </div>
    </div>
  );
}