export interface CreateCourseInput {
  title: string;
  description: string;
  slug: string;
  categoryIds: string[];
  status: "draft" | "published" | "deleted" | "pending" | "unpublished";
  sections: {
    title: string;
    description: string;
    lessons: {
      title: string;
      content: string;
      status: "active" | "deactive";
      resources: {
        id: string;
      }[];
      lessonType: "video" | "file" | "assessment";
      mainResourceId?: string | undefined;
      assignmentId?: string | undefined;
    }[];
    status: "active" | "deactive";
  }[];
}
