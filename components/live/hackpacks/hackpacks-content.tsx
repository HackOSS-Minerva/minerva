"use client";

import { useState } from "react";
import { hackpacks } from "@/data/hackpacks";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { IconSearch, IconExternalLink, IconStarFilled } from "@tabler/icons-react";
import type { Hackpack } from "@/data/hackpacks";

const CATEGORIES = [
  "All",
  "Cloud Credits",
  "AI APIs",
  "Developer Tools",
  "Design Tools",
  "Domains",
] as const;

export function HackpacksContent() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const filtered = hackpacks.filter((h: Hackpack) => {
    if (activeCategory !== "All" && !h.category.includes(activeCategory as Hackpack["category"][number]))
      return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        h.name.toLowerCase().includes(q) ||
        h.sponsor.toLowerCase().includes(q) ||
        h.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="flex-wrap">
              {CATEGORIES.map((cat) => (
                <TabsTrigger key={cat} value={cat} className="text-xs">
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value={activeCategory} className="mt-4">
              {filtered.length === 0 && (
                <p className="text-center text-sm text-muted-foreground">
                  No resources found.
                </p>
              )}
              {filtered.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((hackpack) => (
                    <div key={hackpack.id} className="flex flex-col rounded-lg border bg-card p-3">
                      <div className="flex flex-1 flex-col gap-2">
                        <div className="mb-1 flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">
                            {hackpack.category.join(", ")}
                          </Badge>
                          {hackpack.featured && (
                            <IconStarFilled className="h-3 w-3 text-yellow-500" />
                          )}
                        </div>
                        <h3 className="font-semibold">{hackpack.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          by {hackpack.sponsor}
                        </p>
                        <p className="text-sm">{hackpack.description}</p>
                        {hackpack.instructions && (
                          <p className="text-xs text-muted-foreground">
                            {hackpack.instructions}
                          </p>
                        )}
                        <div className="mt-auto pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="w-full"
                          >
                            <a
                              href={hackpack.link}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Get Started
                              <IconExternalLink className="ml-1 h-3 w-3" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
    </div>
  );
}
