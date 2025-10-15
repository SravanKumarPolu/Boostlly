import { useState, useRef } from "react";
import { Button, Progress, Alert } from "@boostlly/ui";
import {
  ExportImportManager,
  ImportResult,
  logError,
  logDebug,
  logWarning,
} from "@boostlly/core";
import {
  Upload,
  FileText,
  FileSpreadsheet,
  FileJson,
  CheckCircle,
  AlertCircle,
  X,
  Database,
} from "lucide-react";

interface ExportImportProps {
  storage: any;
  onDataChange?: () => void;
}

export function ExportImport({ storage, onDataChange }: ExportImportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [importProgress, setImportProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const exportManager = ExportImportManager.getInstance();

  const handleExport = async (format: "json" | "csv" | "txt") => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      let content: string;
      let filename: string;
      let mimeType: string;

      switch (format) {
        case "json":
          setExportProgress(30);
          content = await exportManager.exportToJSON(storage);
          filename = `boostlly-export-${new Date().toISOString().split("T")[0]}.json`;
          mimeType = "application/json";
          break;
        case "csv":
          setExportProgress(30);
          content = await exportManager.exportQuotesToCSV(storage);
          filename = `boostlly-quotes-${new Date().toISOString().split("T")[0]}.csv`;
          mimeType = "text/csv";
          break;
        case "txt":
          setExportProgress(30);
          content = await exportManager.exportQuotesToTXT(storage);
          filename = `boostlly-quotes-${new Date().toISOString().split("T")[0]}.txt`;
          mimeType = "text/plain";
          break;
        default:
          throw new Error("Unsupported format");
      }

      setExportProgress(80);
      exportManager.downloadFile(content, filename, mimeType);
      setExportProgress(100);

      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
      }, 1000);
    } catch (error) {
      logError("Export failed:", { error: error });
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const handleImport = async (file: File) => {
    setIsImporting(true);
    setImportProgress(0);
    setImportResult(null);

    try {
      setImportProgress(20);
      const content = await exportManager.readFile(file);
      setImportProgress(40);

      let result: ImportResult;
      const fileExtension = file.name.split(".").pop()?.toLowerCase();

      if (fileExtension === "json") {
        result = await exportManager.importFromJSON(storage, content);
      } else if (fileExtension === "csv") {
        result = await exportManager.importFromCSV(storage, content);
      } else {
        throw new Error(
          "Unsupported file format. Please use JSON or CSV files.",
        );
      }

      setImportProgress(80);
      setImportResult(result);
      setImportProgress(100);

      if (result.success && onDataChange) {
        onDataChange();
      }

      setTimeout(() => {
        setIsImporting(false);
        setImportProgress(0);
      }, 2000);
    } catch (error) {
      logError("Import failed:", { error: error });
      setImportResult({
        success: false,
        imported: { quotes: 0, collections: 0, settings: false, stats: false },
        errors: [error instanceof Error ? error.message : "Import failed"],
        warnings: [],
      });
      setIsImporting(false);
      setImportProgress(0);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImport(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  };

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImport(e.dataTransfer.files[0]);
    }
  };

  const clearImportResult = () => {
    setImportResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Export Section */}
      <div className="p-6 bg-background/5 backdrop-blur-sm rounded-xl border border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Export Data
            </h3>
            <p className="text-sm text-muted-foreground">
              Download your quotes and settings
            </p>
          </div>
          <Database className="w-5 h-5 text-blue-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button
            onClick={() => handleExport("json")}
            disabled={isExporting}
            variant="glass"
            className="flex items-center gap-2"
          >
            <FileJson className="w-4 h-4" />
            Export All (JSON)
          </Button>

          <Button
            onClick={() => handleExport("csv")}
            disabled={isExporting}
            variant="glass"
            className="flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export Quotes (CSV)
          </Button>

          <Button
            onClick={() => handleExport("txt")}
            disabled={isExporting}
            variant="glass"
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Export Quotes (TXT)
          </Button>
        </div>

        {isExporting && (
          <div className="mt-4">
            <Progress value={exportProgress} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">
              Exporting data...
            </p>
          </div>
        )}
      </div>

      {/* Import Section */}
      <div className="p-6 bg-background/5 backdrop-blur-sm rounded-xl border border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Import Data
            </h3>
            <p className="text-sm text-muted-foreground">
              Import quotes and settings from files
            </p>
          </div>
          <Upload className="w-5 h-5 text-green-400" />
        </div>

        {/* Drag & Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? "border-blue-400 bg-blue-400/10"
              : "border-border hover:border-border"
          }`}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-foreground font-medium mb-2">
            Drag and drop your file here
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Supports JSON and CSV formats
          </p>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            variant="outline"
            size="sm"
          >
            Choose File
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.csv"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {isImporting && (
          <div className="mt-4">
            <Progress value={importProgress} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">
              Importing data...
            </p>
          </div>
        )}
      </div>

      {/* Import Result */}
      {importResult && (
        <div className="p-4 rounded-lg border">
          {importResult.success ? (
            <Alert
              variant="success"
              className="border-green-500/20 bg-green-500/10"
            >
              <CheckCircle className="w-4 h-4 text-green-400" />
              <div className="flex-1">
                <h4 className="font-medium text-green-400">
                  Import Successful
                </h4>
                <div className="text-sm text-green-300/80 mt-1">
                  <p>• {importResult.imported.quotes} quotes imported</p>
                  <p>
                    • {importResult.imported.collections} collections imported
                  </p>
                  {importResult.imported.settings && <p>• Settings imported</p>}
                  {importResult.imported.stats && <p>• Statistics imported</p>}
                </div>
                {importResult.warnings.length > 0 && (
                  <div className="mt-2 text-xs text-yellow-300/80">
                    <p className="font-medium">Warnings:</p>
                    {importResult.warnings.map((warning, index) => (
                      <p key={index}>• {warning}</p>
                    ))}
                  </div>
                )}
              </div>
              <Button
                onClick={clearImportResult}
                variant="ghost"
                size="icon"
                className="text-green-400 hover:text-green-300"
              >
                <X className="w-4 h-4" />
              </Button>
            </Alert>
          ) : (
            <Alert
              variant="destructive"
              className="border-red-500/20 bg-red-500/10"
            >
              <AlertCircle className="w-4 h-4 text-red-400" />
              <div className="flex-1">
                <h4 className="font-medium text-red-400">Import Failed</h4>
                <div className="text-sm text-red-300/80 mt-1">
                  {importResult.errors.map((error, index) => (
                    <p key={index}>• {error}</p>
                  ))}
                </div>
              </div>
              <Button
                onClick={clearImportResult}
                variant="ghost"
                size="icon"
                className="text-red-400 hover:text-red-300"
              >
                <X className="w-4 h-4" />
              </Button>
            </Alert>
          )}
        </div>
      )}

      {/* Data Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-background/5 backdrop-blur-sm rounded-lg border border-border text-center">
          <Database className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Total Data</p>
          <p className="text-lg font-bold text-foreground">All Formats</p>
        </div>

        <div className="p-4 bg-background/5 backdrop-blur-sm rounded-lg border border-border text-center">
          <FileText className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">JSON Export</p>
          <p className="text-lg font-bold text-foreground">Complete</p>
        </div>

        <div className="p-4 bg-background/5 backdrop-blur-sm rounded-lg border border-border text-center">
          <FileSpreadsheet className="w-6 h-6 text-purple-400 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">CSV Export</p>
          <p className="text-lg font-bold text-foreground">Quotes Only</p>
        </div>

        <div className="p-4 bg-background/5 backdrop-blur-sm rounded-lg border border-border text-center">
          <Upload className="w-6 h-6 text-orange-400 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Import</p>
          <p className="text-lg font-bold text-foreground">JSON/CSV</p>
        </div>
      </div>
    </div>
  );
}
