import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useEmployees } from "@/lib/data-hooks";
import { COURSE_STATUS } from "@/lib/admin-options";
import { toast } from "sonner";

export type CourseInfo = {
  code: string;
  title: string;
  description: string;
  category: string;
  duration_minutes: number;
  cover_url: string;
  author_id: string | null;
  author_name: string;
  status: string;
};

interface Props {
  value: CourseInfo;
  onChange: (v: CourseInfo) => void;
  categories: string[];
}

export function CourseInfoForm({ value, onChange, categories }: Props) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { data: employees = [] } = useEmployees();

  const set = <K extends keyof CourseInfo>(k: K, v: CourseInfo[K]) => onChange({ ...value, [k]: v });

  const upload = async (file: File) => {
    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) { toast.error("Chỉ chấp nhận JPG/PNG"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Tối đa 5MB"); return; }
    setUploading(true);
    try {
      const path = `courses/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("learning-path-covers").upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from("learning-path-covers").getPublicUrl(path);
      set("cover_url", data.publicUrl);
      toast.success("Đã upload ảnh");
    } catch (e) { toast.error((e as Error).message); }
    finally { setUploading(false); }
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <Label>Tên khóa học <span className="text-destructive">*</span></Label>
        <Input value={value.title} onChange={(e) => set("title", e.target.value.slice(0, 200))} placeholder="Nhập tên khóa học" maxLength={200} />
        <div className="text-xs text-muted-foreground mt-1 text-right">Tối đa 200 ký tự</div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Mã khóa học <span className="text-destructive">*</span></Label>
          <Input value={value.code} onChange={(e) => set("code", e.target.value)} placeholder="VD: COURSE-01" />
        </div>
        <div>
          <Label>Trạng thái</Label>
          <Select value={value.status} onValueChange={(v) => set("status", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {COURSE_STATUS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Danh mục</Label>
          <Select value={value.category || "__none"} onValueChange={(v) => set("category", v === "__none" ? "" : v)}>
            <SelectTrigger><SelectValue placeholder="Chọn danh mục" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__none">Không chọn</SelectItem>
              {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              {!categories.includes("Công nghệ") && <SelectItem value="Công nghệ">Công nghệ</SelectItem>}
              {!categories.includes("Quản lý") && <SelectItem value="Quản lý">Quản lý</SelectItem>}
              {!categories.includes("Marketing") && <SelectItem value="Marketing">Marketing</SelectItem>}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Thời lượng (phút)</Label>
          <Input type="number" min={0} value={value.duration_minutes} onChange={(e) => set("duration_minutes", Math.max(0, Number(e.target.value) || 0))} />
        </div>
      </div>

      <div>
        <Label>Tác giả</Label>
        <Select
          value={value.author_id || "__none"}
          onValueChange={(v) => {
            if (v === "__none") { set("author_id", null); set("author_name", ""); return; }
            const emp = employees.find((e) => e.id === v);
            onChange({ ...value, author_id: v, author_name: emp?.name || "" });
          }}
        >
          <SelectTrigger><SelectValue placeholder="Chọn tác giả" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__none">Không chọn</SelectItem>
            {employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Ảnh khóa học</Label>
        <div className="mt-2 flex items-start gap-4">
          <div className="h-32 w-48 rounded-md border bg-muted overflow-hidden flex items-center justify-center">
            {value.cover_url ? (
              <img src={value.cover_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-xs text-muted-foreground">Chưa có ảnh</span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <input ref={fileRef} type="file" accept="image/png,image/jpeg" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
            <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
              {uploading ? "Đang tải..." : "Tải lên"}
            </Button>
            {value.cover_url && (
              <Button type="button" variant="ghost" size="sm" onClick={() => set("cover_url", "")}>
                <X className="h-4 w-4 mr-1" />Xoá ảnh
              </Button>
            )}
            <span className="text-xs text-muted-foreground">JPG/PNG, tối đa 5MB</span>
          </div>
        </div>
      </div>

      <div>
        <Label>Mô tả khóa học</Label>
        <Textarea rows={6} value={value.description} onChange={(e) => set("description", e.target.value)} placeholder="Mô tả mục tiêu, đối tượng, nội dung..." />
      </div>
    </div>
  );
}
