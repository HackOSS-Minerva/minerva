"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDownIcon, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTenant } from "@/hooks/use-tenant";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [{ href: "/dashboard", label: "Dashboard" }];

const resourceItems = [
  {
    href: "/venue",
    label: "Venue",
    description: "Find location and event details.",
  },
  {
    href: "/hackpacks",
    label: "Hackpacks",
    description: "Access tools and resources for your project.",
  },
  {
    href: "/packing-list",
    label: "Packing List",
    description: "Check what to bring to the event.",
  },
  {
    href: "/rules",
    label: "Rules",
    description: "Review the hackathon rules and guidelines.",
  },
  {
    href: "/code-of-conduct",
    label: "Code of Conduct",
    description: "Understand our community standards.",
  },
];

const participateItems: { href: string; label: string; description: string; external?: boolean }[] = [
  {
    href: "/checkin",
    label: "Check-in",
    description: "Show your QR code to check in at the event.",
  },
  {
    href: "/forms/judge",
    label: "Register",
    description: "Create an account or sign in.",
  },
  {
    href: "/teams",
    label: "Team Finder",
    description: "Find teammates with complementary skills.",
  },
  {
    href: "/submit",
    label: "Submit Project",
    description: "Submit your finished project details.",
  },
];

export function LiveNav({ tenant }: { tenant: string }) {
  const pathname = usePathname();
  const { tenant: tenantConfig } = useTenant();
  const logo = tenantConfig?.logo;

  return (
    <nav className="flex items-center justify-between gap-1 w-full max-w-4xl mx-auto">
      {logo && (
        <Link
          href={`/${tenant}/live/dashboard`}
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
        const isActive = pathname.includes(item.href);

        return (
          <Link
            key={item.href}
            href={`/${tenant}/live${item.href}`}
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
            className="gap-1 transition-all"
          >
            Resources
            <ChevronDownIcon className="size-3 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center">
          {resourceItems.map((item) => (
            <DropdownMenuItem key={item.href} asChild>
              <Link
                href={`/${tenant}/live${item.href}`}
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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "gap-1 transition-all",
              pathname.includes("/forms/judge") || pathname.includes("/live/checkin") ? "bg-background shadow-sm" : "",
              "text-foreground",
            )}
          >
            Participate
            <ChevronDownIcon className="size-3 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center">
          {participateItems.map((item) => (
            <DropdownMenuItem key={item.label} asChild>
              <Link
                href={item.external ? item.href : item.href.startsWith("/forms") ? `/${tenant}${item.href}` : `/${tenant}/live${item.href}`}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                className="flex flex-col items-start gap-0.5"
              >
                <span className="flex items-center justify-between w-full gap-1 text-sm font-medium">
                  {item.label}
                  {item.external && (
                    <ExternalLink className="text-muted-foreground" />
                  )}
                </span>
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
