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
import { useParams } from "next/navigation";
import { getTenant, type TenantSlug } from "@/hooks/get-tenant";
import { authClient } from "@/lib/auth-client";
import {
  PLACEHOLDER_DISPLAY_EMAIL,
  PLACEHOLDER_DISPLAY_NAME,
} from "@/lib/checkin";
import { getInitials } from "@/lib/utils";

export function AvatarProfile() {
  const { tenant } = useParams<{ tenant: TenantSlug }>();
  const { config } = getTenant(tenant);
  const { domain } = config;
  const { data: session } = authClient.useSession();

  // Display-only while the session loads; check-in QRs never use these.
  const name = session?.user?.name ?? PLACEHOLDER_DISPLAY_NAME;
  const email = session?.user?.email ?? PLACEHOLDER_DISPLAY_EMAIL;
  const initials = getInitials(name);

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
          <p className="text-xs font-normal text-muted-foreground">{email}</p>
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
