export class CreateResourceRequest {
  name!: string;
  libraryId!: string;
  parentId!: string | null;
  path!: string;
  size!: number;
  mimeType!: string;
  extension!: string;
  thumbnailUrl?: string | null;
}

