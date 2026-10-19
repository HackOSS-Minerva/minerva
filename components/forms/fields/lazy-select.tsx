"use client";

import { useEffect, useState } from "react";
import type { AnyFieldApi } from "@tanstack/react-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

/** Client body for `lazySelectField`: loads options on mount, then renders the
 * same select as `selectField`. Keeps big lists (schools) out of the initial
 * client bundle. Lives in its own `"use client"` file because `shared.tsx` is
 * imported through the server-side forms graph. */
export function LazySelectFieldBody({
  field,
  label,
  loadOptions,
}: {
  field: AnyFieldApi;
  label: string;
  loadOptions: () => Promise<readonly string[]>;
}) {
  const [options, setOptions] = useState<readonly string[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadOptions().then((loaded) => {
      if (!cancelled) setOptions(loaded);
    });
    return () => {
      cancelled = true;
    };
    // `loadOptions` is a stable module-level importer passed at field build.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name} className="text-primary">
        {label}
        <span className="text-destructive">*</span>
      </FieldLabel>
      <NativeSelect
        aria-invalid={isInvalid}
        className="min-w-30"
        name={field.name}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        disabled={options === null}
      >
        <NativeSelectOption value="">
          {options === null ? "Loading..." : "Select"}
        </NativeSelectOption>
        {options?.map((option) => (
          <NativeSelectOption key={option} value={option}>
            {option}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
