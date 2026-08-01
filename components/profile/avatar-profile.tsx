"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useTenant } from "@/hooks/use-tenant";
import { authClient } from "@/lib/auth-client";

export function AvatarProfile() {
  const {
    tenant: { domain },
  } = useTenant();
  const { data: session } = authClient.useSession();

  const name = session?.user?.name ?? "Guest User";
  const email = session?.user?.email ?? "guest@example.com";
  const initials =
    name
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "GU";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full focus:outline-none transition-transform duration-200 hover:scale-110 cursor-pointer">
          <Avatar>
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-1">
          <p className="font-semibold text-primary">{name}</p>
          <p className="text-xs font-normal text-muted-foreground">
            {email}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem className="text-primary" asChild>
          <Link href={domain}>
            <span>Back to Home</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
