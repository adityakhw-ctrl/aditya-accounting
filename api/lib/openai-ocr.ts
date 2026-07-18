import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

type UploadFlow = "sales" | "purchase" | "statement";

export type OcrEntry = {
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
};

export type OcrException = {
  id: string;
  sourceFile: string;
  reason: string;
  details: string[];
};

type OcrResult = {
  entries: OcrEntry[];
  exceptions: OcrException[];
  summary: string;
};

type ModelShape = {
  document_kind?: string;
  overall_confidence?: number;
  summary?: string;
  entries?: Array<{
    date?: string;
    voucher_number?: string;
    party_ledger?: string;
    amount?: number;
    type?: string;
    narration?: string;
    issues?: string[];
  }>;
};

type LocalExtraction = {
  method: string;
  pages: string[];
  text: string;
};

const OCR_RESPONSE_SCHEMA = {
  name: "accounting_ocr_result",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      document_kind: {
        type: "string",
        enum: ["sales", "purchase", "statement", "unknown"],
      },
      overall_confidence: {
        type: "number",
      },
      summary: {
        type: "string",
      },
      entries: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            date: { type: "string" },
            voucher_number: { type: "string" },
            party_ledger: { type: "string" },
            amount: { type: "number" },
            type: { type: "string" },
            narration: { type: "string" },
            issues: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: ["date", "voucher_number", "party_ledger", "amount", "type", "narration", "issues"],
        },
      },
    },
    required: ["document_kind", "overall_confidence", "summary", "entries"],
  },
} as const;

const BUNDLED_PYTHON =
  process.env.CODEX_BUNDLED_PYTHON ||
  "C:\\Users\\HOC\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\python\\python.exe";
const POPPLER_PATH =
  process.env.CODEX_POPPLER_PATH ||
  "C:\\Users\\HOC\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\native\\poppler\\Library\\bin";
const TESSERACT_PATH = process.env.TESSERACT_PATH || "C:\\Program Files\\Tesseract-OCR\\tesseract.exe";
const LOCAL_OCR_SCRIPT = path.join(process.cwd(), "api", "lib", "local-ocr-extract.py");

export class OcrServiceError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "OcrServiceError";
    this.status = status;
  }
}

function readEnvFile(filePath: string) {
  if (!existsSync(filePath)) return;
  const raw = readFileSync(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function ensureOpenAIKey() {
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY;

  const cwd = process.cwd();
  readEnvFile(path.join(cwd, ".env.local"));
  readEnvFile(path.join(cwd, ".env"));

  return process.env.OPENAI_API_KEY;
}

function normalizeType(expectedType: UploadFlow, modelType?: string) {
  const clean = (modelType ?? "").trim().toLowerCase();
  if (expectedType === "sales") return "Sales";
  if (expectedType === "purchase") return "Purchase";
  if (expectedType === "statement") {
    if (clean === "receipt") return "Receipt";
    if (clean === "payment") return "Payment";
    if (clean === "contra") return "Contra";
    return "Statement";
  }
  return "Unknown";
}

function inferMime(file: File) {
  if (file.type) return file.type;
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".xlsx")) return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  if (lower.endsWith(".xls")) return "application/vnd.ms-excel";
  if (lower.endsWith(".csv")) return "text/csv";
  if (lower.endsWith(".tsv")) return "text/tsv";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  return "application/octet-stream";
}

function buildPrompt(expectedType: UploadFlow) {
  const expectedLabel =
    expectedType === "sales"
      ? "sales invoice or outward sale bill"
      : expectedType === "purchase"
        ? "purchase bill or inward invoice"
        : "bank statement";

  return [
    "You are an expert Indian accounting OCR assistant.",
    `The user uploaded a document for the "${expectedType}" workflow.`,
    `Expected document kind: ${expectedLabel}.`,
    "Read the uploaded file carefully and extract only what is actually visible in the document.",
    "Do not invent entries, amounts, dates, names, voucher numbers, or narratives.",
    "If the document type does not match the expected workflow, mark that clearly in summary and in entry issues.",
    "For sales and purchase documents, create one accounting entry per bill or invoice total unless the file clearly contains multiple separate invoices.",
    "For bank statements, extract each visible transaction row as a separate entry.",
    "If any important field is missing or uncertain, still include the row but add the problem in issues.",
  ].join("\n");
}

function extractJsonPayload(raw: string): ModelShape {
  return JSON.parse(raw) as ModelShape;
}

