import { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";

type Crumb = { title: string; path?: string };

export function PageContainer({
  title,
  description,
  breadcrumbs = [],
  actions,
  children,
}: {
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="p-6 space-y-6">
      <div>
        {breadcrumbs.length > 0 && (
          <nav className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link to="/dashboard" className="hover:text-foreground">
              <Home className="h-3.5 w-3.5" />
            </Link>
            {breadcrumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <ChevronRight className="h-3 w-3" />
                {c.path ? (
                  <Link to={c.path} className="hover:text-foreground">
                    {c.title}
                  </Link>
                ) : (
                  <span className="text-foreground">{c.title}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>
      {children}
    </div>
  );
}
