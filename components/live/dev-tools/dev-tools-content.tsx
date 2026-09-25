"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  devTools,
  devToolCategories,
  type DevTool,
  type DevToolCategory,
} from "@/data/dev-tools";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IconSearch, IconExternalLink, IconX } from "@tabler/icons-react";

const ALL = "All";

/**
 * Up to two initials for the logo fallback tile. Single-word names fall back to
 * the first two characters (e.g. "Cline" -> "CL") so the tile is never a lone
 * letter.
 */
function initialsOf(name: string) {
  const words = name.split(/\s+/).filter((word) => /^[a-z0-9]/i.test(word[0]));
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return words
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

function matchesSearch(tool: DevTool, query: string) {
  const haystack = [tool.name, tool.description, tool.category, ...tool.tags]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

function ToolLogo({ tool }: { tool: DevTool }) {
  const [errored, setErrored] = useState(false);
  const logo = tool.logo ?? `/logos/${tool.id}.svg`;

  return (
    <div className="bg-muted flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border p-1.5">
      {errored ? (
        <span
          aria-hidden
          className="text-muted-foreground text-[11px] leading-none font-semibold"
        >
          {initialsOf(tool.name)}
        </span>
      ) : (
        <Image
          src={logo}
          alt={`${tool.name} logo`}
          width={24}
          height={24}
          className="size-full object-contain"
          onError={() => setErrored(true)}
          unoptimized
        />
      )}
    </div>
  );
}

export function DevToolsContent() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<
    DevToolCategory | typeof ALL
  >(ALL);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return devTools.filter((tool) => {
      if (activeCategory !== ALL && tool.category !== activeCategory)
        return false;
      return query ? matchesSearch(tool, query) : true;
    });
  }, [search, activeCategory]);

  // Bucket by category so results stay grouped even while searching.
  const grouped = useMemo(
    () =>
      devToolCategories
        .map((category) => ({
          category,
          tools: filtered.filter((tool) => tool.category === category),
        }))
        .filter((group) => group.tools.length > 0),
    [filtered],
  );

  const hasFilters = search.trim() !== "" || activeCategory !== ALL;

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-center justify-center">
        <div className="relative flex-1">
          <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search tools by name, category, or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <p className="text-sm text-muted-foreground sm:whitespace-nowrap">
          {filtered.length} of {devTools.length} tools
        </p>
      </div>

      <Tabs
        value={activeCategory}
        onValueChange={(value) =>
          setActiveCategory(value as DevToolCategory | typeof ALL)
        }
      >
        <TabsList className="h-auto flex-wrap">
          {[ALL, ...devToolCategories].map((category) => (
            <TabsTrigger key={category} value={category} className="text-xs">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSearch("");
            setActiveCategory(ALL);
          }}
        >
          <IconX className="h-3.5 w-3.5" />
          Clear filters
        </Button>
      )}

      {grouped.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No tools match your search.
        </p>
      ) : (
        <div className="space-y-8">
          {grouped.map(({ category, tools }) => (
            <section key={category} className="space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold tracking-wide uppercase">
                  {category}
                </h2>
                <Badge variant="outline" className="text-[10px]">
                  {tools.length}
                </Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tools.map((tool) => (
                  <DevToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function DevToolCard({ tool }: { tool: DevTool }) {
  return (
    <Card className="gap-4 py-5 transition-shadow hover:shadow-md">
      <CardHeader className="px-5">
        <div className="flex items-start gap-3">
          <ToolLogo tool={tool} />
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-base">{tool.name}</CardTitle>
            <p className="text-muted-foreground mt-0.5 text-xs">
              {tool.category}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 px-5">
        <p className="text-sm">{tool.description}</p>
        <div className="mt-auto flex flex-wrap items-center gap-1.5">
          {tool.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px]">
              {tag}
            </Badge>
          ))}
        </div>
        <Button variant="outline" size="sm" asChild className="w-full">
          <a href={tool.url} target="_blank" rel="noopener noreferrer">
            Visit {tool.name}
            <IconExternalLink className="h-3 w-3" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
