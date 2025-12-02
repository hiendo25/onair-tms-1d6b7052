import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useRef } from "react";
import { DefaultValues, FieldValues, useForm, UseFormReturn } from "react-hook-form";

interface UsePlanInlineFormProps<T extends FieldValues> {
  schema: any;
  defaultValues: DefaultValues<T>;
}

interface UsePlanInlineFormResult<T extends FieldValues> {
  form: UseFormReturn<T>;
  resetToDefault: (values?: Partial<T>) => void;
}

export const usePlanInlineForm = <T extends FieldValues>({
  schema,
  defaultValues,
}: UsePlanInlineFormProps<T>): UsePlanInlineFormResult<T> => {
  const defaultValuesRef = useRef(defaultValues);

  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: defaultValuesRef.current,
  });

  const resetToDefault = useCallback(
    (values?: Partial<T>) => {
      form.reset({
        ...defaultValuesRef.current,
        ...(values ?? {}),
      });
    },
    [form],
  );

  return { form, resetToDefault };
};