function extractResponseText(payload: any) {
  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text;
  }

  const parts: string[] = [];
  for (const item of payload.output ?? []) {
    for (const content of item.content ?? []) {
      if (typeof content.text === "string") {
        parts.push(content.text);
      }
    }
  }
  return parts.join("\n").trim();
}

function classifyTransportError(error: unknown) {
  const code =
    typeof error === "object" && error !== null && "cause" in error
      ? String((error as { cause?: { code?: string } }).cause?.code ?? "")
      : "";

  if (code === "UND_ERR_HEADERS_TIMEOUT") {
    return new OcrServiceError(
      "OCR request timed out while waiting for the scan result. Large file ko local fallback se process kiya ja raha hai.",
      504,
    );
  }

  if (code === "UND_ERR_SOCKET" || code === "ECONNRESET") {
    return new OcrServiceError(
      "OCR connection beech me disconnect ho gayi. File ko local fallback se process kiya ja raha hai.",
      503,
    );
  }

  return new OcrServiceError("Unable to scan the uploaded document right now.", 500);
}

function mapOcrFailure(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("insufficient_quota")) {
    return new OcrServiceError(
      "OCR service is temporarily unavailable because the OpenAI billing quota is exhausted. Local fallback scan try kiya jayega.",
      503,
    );
  }

  if (normalized.includes("invalid_api_key")) {
    return new OcrServiceError(
      "OCR service is not configured correctly right now. Please check the OpenAI API key in PowerShell and try again.",
      503,
    );
  }

  if (normalized.includes("rate_limit")) {
    return new OcrServiceError(
      "OCR service is busy right now. Please wait a moment and try the upload again.",
      429,
    );
  }

  return new OcrServiceError("Unable to scan the uploaded document right now.", 500);
}

async function fetchWithRetry(url: string, init: RequestInit, stage: string, attempts = 3) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fetch(url, {
        ...init,
        signal: AbortSignal.timeout(240000),
      });
    } catch (error) {
      lastError = error;
      const code =
        typeof error === "object" && error !== null && "cause" in error
          ? String((error as { cause?: { code?: string } }).cause?.code ?? "")
          : "";

      const retryable = ["UND_ERR_HEADERS_TIMEOUT", "UND_ERR_SOCKET", "ECONNRESET", "ETIMEDOUT"].includes(code);
      if (!retryable || attempt === attempts) {
        throw new OcrServiceError(`${stage} failed after ${attempt} attempt(s). ${classifyTransportError(error).message}`, 503);
      }

      await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
    }
  }

  throw classifyTransportError(lastError);
}

async function uploadFileToOpenAI(file: File, apiKey: string) {
  const formData = new FormData();
  formData.append("purpose", "user_data");
  formData.append("file", file);

  const response = await fetchWithRetry(
    "https://api.openai.com/v1/files",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    },
    `Uploading ${file.name} to OCR service`,
  );

  if (!response.ok) {
    const text = await response.text();
    throw mapOcrFailure(text.slice(0, 600));
  }

  const payload = (await response.json()) as { id: string };
  return payload.id;
}

