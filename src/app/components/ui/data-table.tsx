import { useMemo, useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { Checkbox } from "./checkbox";
import { Button } from "./button";
import { Skeleton } from "./skeleton";
import { cn } from "./utils";

type DataTableColumn<T> = {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  sortable?: boolean;
  sortAccessor?: (row: T) => string | number;
  className?: string;
};

type DataTableProps<T> = {
  rows: T[];
  columns: DataTableColumn<T>[];
  rowKey: (row: T) => string;
  pageSize?: number;
  loading?: boolean;
  emptyMessage?: string;
  onSelectionChange?: (selectedKeys: string[]) => void;
};

type SortState = {
  columnId: string;
  direction: "asc" | "desc";
} | null;

export function DataTable<T>({
  rows,
  columns,
  rowKey,
  pageSize = 10,
  loading = false,
  emptyMessage = "No records found.",
  onSelectionChange,
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);
  const [sortState, setSortState] = useState<SortState>(null);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const sortedRows = useMemo(() => {
    if (!sortState) return rows;
    const column = columns.find((col) => col.id === sortState.columnId);
    if (!column?.sortAccessor) return rows;

    const cloned = [...rows];
    cloned.sort((a, b) => {
      const valueA = column.sortAccessor!(a);
      const valueB = column.sortAccessor!(b);
      if (valueA < valueB) return sortState.direction === "asc" ? -1 : 1;
      if (valueA > valueB) return sortState.direction === "asc" ? 1 : -1;
      return 0;
    });
    return cloned;
  }, [rows, sortState, columns]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = sortedRows.slice((safePage - 1) * pageSize, safePage * pageSize);

  const allPageKeys = pageRows.map((row) => rowKey(row));
  const allPageSelected = allPageKeys.length > 0 && allPageKeys.every((key) => selectedKeys.includes(key));

  const updateSelection = (keys: string[]) => {
    setSelectedKeys(keys);
    onSelectionChange?.(keys);
  };

  const toggleSort = (column: DataTableColumn<T>) => {
    if (!column.sortable) return;
    setPage(1);
    setSortState((prev) => {
      if (!prev || prev.columnId !== column.id) return { columnId: column.id, direction: "asc" };
      if (prev.direction === "asc") return { columnId: column.id, direction: "desc" };
      return null;
    });
  };

  return (
    <div className="surface-card overflow-hidden">
      <div className="overflow-x-auto max-h-[560px]">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-muted">
            <tr className="border-b border-border">
              <th className="w-10 px-3 py-3 text-left">
                <Checkbox
                  checked={allPageSelected}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateSelection(Array.from(new Set([...selectedKeys, ...allPageKeys])));
                    } else {
                      updateSelection(selectedKeys.filter((key) => !allPageKeys.includes(key)));
                    }
                  }}
                  aria-label="Select rows on current page"
                />
              </th>
              {columns.map((column) => {
                const isActiveSort = sortState?.columnId === column.id;
                return (
                  <th
                    key={column.id}
                    className={cn("px-4 py-3 text-left text-xs uppercase tracking-wide text-muted-foreground", column.className)}
                  >
                    <button
                      type="button"
                      className={cn(
                        "inline-flex items-center gap-1.5",
                        column.sortable ? "hover:text-foreground app-transition" : "cursor-default",
                      )}
                      onClick={() => toggleSort(column)}
                    >
                      <span>{column.header}</span>
                      {column.sortable ? (
                        isActiveSort ? (
                          sortState?.direction === "asc" ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
                        )
                      ) : null}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={`skeleton-${idx}`} className="border-b border-border">
                    <td className="px-3 py-3">
                      <Skeleton className="h-4 w-4" />
                    </td>
                    {columns.map((column) => (
                      <td key={`${column.id}-${idx}`} className="px-4 py-3">
                        <Skeleton className="h-4 w-full max-w-[180px]" />
                      </td>
                    ))}
                  </tr>
                ))
              : pageRows.map((row) => {
                  const key = rowKey(row);
                  const checked = selectedKeys.includes(key);
                  return (
                    <tr key={key} className="border-b border-border hover:bg-muted/60 app-transition">
                      <td className="px-3 py-3">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(value) => {
                            if (value) updateSelection([...selectedKeys, key]);
                            else updateSelection(selectedKeys.filter((selectedKey) => selectedKey !== key));
                          }}
                          aria-label={`Select row ${key}`}
                        />
                      </td>
                      {columns.map((column) => (
                        <td key={`${key}-${column.id}`} className={cn("px-4 py-3 align-top", column.className)}>
                          {column.cell(row)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>

      {!loading && rows.length === 0 ? (
        <div className="px-6 py-12 text-center text-muted-foreground">{emptyMessage}</div>
      ) : null}

      <div className="flex items-center justify-between border-t border-border px-4 py-3">
        <p className="caption-text">
          {rows.length} record{rows.length === 1 ? "" : "s"} • {selectedKeys.length} selected
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={safePage <= 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            Previous
          </Button>
          <span className="caption-text">
            Page {safePage} of {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={safePage >= totalPages}
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
