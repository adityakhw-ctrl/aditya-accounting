import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { useState, useRef, useCallback } from "react";
import {
  FileText,
  ShoppingCart,
  Receipt,
  CreditCard,
  ArrowRightLeft,
  StickyNote,
  Sparkles,
  Upload,
  FileSpreadsheet,
  FileImage,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Filter,
  Edit3,
  Save,
  X,
  Building2,
  Landmark,
} from "lucide-react";

export const Route = createFileRoute("/daily-entry")({
  head: () => ({ meta: [{ title: "Daily Entry — Aditya Accounting" }] }),
  component: DailyEntry,
});

// ── Types ───────────────────────────────────────────
type EntryType = "sales" | "purchase" | "receipt" | "payment" | "journal" | "contra" | "credit-note" | "debit-note" | "statement";

type ConvertedEntry = {
  id: string;
  date: string;
  vchNo: string;
  partyLedger: string;
  amount: number;
  type: string;
  narration: string;
};

// ── Dummy AI-converted entries for demo ──────────────────
const dummyConvertedEntries: ConvertedEntry[] = [
  { id: "1", date: "2025-07-01", vchNo: "001", partyLedger: "ABC Suppliers", amount: 15000, type: "Purchase", narration: "Goods purchased from ABC" },
  { id: "2", date: "2025-07-01", vchNo: "002", partyLedger: "XYZ Traders", amount: 8500, type: "Sales", narration: "Sales to XYZ" },
  { id: "3", date: "2025-07-02", vchNo: "003", partyLedger: "Ram Enterprises", amount: 22000, type: "Purchase", narration: "Bulk purchase - Invoice #1234" },
  { id: "4", date: "2025-07-02", vchNo: "004", partyLedger: "Sita Mart", amount: 12000, type: "Sales", narration: "Monthly sales" },
  { id: "5", date: "2025-07-03", vchNo: "005", partyLedger: "Bank of India", amount: 50000, type: "Receipt", narration: "Bank deposit" },
];

// ── Entry Cards Configuration ──────────────────────────
const entryCards = [
  { key: "sales" as EntryType, label: "Sales Entry", icon: ShoppingCart, color: "from-emerald-500 to-teal-600", desc: "Record sales transactions" },
  { key: "purchase" as EntryType, label: "Purchase Entry", icon: Receipt, color: "from-orange-500 to-amber-600", desc: "Record purchase transactions" },
  { key: "receipt" as EntryType, label: "Receipt Entry", icon: CreditCard, color: "from-blue-500 to-indigo-600", desc: "Record incoming payments" },
  { key: "payment" as EntryType, label: "Payment Entry", icon: CreditCard, color: "from-rose-500 to-pink-600", desc: "Record outgoing payments" },
  { key: "journal" as EntryType, label: "Journal Entry", icon: FileText, color: "from-violet-500 to-purple-600", desc: "General journal entries" },
  { key: "contra" as EntryType, label: "Contra Entry", icon: ArrowRightLeft, color: "from-cyan-500 to-blue-600", desc: "Bank-to-bank transfers" },
  { key: "credit-note" as EntryType, label: "Credit Note", icon: StickyNote, color: "from-green-500 to-emerald-600", desc: "Credit note issuance" },
  { key: "debit-note" as EntryType, label: "Debit Note", icon: StickyNote, color: "from-red-500 to-rose-600", desc: "Debit note issuance" },
  { key: "statement" as EntryType, label: "Statement Upload", icon: Landmark, color: "from-indigo-500 to-violet-600", desc: "Upload & auto-convert statements" },
];

// ── SuVIT Type Options ─────────────────────────────────
const suvitTypes = ["All", "Sales", "Purchase", "Receipt", "Payment", "Journal", "Contra", "Credit Note", "Debit Note"];

