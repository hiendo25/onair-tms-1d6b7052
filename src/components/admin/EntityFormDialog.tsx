import { useEffect, type ReactNode } from "react";
import { useForm, FormProvider, Controller, type DefaultValues, type FieldValues, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ZodType } from "zod";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export type FieldDef<T extends FieldValues> =
  | { name: Path<T>; label: string; type: "text" | "number" | "email" | "tel" | "date" | "url"; required?: boolean; placeholder?: string; note?: ReactNode; help?: string }
  | { name: Path<T>; label: string; type: "textarea"; required?: boolean; placeholder?: string; rows?: number; help?: string }
  | { name: Path<T>; label: string; type: "select"; required?: boolean; options: { value: string; label: string }[]; placeholder?: string; help?: string }
  | { name: Path<T>; label: string; type: "switch"; help?: string };

interface Props<T extends FieldValues> {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  schema: ZodType<T>;
  fields: FieldDef<T>[];
  defaultValues: DefaultValues<T>;
  initialValues?: Partial<T>;
  onSubmit: (values: T) => Promise<void> | void;
  submitting?: boolean;
  submitLabel?: string;
  size?: "sm" | "md" | "lg";
}

export function EntityFormDialog<T extends FieldValues>({
  open, onOpenChange, title, description, schema, fields, defaultValues, initialValues, onSubmit, submitting, submitLabel, size = "md",
}: Props<T>) {
  const methods = useForm<T>({ resolver: zodResolver(schema) as never, defaultValues });
  const { control, handleSubmit, reset, formState: { errors } } = methods;

  useEffect(() => {
    if (open) reset({ ...defaultValues, ...(initialValues ?? {}) } as DefaultValues<T>);
  }, [open, initialValues]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = handleSubmit(async (v) => { await onSubmit(v); onOpenChange(false); });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(size === "lg" && "max-w-2xl", size === "sm" && "max-w-sm")}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <FormProvider {...methods}>
          <form onSubmit={submit} className="grid gap-4 max-h-[70vh] overflow-y-auto pr-1">
            {fields.map((f) => {
              const err = (errors as Record<string, { message?: string } | undefined>)[f.name as string]?.message;
              return (
                <div key={f.name as string} className="grid gap-1.5">
                  <Label className={cn(err && "text-destructive")}>
                    {f.label}{"required" in f && f.required && <span className="text-destructive"> *</span>}
                  </Label>
                  <Controller
                    control={control}
                    name={f.name}
                    render={({ field }) => {
                      if (f.type === "textarea") {
                        return <Textarea rows={f.rows ?? 3} placeholder={f.placeholder} {...field} value={(field.value as string) ?? ""} />;
                      }
                      if (f.type === "select") {
                        return (
                          <Select value={(field.value as string) ?? ""} onValueChange={field.onChange}>
                            <SelectTrigger><SelectValue placeholder={f.placeholder} /></SelectTrigger>
                            <SelectContent>
                              {f.options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        );
                      }
                      if (f.type === "switch") {
                        return <Switch checked={!!field.value} onCheckedChange={field.onChange} />;
                      }
                      const isNumber = f.type === "number";
                      return (
                        <Input
                          type={f.type}
                          placeholder={f.placeholder}
                          value={(field.value as string | number | undefined) ?? ""}
                          onChange={(e) => field.onChange(isNumber ? (e.target.value === "" ? undefined : Number(e.target.value)) : e.target.value)}
                        />
                      );
                    }}
                  />
                  {"note" in f && f.note && <div className="text-xs text-muted-foreground">{f.note}</div>}
                  {f.help && !err && <p className="text-xs text-muted-foreground">{f.help}</p>}
                  {err && <p className="text-xs text-destructive">{String(err)}</p>}
                </div>
              );
            })}
            <DialogFooter className="sticky bottom-0 bg-background pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Huỷ</Button>
              <Button type="submit" disabled={submitting}>{submitLabel ?? (initialValues ? "Cập nhật" : "Lưu")}</Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
