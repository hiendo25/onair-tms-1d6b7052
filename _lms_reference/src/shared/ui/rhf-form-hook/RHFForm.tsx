("use client");
import React, { createContext, memo, use, useContext, useId } from "react";
import { Children, createElement } from "react";
import {
  FieldValues,
  Form,
  FormProvider,
  UseFormReturn,
} from "react-hook-form";
import { useForm, useFormContext } from "react-hook-form";

import RHFTextField, { RHFTextFieldProps } from "../form/RHFTextField";

const RHFFormContext = createContext<UseFormReturn<any> | null>(null);

export function useRHFFormContext<T extends FieldValues>() {
  const ctx = useContext(RHFFormContext);
  if (!ctx) throw new Error("useRHFFormContext must be used inside RHFForm");
  return ctx as UseFormReturn<T>;
}

interface RHFFormProps<T extends FieldValues> {
  methods: UseFormReturn<T>;
  children: (methods: UseFormReturn<T>) => React.ReactNode;
}
function BaseRHFForm<T extends FieldValues>({
  methods,
  children,
}: RHFFormProps<T>) {
  return (
    <RHFFormContext.Provider value={methods}>
      <FormProvider {...methods}>
        <Form>{children(methods)}</Form>
      </FormProvider>
    </RHFFormContext.Provider>
  );
}
export default BaseRHFForm;

BaseRHFForm.TextField = <T extends FieldValues>(
  props: Omit<RHFTextFieldProps<T>, "control">,
) => {
  return (
    <ConnectFormContext>
      {({ control }) => <RHFTextField control={control} {...props} />}
    </ConnectFormContext>
  );
};

const ConnectFormContext = <T extends FieldValues>({
  children,
}: {
  children: (methods: UseFormReturn<T>) => React.ReactNode;
}) => {
  const methods = useFormContext<T>();
  return children(methods);
};

export const RHFForm = Object.assign(BaseRHFForm, {
  TextField: RHFTextField,
});
