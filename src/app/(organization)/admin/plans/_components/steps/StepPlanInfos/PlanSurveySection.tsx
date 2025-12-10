"use client";

import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useDebounce from "@/hooks/useDebounce";
import { usePlanFormContext } from "@/modules/plans/use-plan-form-context";
import { Survey, surveySchema } from "@/modules/plans/plan-form.schema";
import { useUserOrganization } from "@/modules/organization/store/UserOrganizationProvider";
import { useGetPlanningSurveysQuery } from "@/modules/plans/operations/query";
import { PlanningSurveyOption } from "@/services/surveys/survey.service";
import { useGetOrganizationUnitsByOrgQuery } from "@/modules/organization-units/operations/query";
import { SurveyConfigDialog } from "./SurveyConfigDialog";
import { SurveyPickerDialog } from "./SurveyPickerDialog";
import { SurveySummary } from "./SurveySummary";
import { SURVEY_TARGET_OPTIONS, UnitOption } from "./survey-options";

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
});

export function PlanSurveySection() {
  const { control, setValue, clearErrors, getValues } = usePlanFormContext();
  const userInfo = useUserOrganization((state) => state.data);
  const watchedSurvey = useWatch({ control, name: "info.survey" }) as Survey | undefined;
  const surveyValue = watchedSurvey ?? (getValues("info.survey") as Survey | undefined);

  const [isPickerOpen, setPickerOpen] = useState(false);
  const [isConfigOpen, setConfigOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedSurvey, setSelectedSurvey] = useState<PlanningSurveyOption | null>(null);

  const debouncedSearch = useDebounce(search, 400);

  const { data: surveys = [], isLoading: isLoadingSurveys } = useGetPlanningSurveysQuery(
    userInfo?.organization?.id,
    debouncedSearch,
  );

  const { data: organizationUnits = [] } = useGetOrganizationUnitsByOrgQuery(userInfo?.organization?.id);

  const branches = useMemo<UnitOption[]>(
    () => organizationUnits.filter((unit: any) => unit.type === "branch").map((u: any) => ({ id: u.id, name: u.name, type: u.type })),
    [organizationUnits],
  );
  const departments = useMemo<UnitOption[]>(
    () => organizationUnits.filter((unit: any) => unit.type === "department").map((u: any) => ({ id: u.id, name: u.name, type: u.type })),
    [organizationUnits],
  );

  const configForm = useForm({
    resolver: zodResolver(surveySchema),
    defaultValues: buildSurveyDefaults(surveyValue),
  });

  const activeSurvey = selectedSurvey ?? (surveyValue
    ? { id: surveyValue.id, title: surveyValue.title, createdAt: surveyValue.createdAt ?? null }
    : null);

  const handleOpenPicker = () => {
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
    setSelectedSurvey(null);
    configForm.reset(buildSurveyDefaults(surveyValue));
    setConfigOpen(true);
  };

  const handleSaveSurveyConfig = configForm.handleSubmit(async (values) => {
    setValue("info.survey", values, { shouldDirty: true, shouldTouch: true });
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
        onClose={() => setPickerOpen(false)}
        onSearchChange={setSearch}
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
        departments={departments}
        branches={branches}
        isSaving={isSavingSurvey}
      />
    </>
  );
}
