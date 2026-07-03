"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTenant } from "@/hooks/use-tenant";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [{ href: "/sponsor/dashboard", label: "Dashboard" }];

const getInvolvedItems = [
  {
    href: "/sponsor/resume-book",
    label: "Resume Book",
    description: "Browse participant resumes and profiles.",
  },
  {
    href: "/sponsor/team-projects",
    label: "Team Projects",
    description: "Browse submitted team projects and demo links.",
  },
  {
    href: "/sponsor/analytics",
    label: "Hackathon Analytics",
    description: "View event statistics and insights.",
  },
];

export function SponsorNav({ tenant }: { tenant: string }) {
  const pathname = usePathname();
  const { tenant: tenantConfig } = useTenant();
  const logo = tenantConfig?.logo;

  return (
    <nav className="flex items-center justify-between gap-1 w-full max-w-4xl mx-auto">
      {logo && (
        <Link
          href={`/${tenant}/sponsor/dashboard`}
          className="flex items-center"
        >
          <Image
            src={logo}
            alt="Logo"
            width={120}
            height={48}
            className="h-16 w-auto object-contain"
          />
        </Link>
      )}
      <div className="flex items-center gap-1">
        {navItems.map((item) => {
          const isActive = pathname.includes("/sponsor/dashboard");

          return (
            <Link
              key={item.href}
              href={`/${tenant}${item.href}`}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                isActive ? "bg-background" : "",
                "text-foreground",
                "transition-all",
              )}
            >
              {item.label}
            </Link>
          );
        })}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "gap-1 transition-all",
                pathname.includes("/sponsor/resume-book") ||
                  pathname.includes("/sponsor/team-projects") ||
                  pathname.includes("/sponsor/analytics")
                  ? "bg-background shadow-sm"
                  : "",
                "text-foreground",
              )}
            >
              Get Involved
              <ChevronDownIcon className="size-3 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            {getInvolvedItems.map((item) => (
              <DropdownMenuItem key={item.href} asChild>
                <Link
                  href={`/${tenant}${item.href}`}
                  className="flex flex-col items-start gap-0.5"
                >
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.description}
                  </span>
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
