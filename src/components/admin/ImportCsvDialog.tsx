import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { parseCsv } from "@/lib/csv";
import { toast } from "sonner";

export function ImportCsvDialog({
  open, onOpenChange, onImport, title, sampleHeaders,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onImport: (rows: Record<string, string>[]) => Promise<void> | void;
  title: string;
  sampleHeaders: string[];
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [filename, setFilename] = useState("");

  const handleFile = async (file: File) => {
    setFilename(file.name);
    try {
      const data = await parseCsv(file);
      setRows(data);
    } catch {
      toast.error("Không đọc được file CSV");
    }
  };

  const submit = async () => {
    if (!rows.length) return toast.error("Chưa có dữ liệu");
    setBusy(true);
    try {
      await onImport(rows);
      toast.success(`Đã import ${rows.length} dòng`);
      onOpenChange(false);
      setRows([]); setFilename("");
    } catch (e) {
      toast.error((e as Error).message || "Import thất bại");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            File CSV cần có header: <code className="text-xs">{sampleHeaders.join(", ")}</code>
          </DialogDescription>
        </DialogHeader>
        <div
          onClick={() => ref.current?.click()}
          className="cursor-pointer rounded-lg border-2 border-dashed p-8 text-center hover:bg-muted/50"
        >
          <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm">{filename || "Click để chọn file CSV"}</p>
          {rows.length > 0 && <p className="mt-1 text-xs text-muted-foreground">{rows.length} dòng sẵn sàng import</p>}
          <input
            ref={ref} type="file" accept=".csv" className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Huỷ</Button>
          <Button onClick={submit} disabled={busy || !rows.length}>{busy ? "Đang import..." : "Import"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