async function runOpenAiDocumentOcr(file: File, expectedType: UploadFlow): Promise<OcrResult> {
  const apiKey = ensureOpenAIKey();
  if (!apiKey) {
    throw new OcrServiceError(
      "OCR service is not configured yet. Please add a valid OpenAI API key before scanning documents.",
      503,
    );
  }

  const mime = inferMime(file);
  const prompt = buildPrompt(expectedType);

  const fileInput = mime.startsWith("image/")
    ? {
        type: "input_image",
        image_url: `data:${mime};base64,${Buffer.from(await file.arrayBuffer()).toString("base64")}`,
        detail: "high",
      }
    : {
        type: "input_file",
        file_id: await uploadFileToOpenAI(file, apiKey),
      };

  const response = await fetchWithRetry(
    "https://api.openai.com/v1/responses",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_OCR_MODEL || "gpt-4.1-mini",
        store: false,
        input: [
          {
            role: "user",
            content: [
              { type: "input_text", text: prompt },
              fileInput,
            ],
          },
        ],
        text: {
          format: {
            type: "json_schema",
            ...OCR_RESPONSE_SCHEMA,
          },
        },
        max_output_tokens: 4000,
      }),
    },
    `Analyzing ${file.name} in OCR service`,
  );

  if (!response.ok) {
    const text = await response.text();
    throw mapOcrFailure(text.slice(0, 600));
  }

  const payload = await response.json();
  const outputText = extractResponseText(payload);
  if (!outputText) {
    throw new OcrServiceError("OCR service returned an empty result. Please try a clearer file.", 502);
  }

  const parsed = extractJsonPayload(outputText);
  const detectedKind = (parsed.document_kind ?? "unknown").toLowerCase();
  const mismatch =
    (expectedType === "sales" && detectedKind !== "sales") ||
    (expectedType === "purchase" && detectedKind !== "purchase") ||
    (expectedType === "statement" && detectedKind !== "statement");

  const entries: OcrEntry[] = [];
  const exceptions: OcrException[] = [];

  for (const [index, item] of (parsed.entries ?? []).entries()) {
    const issues = [...(item.issues ?? [])];
    if (!item.date) issues.push("Date is missing or unclear.");
    if (!item.party_ledger) issues.push("Party / ledger name is missing or unclear.");
    if (typeof item.amount !== "number" || Number.isNaN(item.amount) || item.amount <= 0) {
      issues.push("Amount is missing or unclear.");
    }
    if (mismatch) {
      issues.push(`Document looks like "${detectedKind}" instead of "${expectedType}".`);
    }

    entries.push({
      id: crypto.randomUUID(),
      date: item.date?.trim() || "",
      vchNo: item.voucher_number?.trim() || `AUTO-${index + 1}`,
      partyLedger: item.party_ledger?.trim() || "Needs review",
      amount: typeof item.amount === "number" ? item.amount : 0,
      type: normalizeType(expectedType, item.type),
      narration: item.narration?.trim() || `${expectedType} document entry`,
      status: issues.length > 0 ? "exception" : "ready",
      issues,
      sourceFile: file.name,
    });
  }

  if (mismatch) {
    exceptions.push({
      id: crypto.randomUUID(),
      sourceFile: file.name,
      reason: "Document type mismatch",
      details: [`Selected workflow: ${expectedType}`, `Detected document kind: ${detectedKind}`],
    });
  }

  if (entries.length === 0) {
    exceptions.push({
      id: crypto.randomUUID(),
      sourceFile: file.name,
      reason: "No usable entries found",
      details: [parsed.summary ?? "The OCR model could not extract any reliable rows."],
    });
  }

  return {
    entries,
    exceptions,
    summary: parsed.summary?.trim() || `Processed ${file.name} using OpenAI OCR`,
  };
}

function sanitizeText(value: string) {
  return value.replace(/\r/g, "").replace(/[ \t]+/g, " ").replace(/\u0000/g, "").trim();
}

