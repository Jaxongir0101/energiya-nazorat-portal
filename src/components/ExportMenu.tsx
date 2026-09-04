import { Download, FileSpreadsheet, FileText, Printer, Table2 } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportCSV, exportPDF, exportXLSX, printReport, type ExportPayload } from "@/lib/export";

export function ExportMenu<T>({ payload }: { payload: () => ExportPayload<T> }) {
  const run = async (kind: "xlsx" | "csv" | "pdf" | "print") => {
    const p = payload();
    if (!p.rows.length) {
      toast.error("Tanlangan filtr bo'yicha ma'lumot topilmadi.");
      return;
    }
    try {
      if (kind === "xlsx") exportXLSX(p);
      else if (kind === "csv") exportCSV(p);
      else if (kind === "pdf") await exportPDF(p);
      else printReport(p);
      if (kind !== "print") toast.success("Fayl yuklab olindi.");
    } catch {
      toast.error("Eksport amalga oshmadi.");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-card px-3 text-[13px] font-medium ring-1 ring-border transition-colors hover:bg-muted"
        >
          <Download className="size-4" /> Eksport
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onClick={() => run("xlsx")}>
          <FileSpreadsheet className="size-4" /> Excel (.xlsx)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => run("csv")}>
          <Table2 className="size-4" /> CSV (.csv)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => run("pdf")}>
          <FileText className="size-4" /> PDF (.pdf)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => run("print")}>
          <Printer className="size-4" /> Chop etish
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
