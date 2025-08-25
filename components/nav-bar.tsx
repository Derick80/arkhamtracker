import { auth } from "@/auth";
import { ContactIcon, HomeIcon, InfoIcon } from "lucide-react";
import Link from "next/link";
import ModeToggle from "./mode-toggle";
import { Separator } from "./ui/separator";

const NavigationBar = async () => {
  const session = await auth();
  const userId = session?.user?.id;

  return (
    <nav className="flex flex-row items-center justify-between w-full p-4 border-2">
      <div className="border-2">
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

      <div className="flex flex-row justify-around border-2 items-center gap-4">
        <ModeToggle />
        {userId ? <p>welcome, user</p> : <p>Please log in</p>}
      </div>
    </nav>
  );
};

export default NavigationBar;

const navLinks = [{ label: "Arkham games", href: "/", icon: <HomeIcon /> }];