function toIsoDate(raw: string) {
  const value = raw.trim();
  const months: Record<string, string> = {
    jan: "01",
    feb: "02",
    mar: "03",
    apr: "04",
    may: "05",
    jun: "06",
    jul: "07",
    aug: "08",
    sep: "09",
    oct: "10",
    nov: "11",
    dec: "12",
  };

  const dashMatch = value.match(/^(\d{1,2})-(\d{1,2})-(\d{2,4})$/);
  if (dashMatch) {
    const [, dd, mm, yy] = dashMatch;
    const year = yy.length === 2 ? `20${yy}` : yy;
    return `${year}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }

  const monthMatch = value.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{2,4})$/);
  if (monthMatch) {
    const [, dd, mon, yy] = monthMatch;
    const month = months[mon.toLowerCase()] || "01";
    const year = yy.length === 2 ? `20${yy}` : yy;
    return `${year}-${month}-${dd.padStart(2, "0")}`;
  }

  return "";
}

function parseAmount(raw: string) {
  const cleaned = raw.replace(/,/g, "").trim();
  const amount = Number(cleaned);
  return Number.isFinite(amount) ? amount : 0;
}

function summarizeFailure(file: File, method: string, reason: string): OcrResult {
  return {
    entries: [],
    exceptions: [
      {
        id: crypto.randomUUID(),
        sourceFile: file.name,
        reason: "Scan needs review",
        details: [method, reason],
      },
    ],
    summary: `${file.name}: ${reason}`,
  };
}

function parseStatementEntries(text: string, sourceFile: string): OcrResult {
  const flattened = text.replace(/\s+/g, " ").trim();
  const rowRegex =
    /\d[\d,]*\.\d+\s+(\d{2}-\d{2}-\d{4})(?:\s+\d{2}-\d{2}-\d{4})?\s+(.+?)\s+(-|[\d,]+\.\d{2})\s+(-|[\d,]+\.\d{2})(?=\s+\d[\d,]*\.\d+\s+\d{2}-\d{2}-\d{4}|\s+This is a computer-generated statement|\s+Page \d+ of|\s*$)/g;

  const entries: OcrEntry[] = [];
  let match: RegExpExecArray | null;

  while ((match = rowRegex.exec(flattened)) !== null) {
    const [, dateRaw, descriptionRaw, debitRaw, creditRaw] = match;
    const debit = debitRaw === "-" ? 0 : parseAmount(debitRaw);
    const credit = creditRaw === "-" ? 0 : parseAmount(creditRaw);
    const amount = credit > 0 ? credit : debit;
    const type = credit > 0 ? "Receipt" : "Payment";
    const description = sanitizeText(descriptionRaw).slice(0, 160);

    if (!amount) continue;
    if (/opening balance/i.test(description)) continue;

    const refMatch = description.match(/\/(\d{6,})\//);

    entries.push({
      id: crypto.randomUUID(),
      date: toIsoDate(dateRaw),
      vchNo: refMatch?.[1] || `BANK-${entries.length + 1}`,
      partyLedger: description.slice(0, 70) || "Bank transaction",
      amount,
      type,
      narration: description,
      status: "ready",
      issues: [],
      sourceFile,
    });
  }

  if (entries.length === 0) {
    return {
      entries: [],
      exceptions: [
        {
          id: crypto.randomUUID(),
          sourceFile,
          reason: "Statement parsing failed",
          details: [
            "Local OCR text was extracted, but transaction rows could not be reliably mapped.",
            sanitizeText(text).slice(0, 240),
          ],
        },
      ],
      summary: `${sourceFile}: statement text mila, but rows parse nahi ho paye.`,
    };
  }

  return {
    entries,
    exceptions: [],
    summary: `${sourceFile}: ${entries.length} statement transaction local fallback se parse hui.`,
  };
}

function parseInvoiceBlocksFromPages(pages: string[]) {
  return pages
    .map((page) => sanitizeText(page))
    .filter((page) => page.length > 40)
    .map((page) => page.replace(/\n+/g, "\n"));
}

function findBuyerName(block: string) {
  const buyerMatch = block.match(/Buyer\s*\(Bill to\)\s*([\s\S]{0,200})/i);
  if (!buyerMatch) return "";

  const lines = buyerMatch[1]
    .split("\n")
    .map((line) => sanitizeText(line))
    .filter(Boolean)
    .filter((line) => !/gstin|state name|code|terms of delivery/i.test(line));

  return lines[0] || "";
}

function isMeaningfulPartyName(value: string) {
  const clean = sanitizeText(value);
  if (!clean || clean === "Needs review") return false;
  if (clean.length < 4) return false;
  if ((clean.match(/[A-Za-z]/g) || []).length < 3) return false;
  if (/[â€¢â€”â€˜â€™]/.test(clean)) return false;
  return true;
}

function parseInvoiceEntry(block: string, expectedType: UploadFlow, sourceFile: string, index: number): OcrEntry | null {
  if (!/invoice/i.test(block)) return null;

  const invoiceMatch = block.match(/Invoice No\.?\s*([A-Za-z0-9/-]+)?\s+Dated\s+([0-9A-Za-z-]+)/i);
  const altDateMatch = block.match(/\b(\d{1,2}-[A-Za-z]{3}-\d{2,4}|\d{1,2}-\d{1,2}-\d{2,4})\b/);
  const buyerName = findBuyerName(block) || "Needs review";

  const subtotalMatch = block.match(/\n\s*([\d,]+\.\d{2})\s*\n\s*SGST/i);
  const sgstMatch = block.match(/SGST[^\d]{0,20}([\d,]+\.\d{2})/i);
  const cgstMatch = block.match(/CGST[^\d]{0,20}([\d,]+\.\d{2})/i);
  const igstMatch = block.match(/IGST[^\d]{0,20}([\d,]+\.\d{2})/i);
  const totalLineMatch = block.match(/Total[^\d]{0,30}([\d,]+\.\d{2})/i);
  const allAmounts = Array.from(block.matchAll(/\b\d{1,3}(?:,\d{3})*\.\d{2}\b/g)).map((item) => parseAmount(item[0]));

  const subtotal = subtotalMatch ? parseAmount(subtotalMatch[1]) : 0;
  const sgst = sgstMatch ? parseAmount(sgstMatch[1]) : 0;
  const cgst = cgstMatch ? parseAmount(cgstMatch[1]) : 0;
  const igst = igstMatch ? parseAmount(igstMatch[1]) : 0;
  const total =
    (totalLineMatch ? parseAmount(totalLineMatch[1]) : 0) ||
    (subtotal > 0 ? subtotal + sgst + cgst + igst : 0) ||
    Math.max(...allAmounts, 0);

  if (!total) {
    return null;
  }

  const date = toIsoDate(invoiceMatch?.[2] || altDateMatch?.[1] || "");
  const issues: string[] = [];
  if (!date) {
    issues.push("Invoice date could not be read clearly.");
  }
  if (!isMeaningfulPartyName(buyerName)) {
    issues.push("Buyer name could not be read clearly.");
  }

  return {
    id: crypto.randomUUID(),
    date,
    vchNo: invoiceMatch?.[1] || `INV-${index + 1}`,
    partyLedger: isMeaningfulPartyName(buyerName) ? buyerName : "Needs review",
    amount: total,
    type: expectedType === "purchase" ? "Purchase" : "Sales",
    narration: `${expectedType === "purchase" ? "Purchase" : "Sales"} invoice parsed by local fallback OCR`,
    status: issues.length > 0 ? "exception" : "ready",
    issues,
    sourceFile,
  };
}

function parseInvoiceEntries(pages: string[], expectedType: UploadFlow, sourceFile: string, method: string): OcrResult {
  const blocks = parseInvoiceBlocksFromPages(pages);
  const entries = blocks
    .map((block, index) => parseInvoiceEntry(block, expectedType, sourceFile, index))
    .filter((entry): entry is OcrEntry => Boolean(entry));

  if (entries.length === 0) {
    return {
      entries: [],
      exceptions: [
        {
          id: crypto.randomUUID(),
          sourceFile,
          reason: "Invoice parsing failed",
          details: [
            `${method} se OCR text nikla, lekin invoice total ya buyer reliably identify nahi hua.`,
            sanitizeText(blocks[0] || "").slice(0, 260),
          ],
        },
      ],
      summary: `${sourceFile}: local OCR text mila, but invoice fields parse nahi ho paye.`,
    };
  }

  return {
    entries,
    exceptions: entries
      .filter((entry) => entry.status === "exception")
      .map((entry) => ({
        id: entry.id,
        sourceFile: entry.sourceFile,
        reason: "Invoice needs review",
        details: entry.issues,
      })),
    summary: `${sourceFile}: ${entries.length} invoice local fallback se parse hui.`,
  };
}

async function runLocalFallbackOcr(file: File, expectedType: UploadFlow, originalError: Error): Promise<OcrResult> {
  if (!existsSync(BUNDLED_PYTHON) || !existsSync(LOCAL_OCR_SCRIPT)) {
    return summarizeFailure(file, "Local fallback unavailable", originalError.message);
  }

  const tempDir = await mkdtemp(path.join(os.tmpdir(), "aditya-ocr-"));
  const tempFile = path.join(tempDir, file.name);

  try {
    await writeFile(tempFile, Buffer.from(await file.arrayBuffer()));
    const { stdout } = await execFileAsync(
      BUNDLED_PYTHON,
      [
        LOCAL_OCR_SCRIPT,
        tempFile,
        "--poppler",
        POPPLER_PATH,
        "--tesseract",
        TESSERACT_PATH,
        "--max-pages",
        "25",
      ],
      {
        cwd: process.cwd(),
        timeout: 600000,
        maxBuffer: 20 * 1024 * 1024,
        windowsHide: true,
      },
    );

    const extracted = JSON.parse(stdout) as LocalExtraction;
    const text = sanitizeText(extracted.text);

    if (!text) {
      return summarizeFailure(file, extracted.method, `Local fallback me readable text nahi mila. Original issue: ${originalError.message}`);
    }

    if (expectedType === "statement") {
      const parsed = parseStatementEntries(text, file.name);
      parsed.summary = `${parsed.summary} OpenAI issue: ${originalError.message}`;
      return parsed;
    }

    const parsed = parseInvoiceEntries(extracted.pages, expectedType, file.name, extracted.method);
    parsed.summary = `${parsed.summary} OpenAI issue: ${originalError.message}`;
    return parsed;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown local OCR error";
    return summarizeFailure(file, "Local fallback failed", `${originalError.message} | Local OCR issue: ${message}`);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

export async function runDocumentOcr(file: File, expectedType: UploadFlow): Promise<OcrResult> {
  try {
    return await runOpenAiDocumentOcr(file, expectedType);
  } catch (error) {
    const knownError =
      error instanceof OcrServiceError ? error : error instanceof Error ? classifyTransportError(error) : new OcrServiceError("OCR failed.", 500);
    return runLocalFallbackOcr(file, expectedType, knownError);
  }
}
