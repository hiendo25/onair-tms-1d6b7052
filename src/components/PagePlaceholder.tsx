import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from "lucide-react";

type Props = {
  title: string;
  description?: string;
};

export function PagePlaceholder({ title, description }: Props) {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-medium text-muted-foreground">
            <Construction className="h-4 w-4" />
            Đang xây dựng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Màn hình này sẽ được xây dựng theo thiết kế tham chiếu từ <code className="text-xs">_lms_reference/</code>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
