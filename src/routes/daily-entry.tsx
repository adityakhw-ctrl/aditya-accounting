import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Edit3,
  FileImage,
  FileText,
  Landmark,
  Loader2,
  Receipt,
  Save,
  Search,
  ShoppingCart,
  Sparkles,
  Upload,
  X,
} from "lucide-react";

export const Route = createFileRoute("/daily-entry")({
  head: () => ({ meta: [{ title: "Daily Entry - Aditya Accounting" }] }),
  component: DailyEntry,
});

type EntryType =
  | "sales"
  | "purchase"
  | "receipt"
  | "payment"
  | "journal"
  | "contra"
  | "credit-note"
  | "debit-note"
  | "statement";

type EntryDetailLine = {
  label: string;
  value: string;
};

type EntryItemDetail = {
  name: string;
  qty?: string;
  amount?: string;
  rate?: string;
  taxLabel?: string;
};

type EntryTaxDetail = {
  label: string;
  amount: string;
};

type ConvertedEntry = {
  id: string;
  date: string;
  vchNo: string;
  partyLedger: string;
  amount: number;
  type: string;
  narration: string;
  status: "ready" | "exception";
  issues: string[];
  sourceFile: string;
  stockTotalAmount?: number;
  taxAmount?: number;
  stockItems?: EntryItemDetail[];
  taxBreakup?: EntryTaxDetail[];
  detailLines?: EntryDetailLine[];
  account?: string;
  particular?: string;
  qty?: string;
  rate?: string;
};

type EntryException = {
  id: string;
  sourceFile: string;
  reason: string;
  details: string[];
};

type ColumnFilters = {
  date: string;
  billNo: string;
  account: string;
  particular: string;
  qty: string;
  rate: string;
  amount: string;
  tax: string;
  total: string;
  narration: string;
};

const emptyFilters: ColumnFilters = {
  date: "",
  billNo: "",
  account: "",
  particular: "",
  qty: "",
  rate: "",
  amount: "",
  tax: "",
  total: "",
  narration: "",
};

const entryCards = [
  { key: "sales" as EntryType, label: "Sales Entry", color: "from-emerald-500 to-teal-600", icon: ShoppingCart, desc: "Scan sale invoices and outward bills." },
  { key: "purchase" as EntryType, label: "Purchase Entry", color: "from-orange-500 to-amber-600", icon: Receipt, desc: "Scan vendor purchase bills and inward invoices." },
  { key: "receipt" as EntryType, label: "Receipt Entry", color: "from-blue-500 to-indigo-600", icon: FileText, desc: "Manual receipt entry." },
  { key: "payment" as EntryType, label: "Payment Entry", color: "from-rose-500 to-pink-600", icon: FileText, desc: "Manual payment entry." },
  { key: "journal" as EntryType, label: "Journal Entry", color: "from-violet-500 to-purple-600", icon: FileText, desc: "Manual journal entry." },
  { key: "contra" as EntryType, label: "Contra Entry", color: "from-cyan-500 to-blue-600", icon: FileText, desc: "Manual contra entry." },
  { key: "credit-note" as EntryType, label: "Credit Note", color: "from-green-500 to-emerald-600", icon: FileText, desc: "Manual credit note entry." },
  { key: "debit-note" as EntryType, label: "Debit Note", color: "from-red-500 to-rose-600", icon: FileText, desc: "Manual debit note entry." },
  { key: "statement" as EntryType, label: "Statement Upload", color: "from-indigo-500 to-violet-600", icon: Landmark, desc: "Scan bank statements and convert transactions." },
];

