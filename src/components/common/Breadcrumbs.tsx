import { Link } from "react-router";
import { cn } from "@/lib/utils";

export interface Crumb {
  name: string;
  path: string;
}

export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("text-sm", className)}>
      <ol className="flex flex-wrap items-center gap-x-2 text-ash-600">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={item.path} className="flex items-center gap-2">
              {last ? (
                <span aria-current="page" className="py-2 font-semibold text-ink">
                  {item.name}
                </span>
              ) : (
                <>
                  <Link to={item.path} className="py-2 underline-offset-4 hover:text-ink hover:underline">
                    {item.name}
                  </Link>
                  <span aria-hidden="true" className="text-ash-400">
                    /
                  </span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
