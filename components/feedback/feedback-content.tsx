"use client";

import { useState } from "react";
import Image from "next/image";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTenant } from "@/hooks/use-tenant";
import { FormLockModal } from "@/components/forms/form-lock-modal";
import { toast } from "sonner";

interface FeedbackContentProps {
  tenant: string;
}

export const FeedbackContent = ({ tenant }: FeedbackContentProps) => {
  const [find, setFind] = useState("");
  const [likedToSee, setLikedToSee] = useState("");
  const [notBeneficial, setNotBeneficial] = useState("");
  const [rating, setRating] = useState("");
  const [anythingElse, setAnythingElse] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const addFeedback = useMutation(api.feedback.add);
  const { headers, tenant: tenantConfig } = useTenant();
  const Header = headers.feedback;

  const canSubmit =
    find.trim() && likedToSee.trim() && notBeneficial.trim() && rating !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      toast.error("Please complete all required fields", {
        description: "All questions must be answered before submitting.",
      });
      return;
    }

    setSubmitting(true);

    try {
      await addFeedback({
        find: find.trim(),
        liked_to_see: likedToSee.trim(),
        not_beneficial: notBeneficial.trim(),
        rating: parseInt(rating, 10),
        anything_else: anythingElse.trim(),
        tenant: tenant.toLowerCase(),
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="w-full sm:max-w-md border-none">
        <CardHeader>
          <h2 className="text-2xl font-bold text-center">
            Thank You for Your Feedback!
          </h2>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Your anonymous feedback has been received. We appreciate you taking
            the time to help us improve the event.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Image src={tenantConfig.logo} alt="logo" width={200} height={200} />
      <FormLockModal form="feedback" />
      <Card className="w-full sm:max-w-md border-none">
        <CardHeader>
          <Header />
        </CardHeader>
        <CardContent>
          <form
            id="feedback-form"
            onSubmit={handleSubmit}
            className="flex flex-col gap-6"
          >
            {/* Question 1 */}
            <Field>
              <FieldLabel>How did you find DesignVerse 2026?</FieldLabel>
              <Select
                value={find}
                onValueChange={setFind}
                disabled={submitting}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an option..." />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "instagram",
                    "discord",
                    "website",
                    "class announcement",
                    "devpost",
                    "tabling",
                    "student organization",
                    "email",
                  ].map((option) => (
                    <SelectItem key={option} value={option}>
                      {option
                        .split(" ")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() + word.slice(1),
                        )
                        .join(" ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            {/* Question 2 */}
            <Field>
              <FieldLabel>
                Was there anything that you would have liked to see at
                DesignVerse 2026?
              </FieldLabel>
              <Textarea
                placeholder="What sessions, activities, or features would you have liked?"
                value={likedToSee}
                onChange={(e) => setLikedToSee(e.target.value)}
                rows={3}
                required
                disabled={submitting}
                className="w-full"
              />
            </Field>

            {/* Question 3 */}
            <Field>
              <FieldLabel>
                Was there anything that you did not find beneficial about
                DesignVerse 2026?
              </FieldLabel>
              <Textarea
                placeholder="What could be improved or removed?"
                value={notBeneficial}
                onChange={(e) => setNotBeneficial(e.target.value)}
                rows={3}
                required
                disabled={submitting}
                className="w-full"
              />
            </Field>

            {/* Question 4 - Rating */}
            <Field>
              <FieldLabel>
                Please rate DesignVerse 2026 on a scale of 1 - 10
              </FieldLabel>
              <Select
                value={rating}
                onValueChange={setRating}
                disabled={submitting}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a rating..." />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? "(Worst)" : num === 10 ? "(Best)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            {/* Question 5 */}
            <Field>
              <FieldLabel>
                Is there anything else you&apos;d like to let us know about
                DesignVerse 2026?
              </FieldLabel>
              <Textarea
                placeholder="Any additional thoughts or comments..."
                value={anythingElse}
                onChange={(e) => setAnythingElse(e.target.value)}
                rows={3}
                disabled={submitting}
                className="w-full"
              />
            </Field>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Field orientation="horizontal" className="justify-center">
            <Button
              type="submit"
              form="feedback-form"
              disabled={submitting || !canSubmit}
            >
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          </Field>
        </CardFooter>
      </Card>
    </>
  );
};