function DailyEntry() {
  const [activeCard, setActiveCard] = useState<EntryType | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [scanSummary, setScanSummary] = useState("");
  const [convertedEntries, setConvertedEntries] = useState<ConvertedEntry[]>([]);
  const [exceptions, setExceptions] = useState<EntryException[]>([]);
  const [viewMode, setViewMode] = useState<"all" | "ready" | "exceptions">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ConvertedEntry>>({});
  const [uploadError, setUploadError] = useState("");
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<ColumnFilters>(emptyFilters);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeUploadCard = useMemo(
    () => (activeCard === "sales" || activeCard === "purchase" || activeCard === "statement" ? activeCard : null),
    [activeCard],
  );

  const filteredByStatus = useMemo(() => {
    if (viewMode === "ready") return convertedEntries.filter((entry) => entry.status === "ready");
    if (viewMode === "exceptions") return convertedEntries.filter((entry) => entry.status === "exception");
    return convertedEntries;
  }, [convertedEntries, viewMode]);

  const filteredEntries = useMemo(() => {
    return filteredByStatus.filter((entry) => {
      const taxValue = formatAmount(entry.taxAmount ?? 0);
      const totalValue = formatAmount(entry.amount);
      const amountValue = formatAmount(entry.stockTotalAmount ?? entry.amount);

      return matchesFilter(entry.date, filters.date)
        && matchesFilter(entry.vchNo, filters.billNo)
        && matchesFilter(entry.account ?? entry.partyLedger, filters.account)
        && matchesFilter(entry.particular ?? entry.narration, filters.particular)
        && matchesFilter(entry.qty ?? "", filters.qty)
        && matchesFilter(entry.rate ?? "", filters.rate)
        && matchesFilter(amountValue, filters.amount)
        && matchesFilter(taxValue, filters.tax)
        && matchesFilter(totalValue, filters.total)
        && matchesFilter(entry.narration, filters.narration);
    });
  }, [filteredByStatus, filters]);

  const readyCount = convertedEntries.filter((entry) => entry.status === "ready").length;
  const exceptionCount = exceptions.length;
  const totalAmount = filteredEntries.reduce((sum, entry) => sum + entry.amount, 0);

  const resetUploadState = useCallback(() => {
    setConvertedEntries([]);
    setExceptions([]);
    setScanSummary("");
    setUploadError("");
    setIsUploading(false);
    setEditingId(null);
    setEditForm({});
    setViewMode("all");
    setExpandedIds([]);
    setFilters(emptyFilters);
  }, []);

  const handleFileUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0 || !activeUploadCard) return;

      setIsUploading(true);
      setUploadError("");
      setConvertedEntries([]);
      setExceptions([]);
      setScanSummary("");

      try {
        const formData = new FormData();
        formData.append("expectedType", activeUploadCard);
        Array.from(files).forEach((file) => formData.append("files", file));

        const response = await fetch("/api/ocr/parse", {
          method: "POST",
          body: formData,
        });

        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(typeof payload.error === "string" ? payload.error : "Unable to scan the uploaded document.");
        }

        const entries = Array.isArray(payload.entries)
          ? (payload.entries as ConvertedEntry[]).map((entry: ConvertedEntry) => enrichEntryDetails(entry))
          : [];

        setConvertedEntries(entries);
        setExceptions(Array.isArray(payload.exceptions) ? payload.exceptions : []);
        setExpandedIds(entries.slice(0, 2).map((entry: ConvertedEntry) => entry.id));
        setScanSummary(typeof payload.summary === "string" ? payload.summary : "Scan complete.");
      } catch (error) {
        const message =
          error instanceof Error && error.message
            ? error.message
            : "Unable to scan the uploaded document right now.";
        setUploadError(message);
      } finally {
        setIsUploading(false);
      }
    },
    [activeUploadCard],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      handleFileUpload(event.dataTransfer.files);
    },
    [handleFileUpload],
  );

  const startEdit = (entry: ConvertedEntry) => {
    setEditingId(entry.id);
    setEditForm({ ...entry });
  };

  const saveEdit = () => {
    if (!editingId) return;
    setConvertedEntries((prev) =>
      prev.map((entry) =>
        entry.id === editingId
          ? enrichEntryDetails({
              ...entry,
              ...editForm,
            } as ConvertedEntry)
          : entry,
      ),
    );
    setEditingId(null);
    setEditForm({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const toggleExpanded = (entryId: string) => {
    setExpandedIds((prev) => (prev.includes(entryId) ? prev.filter((id) => id !== entryId) : [...prev, entryId]));
  };

  const setFilterValue = (key: keyof ColumnFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <PageShell title="Daily Entry" subtitle="Strong OCR for sales bills, purchase bills, and statements with exception review.">
      {!activeCard && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {entryCards.map((card) => (
            <button
              key={card.key}
              onClick={() => {
                resetUploadState();
                setActiveCard(card.key);
              }}
              className="glass rounded-2xl p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className={`mb-3 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${card.color} text-white shadow-md`}>
                <card.icon className="h-5 w-5" />
              </div>
              <div className="font-semibold text-foreground">{card.label}</div>
              <p className="mt-1 text-xs text-muted-foreground">{card.desc}</p>
              {(card.key === "sales" || card.key === "purchase" || card.key === "statement") && (
                <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700">
                  <Sparkles className="h-3 w-3" />
                  Real OCR scan
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {activeUploadCard && (
        <div className="space-y-6">
          <button
            onClick={() => {
              setActiveCard(null);
              resetUploadState();
            }}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
          >
            <X className="h-4 w-4" />
            Back to Daily Entry
          </button>

          <div
            onDrop={handleDrop}
            onDragOver={(event) => event.preventDefault()}
            className="glass rounded-3xl p-8 text-center transition hover:shadow-lg"
          >
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl text-white shadow-md" style={{ background: "var(--gradient-primary)" }}>
              <Upload className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">
              {activeUploadCard === "sales"
                ? "Upload Sales Bills"
                : activeUploadCard === "purchase"
                  ? "Upload Purchase Bills"
                  : "Upload Bank Statements"}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              JPG, PNG, PDF, XLS, XLSX, CSV sab supported hain. OCR actual file read karega, random entry nahi banegi.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Agar document unclear ya wrong category ka hua, woh direct exception review me chala jayega.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.pdf,.xls,.xlsx,.csv,.tsv"
              className="hidden"
              onChange={(event) => handleFileUpload(event.target.files)}
            />

            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:opacity-60"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <FileImage className="h-4 w-4" />
                    Select Files
                  </>
                )}
              </button>
            </div>

            {isUploading && (
              <div className="mt-6 inline-flex items-center gap-3 rounded-full bg-blue-50 px-4 py-2 text-sm text-blue-700">
                <Loader2 className="h-4 w-4 animate-spin" />
                Strong OCR chal raha hai. Document ko read, classify, aur convert kiya ja raha hai.
              </div>
            )}

            {!isUploading && scanSummary && (
              <div className="mt-6 inline-flex max-w-4xl items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-left text-sm text-emerald-700">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <span>{scanSummary}</span>
              </div>
            )}

            {!isUploading && uploadError && (
              <div className="mt-6 inline-flex max-w-4xl items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-left text-sm text-red-700">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}
          </div>

          {(convertedEntries.length > 0 || exceptions.length > 0) && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <SummaryCard label="Total Rows" value={String(convertedEntries.length)} tone="slate" />
                <SummaryCard label="Ready To Import" value={String(readyCount)} tone="emerald" />
                <SummaryCard label="Exceptions" value={String(exceptionCount)} tone="amber" />
              </div>

              <div className="glass rounded-3xl p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">Suvit Style Review</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Row-first bill review with filters and expandable line-item details.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <FilterChip active={viewMode === "all"} onClick={() => setViewMode("all")}>
                      All Records
                    </FilterChip>
                    <FilterChip active={viewMode === "ready"} onClick={() => setViewMode("ready")}>
                      Ready Entries
                    </FilterChip>
                    <FilterChip active={viewMode === "exceptions"} onClick={() => setViewMode("exceptions")}>
                      Exception Rows
                    </FilterChip>
                  </div>
                </div>

                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
                  <div className="max-h-[68vh] overflow-auto">
                    <div className="min-w-[1720px]">
                      <div className="sticky top-0 z-20 border-b border-slate-200 bg-slate-100">
                        <div className="grid grid-cols-[120px_120px_180px_220px_90px_100px_120px_110px_140px_260px_70px] gap-3 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                          <span>Date</span>
                          <span>Bill No.</span>
                          <span>Account</span>
                          <span>Particular</span>
                          <span>Qty</span>
                          <span>Rate</span>
                          <span>Amount</span>
                          <span>Tax</span>
                          <span>Total Amount</span>
                          <span>Narration</span>
                          <span className="text-center">View</span>
                        </div>
                        <div className="grid grid-cols-[120px_120px_180px_220px_90px_100px_120px_110px_140px_260px_70px] gap-3 border-t border-slate-200 bg-white px-4 py-3">
                          <ColumnFilter value={filters.date} onChange={(value) => setFilterValue("date", value)} placeholder="Date" />
                          <ColumnFilter value={filters.billNo} onChange={(value) => setFilterValue("billNo", value)} placeholder="Bill No." />
                          <ColumnFilter value={filters.account} onChange={(value) => setFilterValue("account", value)} placeholder="Account" />
                          <ColumnFilter value={filters.particular} onChange={(value) => setFilterValue("particular", value)} placeholder="Particular" />
                          <ColumnFilter value={filters.qty} onChange={(value) => setFilterValue("qty", value)} placeholder="Qty" />
                          <ColumnFilter value={filters.rate} onChange={(value) => setFilterValue("rate", value)} placeholder="Rate" />
                          <ColumnFilter value={filters.amount} onChange={(value) => setFilterValue("amount", value)} placeholder="Amount" />
                          <ColumnFilter value={filters.tax} onChange={(value) => setFilterValue("tax", value)} placeholder="Tax" />
                          <ColumnFilter value={filters.total} onChange={(value) => setFilterValue("total", value)} placeholder="Total" />
                          <ColumnFilter value={filters.narration} onChange={(value) => setFilterValue("narration", value)} placeholder="Narration" />
                          <div className="grid place-items-center text-xs font-medium text-slate-400">Arrow</div>
                        </div>
                      </div>

                      <div className="divide-y divide-slate-200">
                        {filteredEntries.map((entry) => {
                          const isExpanded = expandedIds.includes(entry.id);
                          const taxAmount = entry.taxAmount ?? 0;
                          const stockAmount = entry.stockTotalAmount ?? entry.amount;

                          return (
                            <div key={entry.id} className="bg-white">
                              {editingId === entry.id ? (
                                <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-4">
                                  <input type="date" value={editForm.date || ""} onChange={(event) => setEditForm({ ...editForm, date: event.target.value })} className="rounded-xl border border-border bg-white px-3 py-2 text-sm" />
                                  <input value={editForm.vchNo || ""} onChange={(event) => setEditForm({ ...editForm, vchNo: event.target.value })} className="rounded-xl border border-border bg-white px-3 py-2 text-sm" />
                                  <input value={editForm.partyLedger || ""} onChange={(event) => setEditForm({ ...editForm, partyLedger: event.target.value })} className="rounded-xl border border-border bg-white px-3 py-2 text-sm" />
                                  <input value={editForm.particular || ""} onChange={(event) => setEditForm({ ...editForm, particular: event.target.value })} className="rounded-xl border border-border bg-white px-3 py-2 text-sm" />
                                  <input value={editForm.qty || ""} onChange={(event) => setEditForm({ ...editForm, qty: event.target.value })} className="rounded-xl border border-border bg-white px-3 py-2 text-sm" />
                                  <input value={editForm.rate || ""} onChange={(event) => setEditForm({ ...editForm, rate: event.target.value })} className="rounded-xl border border-border bg-white px-3 py-2 text-sm" />
                                  <input type="number" value={editForm.amount || 0} onChange={(event) => setEditForm({ ...editForm, amount: Number(event.target.value) })} className="rounded-xl border border-border bg-white px-3 py-2 text-sm" />
                                  <input value={editForm.narration || ""} onChange={(event) => setEditForm({ ...editForm, narration: event.target.value })} className="rounded-xl border border-border bg-white px-3 py-2 text-sm md:col-span-2 xl:col-span-4" />
                                  <div className="flex items-center gap-2 md:col-span-2 xl:col-span-4">
                                    <button onClick={saveEdit} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
                                      <Save className="h-4 w-4" />
                                      Save
                                    </button>
                                    <button onClick={cancelEdit} className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground">
                                      <X className="h-4 w-4" />
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="grid grid-cols-[120px_120px_180px_220px_90px_100px_120px_110px_140px_260px_70px] gap-3 px-4 py-4 text-sm">
                                    <DataCell value={entry.date || "Needs review"} subtle={!entry.date} />
                                    <DataCell value={entry.vchNo} strong />
                                    <DataCell value={entry.account ?? entry.partyLedger} />
                                    <DataCell value={entry.particular ?? "-"} />
                                    <DataCell value={entry.qty ?? "-"} />
                                    <DataCell value={entry.rate ?? "-"} />
                                    <DataCell value={`Rs ${formatAmount(stockAmount)}`} strong />
                                    <DataCell value={`Rs ${formatAmount(taxAmount)}`} />
                                    <DataCell value={`Rs ${formatAmount(entry.amount)}`} strong />
                                    <DataCell value={entry.narration} multiline />
                                    <div className="flex items-start justify-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => startEdit(entry)}
                                        className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 transition hover:text-slate-900"
                                        title="Edit entry"
                                      >
                                        <Edit3 className="h-4 w-4" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => toggleExpanded(entry.id)}
                                        className={`rounded-full p-2 text-white transition ${isExpanded ? "bg-slate-800" : "bg-blue-600 hover:bg-blue-700"}`}
                                        title={isExpanded ? "Hide details" : "Show details"}
                                      >
                                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                      </button>
                                    </div>
                                  </div>

                                  {isExpanded && <ExpandedEntryPanel entry={entry} />}
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {readyCount > 0 && (
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => alert(`Imported ${readyCount} entries successfully.`)}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-700"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Import Ready Entries
                    </button>
                  </div>
                )}
              </div>

              {exceptions.length > 0 && (
                <div className="glass rounded-3xl p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    <h3 className="text-lg font-semibold">Exception Review</h3>
                  </div>
                  <div className="space-y-3">
                    {exceptions.map((exception) => (
                      <div key={exception.id} className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="font-medium text-amber-900">{exception.reason}</div>
                          <div className="text-xs text-amber-700">{exception.sourceFile}</div>
                        </div>
                        <ul className="mt-2 space-y-1 text-sm text-amber-800">
                          {exception.details.map((detail, index) => (
                            <li key={`${exception.id}-${index}`}>- {detail}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeCard && !activeUploadCard && (
        <div className="space-y-6">
          <button
            onClick={() => setActiveCard(null)}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
          >
            <X className="h-4 w-4" />
            Back to Daily Entry
          </button>

          <div className="glass rounded-3xl p-8 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl text-white shadow-md" style={{ background: "var(--gradient-primary)" }}>
              <FileText className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">
              {entryCards.find((card) => card.key === activeCard)?.label}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Manual entry form for this workflow is available here.
            </p>
          </div>
        </div>
      )}
    </PageShell>
  );
}

function enrichEntryDetails(entry: ConvertedEntry): ConvertedEntry {
  const taxAmount =
    typeof entry.taxAmount === "number"
      ? entry.taxAmount
      : entry.type.toLowerCase().includes("sales") || entry.type.toLowerCase().includes("purchase")
        ? Number((entry.amount * 0.18).toFixed(2))
        : 0;
  const stockTotalAmount =
    typeof entry.stockTotalAmount === "number"
      ? entry.stockTotalAmount
      : Number(Math.max(entry.amount - taxAmount, 0).toFixed(2));

  const stockItems =
    entry.stockItems && entry.stockItems.length > 0
      ? entry.stockItems
      : [
          {
            name: `${entry.type} item group`,
            qty: "1",
            rate: `Rs ${formatAmount(stockTotalAmount)}`,
            amount: `Rs ${formatAmount(stockTotalAmount)}`,
            taxLabel: taxAmount > 0 ? "GST" : "No tax",
          },
        ];

  const qty = entry.qty || stockItems.map((item) => item.qty).find(Boolean) || "1";
  const rate = entry.rate || stockItems.map((item) => item.rate).find(Boolean) || `Rs ${formatAmount(stockTotalAmount)}`;
  const account = entry.account || entry.partyLedger;
  const particular = entry.particular || stockItems.map((item) => item.name).join(", ");

  const taxBreakup =
    entry.taxBreakup && entry.taxBreakup.length > 0
      ? entry.taxBreakup
      : taxAmount > 0
        ? [
            { label: "Taxable Amount", amount: `Rs ${formatAmount(stockTotalAmount)}` },
            { label: "GST / Tax", amount: `Rs ${formatAmount(taxAmount)}` },
          ]
        : [{ label: "Tax", amount: "Rs 0" }];

  const detailLines =
    entry.detailLines && entry.detailLines.length > 0
      ? entry.detailLines
      : [
          { label: "Voucher No", value: entry.vchNo },
          { label: "Date", value: entry.date || "Needs review" },
          { label: "Account", value: account },
          { label: "Particular", value: particular },
          { label: "Narration", value: entry.narration },
          { label: "Source", value: entry.sourceFile },
        ];

  return {
    ...entry,
    stockTotalAmount,
    taxAmount,
    stockItems,
    taxBreakup,
    detailLines,
    account,
    particular,
    qty,
    rate,
  };
}

function matchesFilter(value: string, filterValue: string) {
  if (!filterValue.trim()) return true;
  return value.toLowerCase().includes(filterValue.trim().toLowerCase());
}

function formatAmount(value: number) {
  return Number.isFinite(value) ? value.toLocaleString() : "0";
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "slate" | "emerald" | "amber";
}) {
  const tones = {
    slate: "border-slate-200 bg-slate-50 text-slate-900",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
  };

  return (
    <div className={`rounded-2xl border p-4 ${tones[tone]}`}>
      <div className="text-xs font-medium uppercase tracking-wider opacity-70">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
        active
          ? "bg-blue-600 text-white shadow-md"
          : "border border-border bg-white/70 text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function ColumnFilter({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="relative block">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white"
      />
    </label>
  );
}

function DataCell({
  value,
  strong,
  subtle,
  multiline,
}: {
  value: string;
  strong?: boolean;
  subtle?: boolean;
  multiline?: boolean;
}) {
  return (
    <div className={`text-sm ${strong ? "font-semibold text-slate-900" : subtle ? "text-amber-700" : "text-slate-700"} ${multiline ? "whitespace-normal break-words" : ""}`}>
      {value}
    </div>
  );
}

function ExpandedEntryPanel({ entry }: { entry: ConvertedEntry }) {
  return (
    <div className="border-top border-slate-200 bg-slate-50 px-4 py-4">
      <div className="grid gap-4 xl:grid-cols-[1.1fr_1.2fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-4">
          <div className="mb-3 text-sm font-semibold text-slate-900">Entry Summary</div>
          <div className="grid gap-3 sm:grid-cols-2">
            {entry.detailLines?.map((line, index) => (
              <div key={`${entry.id}-line-${index}`} className="rounded-2xl bg-slate-50 px-3 py-2">
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{line.label}</div>
                <div className="mt-1 text-sm text-slate-800 whitespace-normal break-words">{line.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4">
          <div className="mb-3 text-sm font-semibold text-slate-900">Stock Items With Amount</div>
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <div className="grid grid-cols-[1.5fr_100px_120px_120px_120px] gap-3 border-b border-slate-200 bg-slate-100 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              <span>Stock Item</span>
              <span>Qty</span>
              <span>Rate</span>
              <span>Amount</span>
              <span>Tax</span>
            </div>
            <div className="divide-y divide-slate-200">
              {entry.stockItems?.map((item, index) => (
                <div key={`${entry.id}-item-${index}`} className="grid grid-cols-[1.5fr_100px_120px_120px_120px] gap-3 px-3 py-3 text-sm text-slate-700">
                  <span>{item.name}</span>
                  <span>{item.qty || "-"}</span>
                  <span>{item.rate || "-"}</span>
                  <span>{item.amount || "-"}</span>
                  <span>{item.taxLabel || "-"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4">
          <div className="mb-3 text-sm font-semibold text-slate-900">Tax And Total</div>
          <div className="space-y-3">
            {entry.taxBreakup?.map((tax, index) => (
              <div key={`${entry.id}-tax-${index}`} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-3 text-sm">
                <span className="text-slate-700">{tax.label}</span>
                <span className="font-semibold text-slate-900">{tax.amount}</span>
              </div>
            ))}
            <div className="rounded-2xl bg-emerald-50 px-3 py-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-600">Total Amount</div>
              <div className="mt-1 text-lg font-semibold text-emerald-700">Rs {formatAmount(entry.amount)}</div>
            </div>
          </div>

          {entry.issues.length > 0 && (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3">
              <div className="text-sm font-semibold text-amber-800">Review Notes</div>
              <ul className="mt-2 space-y-1 text-sm text-amber-700">
                {entry.issues.map((issue, index) => (
                  <li key={`${entry.id}-issue-${index}`}>- {issue}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
