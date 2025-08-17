import { signIn } from "@/auth";
import { Button } from "./ui/button";
import { DiscordLogoIcon } from "@radix-ui/react-icons";

export default function SignIn() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("discord");
      }}
    >
      <Button type="submit">
        <DiscordLogoIcon />
        <span className="ml-2">Sign in with Discord</span>
      </Button>
    </form>
  );
}
