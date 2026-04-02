import { type FormEvent, useEffect, useMemo, useState } from "react";
import Button from "../../ui/ButtonComponent";
import Input from "../../ui/InputComponent";
import Select from "../../ui/Select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/AlertDialog";
import {
  LVECrudCreateConfig,
  LVECrudDeleteConfig,
  LVECrudEditConfig,
  LVECrudFieldDefinition,
} from "./types";

const textareaClassName =
  "flex min-h-[96px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary";

const resolveFieldValue = <TRecord,>(
  field: LVECrudFieldDefinition<TRecord>,
  record?: TRecord,
) => {
  if (record) {
    if (field.getValue) {
      return field.getValue(record);
    }

    const recordValue = (record as Record<string, unknown>)[field.name];
    if (recordValue !== undefined && recordValue !== null) {
      return String(recordValue);
    }
  }

  return field.defaultValue ?? "";
};

const buildInitialValues = <TRecord,>(
  fields: LVECrudFieldDefinition<TRecord>[],
  record?: TRecord,
) =>
  Object.fromEntries(
    fields.map((field) => [field.name, resolveFieldValue(field, record)]),
  ) as Record<string, string>;

interface LVERecordFormModalProps<TRecord> {
  open: boolean;
  mode: "create" | "edit";
  moduleLabel: string;
  record?: TRecord;
  config?: LVECrudCreateConfig<TRecord> | LVECrudEditConfig<TRecord>;
  isSubmitting?: boolean;
  errorMessage?: string;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: Record<string, string>) => void;
}

export function LVERecordFormModal<TRecord>({
  open,
  mode,
  moduleLabel,
  record,
  config,
  isSubmitting = false,
  errorMessage,
  onOpenChange,
  onSubmit,
}: LVERecordFormModalProps<TRecord>) {
  const fields = config?.fields ?? [];
  const [values, setValues] = useState<Record<string, string>>(() =>
    buildInitialValues(fields, record),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) {
      return;
    }

    setValues(buildInitialValues(fields, record));
    setErrors({});
  }, [fields, open, record]);

  const title = useMemo(() => {
    if (!config) {
      return "";
    }

    if (mode === "edit" && "title" in config && typeof config.title === "function" && record) {
      return config.title(record);
    }

    if ("title" in config && typeof config.title === "string" && config.title) {
      return config.title;
    }

    return `${mode === "create" ? "Create" : "Edit"} ${moduleLabel}`;
  }, [config, mode, moduleLabel, record]);

  const description = useMemo(() => {
    if (!config || !("description" in config)) {
      return undefined;
    }

    if (mode === "edit" && typeof config.description === "function" && record) {
      return config.description(record);
    }

    return typeof config.description === "string" ? config.description : undefined;
  }, [config, mode, record]);

  const submitLabel =
    config?.submitLabel ?? (mode === "create" ? `Create ${moduleLabel}` : "Save Changes");

  if (!open || !config) {
    return null;
  }

  const handleChange = (fieldName: string, value: string | number | (string | number)[]) => {
    const normalizedValue = Array.isArray(value) ? value.join(", ") : String(value);
    setValues((prev) => ({
      ...prev,
      [fieldName]: normalizedValue,
    }));
    setErrors((prev) => {
      if (!(fieldName in prev)) {
        return prev;
      }

      const nextErrors = { ...prev };
      delete nextErrors[fieldName];
      return nextErrors;
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = fields.reduce<Record<string, string>>((acc, field) => {
      if (field.required && !values[field.name]?.trim()) {
        acc[field.name] = `${field.label} is required.`;
      }

      return acc;
    }, {});

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSubmit(values);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4 py-6">
      <div className="w-full max-w-3xl rounded-xl border border-border bg-card shadow-2xl">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          {errorMessage && (
            <div className="border-b border-destructive/20 bg-destructive/10 px-5 py-3 text-sm text-destructive">
              {errorMessage}
            </div>
          )}

          <div className="max-h-[70vh] overflow-auto px-5 py-5">
            <div className="grid gap-4 md:grid-cols-2">
              {fields.map((field) => {
                const fieldValue = values[field.name] ?? "";

                return (
                  <div
                    key={field.id}
                    className={field.colSpan === 2 ? "md:col-span-2" : undefined}
                  >
                    <label className="block text-sm font-medium text-foreground">
                      {field.label}
                      {field.required && <span className="ml-1 text-destructive">*</span>}
                    </label>
                    {field.description && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {field.description}
                      </p>
                    )}
                    <div className="mt-2">
                      {field.type === "textarea" ? (
                        <textarea
                          value={fieldValue}
                          onChange={(event) => handleChange(field.name, event.target.value)}
                          placeholder={field.placeholder}
                          rows={field.rows ?? 4}
                          disabled={isSubmitting}
                          className={textareaClassName}
                        />
                      ) : field.type === "select" ? (
                        <Select
                          value={fieldValue}
                          onChange={(value) => handleChange(field.name, value)}
                          options={field.options}
                          placeholder={field.placeholder ?? `Select ${field.label}`}
                          disabled={isSubmitting}
                          className="w-full"
                        />
                      ) : (
                        <Input
                          type={field.type ?? "text"}
                          value={fieldValue}
                          onChange={(event) => handleChange(field.name, event.target.value)}
                          placeholder={field.placeholder}
                          disabled={isSubmitting}
                          className="border-border bg-background text-foreground placeholder:text-muted-foreground"
                        />
                      )}
                    </div>
                    {errors[field.name] && (
                      <p className="mt-1 text-xs text-destructive">{errors[field.name]}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border px-5 py-4">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
              className="border-border bg-background text-foreground hover:bg-secondary"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {submitLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface LVEDeleteModalProps<TRecord> {
  open: boolean;
  moduleLabel: string;
  record?: TRecord;
  config?: LVECrudDeleteConfig<TRecord>;
  isSubmitting?: boolean;
  errorMessage?: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function LVEDeleteModal<TRecord>({
  open,
  moduleLabel,
  record,
  config,
  isSubmitting = false,
  errorMessage,
  onOpenChange,
  onConfirm,
}: LVEDeleteModalProps<TRecord>) {
  if (!config || !record) {
    return null;
  }

  const title =
    typeof config.title === "function"
      ? config.title(record)
      : config.title ?? `Delete ${moduleLabel}`;
  const description =
    typeof config.description === "function"
      ? config.description(record)
      : config.description ?? `This ${moduleLabel.toLowerCase()} will be removed from the workspace.`;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-border bg-card text-foreground">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {errorMessage && (
          <div className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {errorMessage}
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isSubmitting}
            className="mt-0 border-border bg-background text-foreground hover:bg-secondary"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isSubmitting}
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {config.confirmLabel ?? "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
