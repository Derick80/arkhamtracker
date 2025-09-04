import { auth } from "@/auth";
import { HomeIcon } from "lucide-react";
import Link from "next/link";
import ModeToggle from "./mode-toggle";
import SignIn from "./sign-in";
import { SignOut } from "./sign-out";

const NavigationBar = async () => {
  const session = await auth();
  const userId = session?.user?.id;

  return (
    <nav className="flex flex-row items-center justify-between w-full p-4 ">
      <div className="flex flex-row items-center space-x-4">
        {navLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="flex items-center space-x-2"
          >
            {link.icon}
            <span>{link.label}</span>
          </Link>
        ))}
      </div>
{/* come back to this part and create a dropdown menu or something similar  */}
      <div className="flex flex-row justify-around  items-center gap-4">
        <ModeToggle />
      
      </div>
    </nav>
  );
};

export default NavigationBar;

const navLinks = [{ label: "Arkham Tracker", href: "/", icon: <HomeIcon /> }];
