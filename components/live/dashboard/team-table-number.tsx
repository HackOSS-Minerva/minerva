"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TenantSlug } from "@/hooks/get-tenant";

interface TeamTableNumberProps {
  tenant: TenantSlug;
}

export const TeamTableNumber = ({ tenant }: TeamTableNumberProps) => {
  const teamAssignment = useQuery(api.assignments.getMyTableNumber, { tenant });

  if (teamAssignment === undefined) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Judging Table</CardTitle>
      </CardHeader>
      <CardContent>
        {teamAssignment ? (
          <p>
            <span className="font-semibold">{teamAssignment.teamName}</span>
            {" — Table "}
            <span className="font-bold">{teamAssignment.tableNumber}</span>
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Your table number has not been assigned yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
