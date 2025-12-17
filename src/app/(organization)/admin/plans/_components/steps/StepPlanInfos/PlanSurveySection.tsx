"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import useDebounce from "@/hooks/useDebounce";
import { useUserOrganization } from "@/modules/organization/store/UserOrganizationProvider";
import { useGetOrganizationUnitsByOrgQuery } from "@/modules/organization-units/operations/query";
import { useGetPlanningSurveysQuery } from "@/modules/plans/operations/query";
import { Survey, SurveyFormValues, surveySchema } from "@/modules/plans/plan-form.schema";
import { PlanSurveyTarget } from "@/modules/plans/plan-form.schema";
import { usePlanFormContext } from "@/modules/plans/use-plan-form-context";
import { PlanningSurveyOption } from "@/services/surveys/survey.service";

import { SurveyConfigDialog } from "./SurveyConfigDialog";
import { SurveyPickerDialog } from "./SurveyPickerDialog";
import { SurveySummary } from "./SurveySummary";

export interface UnitOption {
  id: string;
  name: string;
  type?: "branch" | "department";
}

const SURVEY_TARGET_OPTIONS: { value: PlanSurveyTarget; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "department", label: "Theo phòng ban" },
  { value: "branch", label: "Theo chi nhánh" },
];


const buildSurveyDefaults = (
  survey?: Survey,
  picked?: PlanningSurveyOption | null,
): Survey => ({
  id: picked?.id || survey?.id || "",
  title: picked?.title || survey?.title || "",
  createdAt: picked?.createdAt ?? survey?.createdAt ?? null,
  planSurveyId: survey?.planSurveyId,
  startDate: survey?.startDate ?? null,
  endDate: survey?.endDate ?? null,
  targetType: survey?.targetType ?? "all",
  targetUnitIds: survey?.targetUnitIds ?? [],
  status: survey?.status ?? "pending",
  resultSummary: survey?.resultSummary ?? null,
});

export function PlanSurveySection() {
  const { control, setValue, clearErrors, getValues } = usePlanFormContext();
  const userInfo = useUserOrganization((state) => state.data);
  const watchedSurvey = useWatch({ control, name: "info.survey" }) as Survey | undefined;
  const surveyValue = watchedSurvey ?? (getValues("info.survey") as Survey | undefined);

  const [isPickerOpen, setPickerOpen] = useState(false);
  const [isConfigOpen, setConfigOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [unitSearch, setUnitSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedSurvey, setSelectedSurvey] = useState<PlanningSurveyOption | null>(null);
  const pageSize = 10;
  const unitPageSize = 10;

  const debouncedSearch = useDebounce(search, 400);
  const debouncedUnitSearch = useDebounce(unitSearch, 400);

  const configForm = useForm<SurveyFormValues, undefined, Survey>({
    resolver: zodResolver(surveySchema),
    defaultValues: buildSurveyDefaults(surveyValue),
  });

  const targetType = configForm.watch("targetType");

  useEffect(() => {
    setUnitSearch("");
  }, [targetType]);

  const { data: surveyList, isLoading: isLoadingSurveys } = useGetPlanningSurveysQuery({
    organizationId: userInfo?.organization?.id,
    search: debouncedSearch,
    page,
    limit: pageSize,
  });

  const { data: unitList, isLoading: isLoadingUnits, isFetching: isFetchingUnits } = useGetOrganizationUnitsByOrgQuery({
    organizationId: userInfo?.organization?.id,
    type: targetType === "branch" || targetType === "department" ? targetType : undefined,
    search: debouncedUnitSearch,
    page: 1,
    limit: unitPageSize,
    enabled: isConfigOpen && (targetType === "branch" || targetType === "department"),
  });

  const surveys = surveyList?.data ?? [];
  const totalSurveys = surveyList?.total ?? 0;

  const unitOptions = useMemo<UnitOption[]>(
    () => (unitList?.data ?? []).map((unit: any) => ({ id: unit.id, name: unit.name, type: unit.type })),
    [unitList],
  );

  const activeSurvey =
    selectedSurvey ??
    (surveyValue
      ? { id: surveyValue.id, title: surveyValue.title, createdAt: surveyValue.createdAt ?? null }
      : null);

  const handleOpenPicker = () => {
    setPage(1);
    setPickerOpen(true);
    setSelectedSurvey(null);
  };

  const handleSelectSurvey = (survey: PlanningSurveyOption) => {
    setSelectedSurvey(survey);
    configForm.reset(buildSurveyDefaults(surveyValue, survey));
    setPickerOpen(false);
    setConfigOpen(true);
  };

  const handleOpenConfig = () => {
    if (!surveyValue) {
      setPickerOpen(true);
      return;
    }
    setUnitSearch("");
    setSelectedSurvey(null);
    configForm.reset(buildSurveyDefaults(surveyValue));
    setConfigOpen(true);
  };

  const handleSaveSurveyConfig = configForm.handleSubmit(async (values) => {
    const nextValue: Survey = {
      ...values,
      resultSummary: values.resultSummary ?? surveyValue?.resultSummary ?? null,
    };

    setValue("info.survey", nextValue, { shouldDirty: true, shouldTouch: true });
    clearErrors("info.survey");
    setSelectedSurvey(null);
    setConfigOpen(false);
  });

  const handleClearSurvey = () => {
    setValue("info.survey", undefined, { shouldDirty: true, shouldTouch: true });
    setSelectedSurvey(null);
    clearErrors("info.survey");
  };

  const isSavingSurvey = false;

  return (
    <>
      <SurveySummary
        survey={surveyValue}
        onOpenConfig={handleOpenConfig}
        onOpenPicker={handleOpenPicker}
        onClear={handleClearSurvey}
      />

      <SurveyPickerDialog
        open={isPickerOpen}
        loading={isLoadingSurveys}
        surveys={surveys}
        search={search}
        page={page}
        limit={pageSize}
        total={totalSurveys}
        onClose={() => setPickerOpen(false)}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onPageChange={setPage}
        onSelect={handleSelectSurvey}
      />

      <SurveyConfigDialog
        open={isConfigOpen}
        onClose={() => setConfigOpen(false)}
        onSave={handleSaveSurveyConfig}
        form={configForm}
        surveyTitle={activeSurvey?.title}
        surveyCreatedAt={activeSurvey?.createdAt ?? null}
        targetOptions={SURVEY_TARGET_OPTIONS}
        unitOptions={unitOptions}
        unitSearch={unitSearch}
        onUnitSearchChange={setUnitSearch}
        unitLoading={isLoadingUnits || isFetchingUnits}
        isSaving={isSavingSurvey}
      />
    </>
  );
}
