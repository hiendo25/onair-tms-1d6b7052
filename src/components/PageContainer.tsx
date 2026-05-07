import { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

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
    <div className="px-8 py-6 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
          {breadcrumbs.length > 0 ? (
            <nav className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
              {breadcrumbs.map((c, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  {i > 0 && <span>/</span>}
                  {c.path ? (
                    <Link to={c.path} className="hover:text-slate-700">
                      {c.title}
                    </Link>
                  ) : (
                    <span>{c.title}</span>
                  )}
                </span>
              ))}
            </nav>
          ) : description ? (
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          ) : null}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}
