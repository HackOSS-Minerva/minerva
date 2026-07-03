"use client"

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

const navItems = [{ href: "/judge/dashboard", label: "Dashboard" }];

const participateItems = [
  {
    href: "/forms/judge",
    label: "Register",
    description: "Register as a judge for the event.",
  },
  {
    href: "/judge/assignments",
    label: "View Assignments",
    description: "See your assigned teams and judging slots.",
  },
  {
    href: "/judge/submissions",
    label: "Project Submissions",
    description: "Browse all submitted team projects and demo links.",
  },
  {
    href: "/judge/orientation",
    label: "Orientation",
    description:
      "Review judging criteria, rubrics, and event guidelines.",
  },
  {
    href: "/judge/certificate",
    label: "Certificate",
    description: "Download your certificate of service.",
  },
];

export function JudgeNav({ tenant }: { tenant: string }) {
  const pathname = usePathname();
  const { tenant: tenantConfig } = useTenant();
  const logo = tenantConfig?.logo;

  return (
    <nav className="flex items-center justify-between gap-1 w-full max-w-4xl mx-auto">
      {logo && (
        <Link
          href={`/${tenant}/judge/dashboard`}
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
          const isActive = pathname.includes("/judge/dashboard");

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
                (pathname.includes("/forms/judge") ||
                  pathname.includes("/judge/assignments") ||
                  pathname.includes("/judge/submissions") ||
                  pathname.includes("/judge/orientation") ||
                  pathname.includes("/judge/certificate"))
                  ? "bg-background shadow-sm"
                  : "",
                "text-foreground",
              )}
            >
              Participate
              <ChevronDownIcon className="size-3 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            {participateItems.map((item) => (
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
