import { supabase } from "@/services";
import {
  CreateCoursePayload,
  UpdateCoursePayload,
  CreatePivotCoursesWithCategoriesPayload,
  CreatePivotCoursesWithTeachersPayload,
  CreatePivotCoursesWithStudentsPayload,
  CreatePivotCoursesWithResourcesPayload,
} from "./type";

const createCourse = async (payload: CreateCoursePayload) => {
  try {
    return await supabase.from("courses").insert(payload).select("*").single();
  } catch (err: any) {
    console.log(err);
    throw new Error(err?.message);
  }
};

const updateCourse = async (payload: UpdateCoursePayload) => {
  try {
    const { id: courseId, ...restPayload } = payload;
    return await supabase.from("courses").update(restPayload).match({ id: courseId }).select("*").single();
  } catch (err: any) {
    console.log(err);
    throw new Error(err?.message);
  }
};

const createPivotCoursesWithCategories = async (payload: CreatePivotCoursesWithCategoriesPayload[]) => {
  try {
    return await supabase.from("courses_categories").insert(payload).select("*");
  } catch (err: any) {
    console.error("Unexpected error:", err);
    throw new Error(err?.message ?? "Unknown error craete Class Room");
  }
};

const createPivotCoursesWithStudents = async (payload: CreatePivotCoursesWithStudentsPayload[]) => {
  try {
    return await supabase.from("courses_students").insert(payload).select();
  } catch (err: any) {
    console.error("Unexpected error:", err);
    throw new Error(err.message ?? "Unknown error create Class Room and Employee");
  }
};

const createPivotCoursesWithTeachers = async (payload: CreatePivotCoursesWithTeachersPayload[]) => {
  try {
    return await supabase.from("courses_teachers").insert(payload).select();
  } catch (err: any) {
    console.error("Unexpected error:", err);
    throw new Error(err.message ?? "Unknown error create Class Room and Employee");
  }
};

const createPivotCoursesWithResources = async (payload: CreatePivotCoursesWithResourcesPayload[]) => {
  try {
    return await supabase.from("courses_resources").insert(payload).select();
  } catch (err: any) {
    console.error("Unexpected error:", err);
    throw new Error(err.message ?? "Unknown error create Class Room and Employee");
  }
};

export {
  createCourse,
  updateCourse,
  createPivotCoursesWithCategories,
  createPivotCoursesWithStudents,
  createPivotCoursesWithTeachers,
  createPivotCoursesWithResources,
};
