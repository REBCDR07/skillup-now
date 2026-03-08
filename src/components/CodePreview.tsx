import { useState } from "react";
import { Eye, EyeOff, Copy, Check } from "lucide-react";

interface CodePreviewProps {
  code: string;
  language?: string;
}

const CodePreview = ({ code, language }: CodePreviewProps) => {
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  const isHtml = language === "html" || code.includes("<") && code.includes(">");
  const isCss = language === "css" || code.includes("{") && code.includes("}") && code.includes(":");

  const canPreview = isHtml || isCss;

  const getPreviewHtml = () => {
    if (isHtml && !isCss) return code;
    if (isCss) return `<style>${code}</style><div class="preview">Aperçu CSS</div>`;
    return code;
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-2 overflow-hidden rounded-lg border border-border">
      <div className="flex items-center justify-between bg-muted/50 px-3 py-1.5">
        <span className="text-xs text-muted-foreground">{language || "code"}</span>
        <div className="flex items-center gap-1">
          <button onClick={handleCopy} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground" title="Copier">
            {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          {canPreview && (
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              title={showPreview ? "Masquer l'aperçu" : "Voir l'aperçu"}
            >
              {showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
      </div>
      <div className={`grid ${showPreview && canPreview ? "md:grid-cols-2" : "grid-cols-1"}`}>
        <div className="bg-muted p-4">
          <pre className="overflow-x-auto text-sm text-foreground"><code>{code}</code></pre>
        </div>
        {showPreview && canPreview && (
          <div className="border-t border-border bg-background p-4 md:border-l md:border-t-0">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Aperçu</p>
            <iframe
              srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:system-ui;padding:8px;margin:0;color:#333;}</style></head><body>${getPreviewHtml()}</body></html>`}
              className="h-40 w-full rounded border border-border bg-white"
              sandbox="allow-scripts"
              title="Aperçu du code"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CodePreview;