function DailyEntry() {
  const [activeCard, setActiveCard] = useState<EntryType | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [convertedEntries, setConvertedEntries] = useState<ConvertedEntry[]>([]);
  const [filterType, setFilterType] = useState("All");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ConvertedEntry>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── File Upload Handler ──────────────────────────
  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadComplete(false);
    setConvertedEntries([]);

    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // For demo: show dummy converted entries
    setConvertedEntries(dummyConvertedEntries);
    setIsUploading(false);
    setUploadComplete(true);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      handleFileUpload(e.dataTransfer.files);
    },
    [handleFileUpload]
  );

  // ── Filter Logic ────────────────────────────────
  const filteredEntries = convertedEntries.filter((entry) => {
    if (filterType === "All") return true;
    return entry.type.toLowerCase() === filterType.toLowerCase();
  });

  // ── Edit Handlers ──────────────────────────────
  const startEdit = (entry: ConvertedEntry) => {
    setEditingId(entry.id);
    setEditForm({ ...entry });
  };

  const saveEdit = () => {
    if (!editingId) return;
    setConvertedEntries((prev) =>
      prev.map((e) => (e.id === editingId ? { ...e, ...editForm } as ConvertedEntry : e))
    );
    setEditingId(null);
    setEditForm({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const isUploadCard = activeCard === "sales" || activeCard === "purchase" || activeCard === "statement";

  return (
    <PageShell title="Daily Entry" subtitle="Record daily transactions with AI-assisted accuracy.">
      {/* ── Entry Cards Grid ──────────────────────────── */}
      {!activeCard && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {entryCards.map((card) => (
            <button
              key={card.key}
              onClick={() => setActiveCard(card.key)}
              className="glass group scroll-mt-24 rounded-2xl p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div
                className={`mb-3 grid h-12 w-12 place-items-center rounded-xl text-white shadow-md bg-gradient-to-br ${card.color}`}
              >
                <card.icon className="h-5 w-5" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">{card.label}</span>
                {card.key === "statement" && (
                  <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-700">
                    NEW
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{card.desc}</p>
              {card.key === "statement" && (
                <div className="mt-2 flex items-center gap-1 text-[11px] text-indigo-500">
                  <Sparkles className="h-3 w-3" />
                  <span>AI-powered conversion</span>
                </div>
              )}
              {(card.key === "sales" || card.key === "purchase") && (
                <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-600">
                  <Upload className="h-3 w-3" />
                  <span>Upload JPG/Excel/PDF</span>
                </div>
              )}
            </button>
          ))}

          {/* AI Voucher Suggestion Card */}
          <div className="glass group scroll-mt-24 rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg sm:col-span-2 lg:col-span-1">
            <div
              className="mb-3 grid h-12 w-12 place-items-center rounded-xl text-white shadow-md"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="font-semibold text-foreground">AI Voucher Suggestion</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Let AI suggest the right voucher type based on your description.
            </p>
          </div>
        </div>
      )}

      {/* ── Upload Panel (Sales/Purchase/Statement) ─────── */}
      {activeCard && isUploadCard && (
        <div className="space-y-6">
          {/* Back Button */}
          <button
            onClick={() => {
              setActiveCard(null);
              setConvertedEntries([]);
              setUploadComplete(false);
              setIsUploading(false);
            }}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
          >
            <X className="h-4 w-4" /> Back to Daily Entry
          </button>

          {/* Upload Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="glass rounded-3xl p-8 text-center transition hover:shadow-lg"
          >
            <div
              className="mx-auto grid h-16 w-16 place-items-center rounded-2xl text-white shadow-md"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Upload className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">
              {activeCard === "statement" ? "Upload Bank Statement" : `Upload ${activeCard === "sales" ? "Sales" : "Purchase"} Document`}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Drag & drop your files here, or click to browse
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Supports JPG, PNG, Excel, and PDF files
            </p>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.pdf,.xls,.xlsx"
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
            />

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:opacity-60"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FileImage className="h-4 w-4" />
                    Select Files
                  </>
                )}
              </button>
            </div>

            {/* Upload Status */}
            {isUploading && (
              <div className="mt-6 flex items-center justify-center gap-3 text-sm text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                <span>AI is analyzing your document and converting entries...</span>
              </div>
            )}

            {uploadComplete && (
              <div className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
                <span>Document processed successfully! {convertedEntries.length} entries found.</span>
              </div>
            )}
          </div>

          {/* ── Converted Entries Table ───────────────── */}
          {convertedEntries.length > 0 && (
            <div className="glass rounded-3xl p-6">
              {/* Header with Filter */}
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-semibold">Converted Entries</h3>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="rounded-lg border border-border bg-white/70 px-3 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  >
                    {suvitTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Entries Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="pb-3 pr-4">Date</th>
                      <th className="pb-3 pr-4">Vch No.</th>
                      <th className="pb-3 pr-4">Party/Ledger</th>
                      <th className="pb-3 pr-4">Type</th>
                      <th className="pb-3 pr-4">Amount</th>
                      <th className="pb-3 pr-4">Narration</th>
                      <th className="pb-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredEntries.map((entry) => (
                      <tr key={entry.id} className="group hover:bg-white/30">
                        {editingId === entry.id ? (
                          <>
                            <td className="py-3 pr-4">
                              <input
                                type="date"
                                value={editForm.date || ""}
                                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                                className="w-full rounded border border-border bg-white/70 px-2 py-1 text-xs"
                              />
                            </td>
                            <td className="py-3 pr-4">
                              <input
                                value={editForm.vchNo || ""}
                                onChange={(e) => setEditForm({ ...editForm, vchNo: e.target.value })}
                                className="w-full rounded border border-border bg-white/70 px-2 py-1 text-xs"
                              />
                            </td>
                            <td className="py-3 pr-4">
                              <input
                                value={editForm.partyLedger || ""}
                                onChange={(e) => setEditForm({ ...editForm, partyLedger: e.target.value })}
                                className="w-full rounded border border-border bg-white/70 px-2 py-1 text-xs"
                              />
                            </td>
                            <td className="py-3 pr-4">
                              <select
                                value={editForm.type || ""}
                                onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                                className="rounded border border-border bg-white/70 px-2 py-1 text-xs"
                              >
                                {suvitTypes.filter((t) => t !== "All").map((t) => (
                                  <option key={t} value={t}>{t}</option>
                                ))}
                              </select>
                            </td>
                            <td className="py-3 pr-4">
                              <input
                                type="number"
                                value={editForm.amount || 0}
                                onChange={(e) => setEditForm({ ...editForm, amount: Number(e.target.value) })}
                                className="w-24 rounded border border-border bg-white/70 px-2 py-1 text-xs"
                              />
                            </td>
                            <td className="py-3 pr-4">
                              <input
                                value={editForm.narration || ""}
                                onChange={(e) => setEditForm({ ...editForm, narration: e.target.value })}
                                className="w-full rounded border border-border bg-white/70 px-2 py-1 text-xs"
                              />
                            </td>
                            <td className="py-3">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={saveEdit}
                                  className="rounded p-1 text-emerald-600 hover:bg-emerald-50"
                                >
                                  <Save className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="rounded p-1 text-red-500 hover:bg-red-50"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-3 pr-4 text-xs">{entry.date}</td>
                            <td className="py-3 pr-4 text-xs font-medium">{entry.vchNo}</td>
                            <td className="py-3 pr-4 text-xs">{entry.partyLedger}</td>
                            <td className="py-3 pr-4">
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                entry.type === "Sales" ? "bg-emerald-100 text-emerald-700" :
                                entry.type === "Purchase" ? "bg-orange-100 text-orange-700" :
                                entry.type === "Receipt" ? "bg-blue-100 text-blue-700" :
                                "bg-rose-100 text-rose-700"
                              }`}>
                                {entry.type}
                              </span>
                            </td>
                            <td className="py-3 pr-4 text-xs font-medium">₹{entry.amount.toLocaleString()}</td>
                            <td className="py-3 pr-4 text-xs text-muted-foreground">{entry.narration}</td>
                            <td className="py-3">
                              <button
                                onClick={() => startEdit(entry)}
                                className="rounded p-1 text-muted-foreground opacity-0 transition hover:bg-white/50 hover:text-foreground group-hover:opacity-100"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Import Button */}
              {filteredEntries.length > 0 && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => alert("Entries imported successfully!")}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-700"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Import {filteredEntries.length} Entries
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Simple Entry Form (for non-upload cards) ────── */}
      {activeCard && !isUploadCard && (
        <div className="space-y-6">
          <button
            onClick={() => setActiveCard(null)}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
          >
            <X className="h-4 w-4" /> Back to Daily Entry
          </button>

          <div className="glass rounded-3xl p-8 text-center">
            <div
              className="mx-auto grid h-16 w-16 place-items-center rounded-2xl text-white shadow-md"
              style={{ background: "var(--gradient-primary)" }}
            >
              {(() => {
                const card = entryCards.find((c) => c.key === activeCard);
                if (!card) return <FileText className="h-7 w-7" />;
                const Icon = card.icon;
                return <Icon className="h-7 w-7" />;
              })()}
            </div>
            <h3 className="mt-4 text-lg font-semibold">
              {entryCards.find((c) => c.key === activeCard)?.label}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Manual entry form for {entryCards.find((c) => c.key === activeCard)?.label}.
            </p>

            {/* Placeholder form fields */}
            <div className="mx-auto mt-6 max-w-md space-y-3 text-left">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Date</label>
                <input type="date" className="w-full rounded-xl border border-border bg-white/70 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Voucher Number</label>
                <input placeholder="Enter voucher number" className="w-full rounded-xl border border-border bg-white/70 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Party / Ledger</label>
                <input placeholder="Enter party or ledger name" className="w-full rounded-xl border border-border bg-white/70 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Amount</label>
                <input type="number" placeholder="Enter amount" className="w-full rounded-xl border border-border bg-white/70 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Narration</label>
                <textarea placeholder="Enter narration" rows={3} className="w-full rounded-xl border border-border bg-white/70 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <button className="mt-2 w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700">
                Save Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
