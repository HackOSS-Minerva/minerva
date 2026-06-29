"use client";

import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { useTenant } from "@/hooks/use-tenant";
import Link from "next/link";
import { signOut } from "@workos-inc/authkit-nextjs";

export function AvatarProfile() {
  const { user, loading } = useAuth();

  const {
    tenant: { domain },
  } = useTenant();

  if (loading) {
    return (
      <Avatar className="cursor-pointer">
        <AvatarFallback>...</AvatarFallback>
      </Avatar>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await signOut();
  };

  const getInitials = () => {
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full focus:outline-none transition-transform duration-200 hover:scale-110 cursor-pointer">
          <Avatar>
            <AvatarImage src={user.profilePictureUrl!} alt={user.email} />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-1">
          <p className="font-semibold text-primary">{`${user.firstName} ${user.lastName}`}</p>
          <p className="text-xs font-normal text-muted-foreground">
            {user.email}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-primary">
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>

        <DropdownMenuItem className="text-primary" asChild>
          <Link href={domain}>
            <LogOut className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
