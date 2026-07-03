"use client";

import { useState } from "react";
import { useIdeas } from "@/hooks/use-tenant-query";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Idea } from "@/types/live";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { roles } from "@/data/roles";

interface IdeaBoardProps {
  tenant: string;
}

export function IdeaBoard({ tenant }: IdeaBoardProps) {
  const ideas = useIdeas(tenant);
  const addIdea = useMutation(api.ideas.add);
  const removeIdea = useMutation(api.ideas.remove);

  const [newIdeaOpen, setNewIdeaOpen] = useState(false);
  const [deleteIdeaOpen, setDeleteIdeaOpen] = useState(false);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedRolesInput, setSelectedRolesInput] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const handleCreateIdea = async () => {
    if (!title.trim()) return;
    await addIdea({
      tenant,
      title: title.trim(),
      description: description.trim(),
      authorid: "",
      author: "Anonymous",
      skills: selectedRolesInput,
    });
    setTitle("");
    setDescription("");
    setSelectedRolesInput([]);
    setNewIdeaOpen(false);
  };

  const handleDeleteClick = (ideaId: string) => {
    setSelectedIdeaId(ideaId);
    setDeleteIdeaOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedIdeaId) return;
    await removeIdea({ id: selectedIdeaId as any });
    setDeleteIdeaOpen(false);
    setSelectedIdeaId(null);
  };

  const toggleRole = (role: string) => {
    setSelectedRolesInput((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  if (ideas === undefined) {
    return (
      <div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const query = searchQuery.toLowerCase();
  const filteredIdeas = ideas.filter((idea) => {
    const matchesSearch =
      !query ||
      idea.title.toLowerCase().includes(query) ||
      idea.description.toLowerCase().includes(query);
    return matchesSearch;
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <Input
          type="text"
          placeholder="Search ideas by title, description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />

        <Dialog open={newIdeaOpen} onOpenChange={setNewIdeaOpen}>
          <DialogTrigger asChild>
            <Button className="shrink-0">
              <IconPlus className="mr-2 h-4 w-4" />
              New Idea
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Your Idea</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Idea title"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your idea..."
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Looking for</label>
                <p className="text-xs text-muted-foreground mb-2">
                  Select the roles you need for your team.
                </p>
                <div className="flex flex-wrap gap-1">
                  {roles.map((role) => {
                    const isSelected = selectedRolesInput.includes(role);
                    return (
                      <Button
                        key={role}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleRole(role)}
                      >
                        {role}
                      </Button>
                    );
                  })}
                </div>
              </div>
              <Button onClick={handleCreateIdea} className="w-full">
                Post Idea
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredIdeas.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            {ideas.length === 0
              ? "No ideas yet. Be the first to share one!"
              : "No ideas match your search."}
          </p>
        )}

        {filteredIdeas.map((idea) => (
          <div
            key={idea._id}
            className="flex flex-col rounded-lg border bg-card p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold">{idea.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {idea.description}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  by {idea.author}
                </p>
              </div>
            </div>

            {(idea as Idea).skills?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                <span className="text-xs text-muted-foreground">
                  Looking for:
                </span>
                {(idea as Idea).skills.map((skill: string) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="text-[10px]"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <Dialog open={deleteIdeaOpen} onOpenChange={setDeleteIdeaOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Idea</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this idea? This action cannot be
            undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteIdeaOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
