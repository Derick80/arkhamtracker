import { auth } from "@/auth";
import { ContactIcon, HomeIcon, InfoIcon } from "lucide-react";
import Link from "next/link";


const NavigationBar = async () => {
const session = await auth()
const userId = session?.user?.id


    return(
        <nav 
        className="flex flex-row items-center justify-between p-4 border-b">
            {navLinks.map((link)=> (
                <Link
                key={link.label}
                href={link.href}
                className="flex items-center space-x-2"
                >
                {link.icon}
                <span>{link.label}</span>
                </Link>
            )
            )}
            {
                userId && (
                    <p>
                        welcome, user {userId}
                    </p>
                )
            }
        </nav>
    )
}


export default NavigationBar;   


const navLinks = [
    { label: "Arkham games", href: "/" ,
        icon: <HomeIcon />
    },
    { label: "About", href: "/about" ,
        icon: <InfoIcon />
    },
    { label: "Contact", href: "/contact" ,
        icon: <ContactIcon />
        },
];