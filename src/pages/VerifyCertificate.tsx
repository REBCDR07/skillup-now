import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle2, XCircle, Award, ExternalLink, Download, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import jsPDF from "jspdf";

const NAVY = "#0B1D35";
const EMERALD = "#1B9E5A";
const GOLD = "#D4A024";
const GRAY = "#6B7B8D";
const LIGHT_GRAY = "#C8DAE8";

const VerifyCertificate = () => {
  const { certificateId } = useParams();
  const [cert, setCert] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPng, setDownloadingPng] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    if (certificateId) {
      supabase.from("certificates")
        .select("*, courses(title, slug)")
        .eq("verification_code", certificateId)
        .single()
        .then(async ({ data }) => {
          if (data) {
            const { data: profile } = await supabase.from("profiles").select("name").eq("user_id", data.user_id).single();
            setCert({ ...data, profileName: profile?.name || "Apprenant" });
          }
          setLoading(false);
        });
    }
  }, [certificateId]);

  const loadFont = async (fontUrl: string, fontFamily: string): Promise<void> => {
    const font = new FontFace(fontFamily, `url(${fontUrl})`);
    const loaded = await font.load();
    document.fonts.add(loaded);
  };

  const getCertData = () => {
    const courseTitle = ((cert.courses as any)?.title || "Cours").toUpperCase();
    const date = new Date(cert.created_at).toLocaleDateString("fr-FR", {
      year: "numeric", month: "long", day: "numeric",
    });
    const score = Math.round(cert.score);
    const name = cert.profileName.toUpperCase();
    return { courseTitle, date, score, name };
  };

  // ==================== PNG DOWNLOAD ====================
  const downloadPng = async () => {
    if (!cert) return;
    setDownloadingPng(true);
    try {
      await Promise.all([
        loadFont("https://fonts.gstatic.com/s/unbounded/v7/Yq6F-LOTXCb04q32xlpat-6uR42XTqtG65jEkA.woff2", "Unbounded"),
        loadFont("https://fonts.gstatic.com/s/oswald/v53/TK3_WkUHHAIjg75cFRf3bXL8LICs1_FvsUZiZQ.woff2", "Oswald"),
      ]);

      const { courseTitle, date, score, name } = getCertData();
      const canvas = document.createElement("canvas");
      const W = 1400, H = 990;
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext("2d")!;

      drawCertificateCanvas(ctx, W, H, name, courseTitle, score, date, cert.verification_code);

      // QR Code
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(window.location.href)}&bgcolor=FFFFFF&color=0B1D35`;
      const qrImg = new Image();
      qrImg.crossOrigin = "anonymous";
      await new Promise<void>((resolve) => { qrImg.onload = () => resolve(); qrImg.onerror = () => resolve(); qrImg.src = qrUrl; });
      if (qrImg.complete && qrImg.naturalWidth > 0) {
        ctx.drawImage(qrImg, W / 2 - 50, 705, 100, 100);
      }
      ctx.fillStyle = GRAY; ctx.font = "400 9px 'Oswald', sans-serif"; ctx.textAlign = "center";
      ctx.fillText("SCANNER POUR VÉRIFIER", W / 2, 820);

      const link = document.createElement("a");
      link.download = `SkillFlash-Certificat-${cert.verification_code}.png`;
      link.href = canvas.toDataURL("image/png", 1.0);
      link.click();
    } catch (e) { console.error("PNG download error:", e); }
    finally { setDownloadingPng(false); }
  };

  // ==================== PDF DOWNLOAD ====================
  const downloadPdf = async () => {
    if (!cert) return;
    setDownloadingPdf(true);
    try {
      const { courseTitle, date, score, name } = getCertData();
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const W = 297, H = 210;

      // Background
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, W, H, "F");

      // Navy border
      pdf.setDrawColor(11, 29, 53);
      pdf.setLineWidth(1.2);
      pdf.rect(5, 5, W - 10, H - 10);

      // Gold inner border
      pdf.setDrawColor(212, 160, 36);
      pdf.setLineWidth(0.4);
      pdf.rect(8, 8, W - 16, H - 16);

      // Top emerald bar
      pdf.setFillColor(27, 158, 90);
      pdf.rect(8, 8, W - 16, 2, "F");

      // Logo circle
      pdf.setFillColor(27, 158, 90);
      pdf.roundedRect(W / 2 - 8, 16, 16, 16, 3, 3, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.text("SF", W / 2, 26, { align: "center" });

      // Platform name
      pdf.setTextColor(11, 29, 53);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("SkillFlash Academy", W / 2, 42, { align: "center" });

      // Subtitle
      pdf.setTextColor(107, 123, 141);
      pdf.setFontSize(6);
      pdf.setFont("helvetica", "normal");
      pdf.text("DOCUMENT OFFICIEL DE CERTIFICATION", W / 2, 48, { align: "center" });

      // Gold separator lines
      pdf.setDrawColor(212, 160, 36);
      pdf.setLineWidth(0.3);
      pdf.line(W / 2 - 50, 53, W / 2 - 3, 53);
      pdf.line(W / 2 + 3, 53, W / 2 + 50, 53);
      // Diamond
      pdf.setFillColor(212, 160, 36);
      const dSize = 1.5;
      pdf.save();
      // Draw diamond manually with lines
      pdf.setFillColor(212, 160, 36);
      const cx = W / 2, cy = 53;
      pdf.triangle(cx, cy - dSize, cx + dSize, cy, cx, cy + dSize, "F");
      pdf.triangle(cx, cy - dSize, cx - dSize, cy, cx, cy + dSize, "F");

      // Title
      pdf.setTextColor(11, 29, 53);
      pdf.setFontSize(22);
      pdf.setFont("helvetica", "bold");
      pdf.text("CERTIFICAT DE RÉUSSITE", W / 2, 68, { align: "center" });

      // Attestation
      pdf.setTextColor(107, 123, 141);
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "normal");
      pdf.text("CE DOCUMENT ATTESTE QUE", W / 2, 76, { align: "center" });

      // Name
      pdf.setTextColor(11, 29, 53);
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text(name, W / 2, 90, { align: "center" });

      // Name underline
      const nameWidth = pdf.getTextWidth(name);
      pdf.setDrawColor(27, 158, 90);
      pdf.setLineWidth(0.6);
      pdf.line(W / 2 - nameWidth / 2 - 8, 93, W / 2 + nameWidth / 2 + 8, 93);

      // Completion text
      pdf.setTextColor(107, 123, 141);
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "normal");
      pdf.text("A complété avec succès le cursus de formation :", W / 2, 101, { align: "center" });

      // Course title
      pdf.setTextColor(11, 29, 53);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text(courseTitle, W / 2, 112, { align: "center", maxWidth: W - 60 });

      // Score badge
      pdf.setFillColor(27, 158, 90);
      pdf.circle(W / 2, 128, 9, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text(`${score}%`, W / 2, 130, { align: "center" });

      // Score label
      pdf.setTextColor(107, 123, 141);
      pdf.setFontSize(5);
      pdf.setFont("helvetica", "normal");
      pdf.text("NOTE D'EXCELLENCE", W / 2, 141, { align: "center" });

      // Status badge
      pdf.setFillColor(27, 158, 90, 15);
      pdf.setDrawColor(27, 158, 90);
      pdf.setLineWidth(0.4);
      pdf.roundedRect(W / 2 - 18, 146, 36, 8, 4, 4, "FD");
      pdf.setTextColor(27, 158, 90);
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "bold");
      pdf.text("DÉLIVRÉ", W / 2, 151.5, { align: "center" });

      // Bottom separator
      pdf.setDrawColor(200, 218, 232);
      pdf.setLineWidth(0.3);
      pdf.line(25, 162, W - 25, 162);

      // Left: Date
      pdf.setTextColor(107, 123, 141);
      pdf.setFontSize(5);
      pdf.setFont("helvetica", "normal");
      pdf.text("DÉLIVRÉ LE", 30, 170);
      pdf.setTextColor(11, 29, 53);
      pdf.setFontSize(8);
      pdf.text(date, 30, 176);
      pdf.setTextColor(107, 123, 141);
      pdf.setFontSize(5);
      pdf.text(`ID: ${cert.verification_code}`, 30, 182);

      // Center: QR placeholder
      pdf.setDrawColor(200, 218, 232);
      pdf.setLineWidth(0.3);
      pdf.rect(W / 2 - 12, 166, 24, 24);
      pdf.setTextColor(107, 123, 141);
      pdf.setFontSize(4);
      pdf.text("QR CODE", W / 2, 194, { align: "center" });

      // Right: Signature
      pdf.setTextColor(107, 123, 141);
      pdf.setFontSize(5);
      pdf.setFont("helvetica", "normal");
      pdf.text("SIGNATURE NUMÉRIQUE", W - 30, 170, { align: "right" });
      pdf.setTextColor(11, 29, 53);
      pdf.setFontSize(13);
      pdf.setFont("helvetica", "bolditalic");
      pdf.text("SkillFlash", W - 30, 178, { align: "right" });
      pdf.setTextColor(107, 123, 141);
      pdf.setFontSize(6);
      pdf.setFont("helvetica", "normal");
      pdf.text("Directeur Académique", W - 30, 184, { align: "right" });

      // Bottom emerald bar
      pdf.setFillColor(27, 158, 90);
      pdf.rect(8, H - 10, W - 16, 2, "F");

      // Footer branding
      pdf.setTextColor(11, 29, 53);
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "bold");
      pdf.text("SkillFlash Academy", 12, H - 13);
      pdf.setTextColor(107, 123, 141);
      pdf.setFontSize(4);
      pdf.setFont("helvetica", "normal");
      pdf.text("Innovation béninoise — Certificat vérifiable en ligne", W - 12, H - 13, { align: "right" });

      pdf.save(`SkillFlash-Certificat-${cert.verification_code}.pdf`);
    } catch (e) { console.error("PDF download error:", e); }
    finally { setDownloadingPdf(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const isValid = !!cert;
  const linkedinUrl = cert
    ? `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent((cert.courses as any)?.title || "SkillFlash")}&organizationName=SkillFlash%20Academy&certUrl=${encodeURIComponent(window.location.href)}&certId=${encodeURIComponent(cert.verification_code)}`
    : "";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex min-h-screen items-center justify-center px-4 pt-16">
        <div className="w-full max-w-lg">
          <div className="rounded-xl border border-border bg-card p-8 text-center shadow-lg">
            {isValid ? (
              <CheckCircle2 className="mx-auto h-16 w-16 text-primary" />
            ) : (
              <XCircle className="mx-auto h-16 w-16 text-destructive" />
            )}

            <h1 className="mt-4 font-display text-2xl font-bold text-foreground">
              {isValid ? "Certificat vérifié ✅" : "Certificat non trouvé ❌"}
            </h1>

            {isValid && (
              <>
                {/* Certificate Preview Card */}
                <div className="mt-6 overflow-hidden rounded-lg border-2 border-primary/20 bg-card p-6 shadow-inner">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                    <span className="font-display text-sm font-bold text-primary-foreground">SF</span>
                  </div>
                  <p className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Document Officiel
                  </p>
                  <p className="mt-1 font-display text-xl font-bold text-foreground">
                    CERTIFICAT DE RÉUSSITE
                  </p>
                  <div className="mx-auto my-3 h-px w-40 bg-secondary" />
                  <p className="font-body text-xs text-muted-foreground">Ce document atteste que</p>
                  <p className="mt-1 font-display text-lg font-bold uppercase tracking-wide text-foreground">
                    {cert.profileName}
                  </p>
                  <p className="mt-2 font-body text-xs text-muted-foreground">a complété avec succès</p>
                  <p className="mt-1 font-display text-base font-bold uppercase text-foreground">
                    {(cert.courses as any)?.title}
                  </p>
                  <div className="mt-3 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary">
                    <span className="font-display text-lg font-bold text-primary-foreground">{Math.round(cert.score)}%</span>
                  </div>
                  <div className="mt-3 flex items-center justify-center gap-1.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1">
                      <span className="font-body text-xs font-semibold text-primary">✅ DÉLIVRÉ</span>
                    </span>
                  </div>
                  <p className="mt-3 font-body text-[10px] text-muted-foreground">
                    SkillFlash Academy — Innovation béninoise 🇧🇯
                  </p>
                </div>

                <div className="mt-6 space-y-3 text-left">
                  <div className="flex justify-between border-b border-border py-3">
                    <span className="font-body text-sm text-muted-foreground">Date de délivrance</span>
                    <span className="font-body text-sm font-medium text-foreground">
                      {new Date(cert.created_at).toLocaleDateString("fr-FR", {
                        year: "numeric", month: "long", day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="font-body text-sm text-muted-foreground">Code de vérification</span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {cert.verification_code}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  {/* PNG Download */}
                  <button
                    onClick={downloadPng}
                    disabled={downloadingPng}
                    className="flex items-center justify-center gap-2 rounded-lg bg-primary p-3 font-body text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                  >
                    {downloadingPng ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    Télécharger en PNG
                  </button>

                  {/* PDF Download */}
                  <button
                    onClick={downloadPdf}
                    disabled={downloadingPdf}
                    className="flex items-center justify-center gap-2 rounded-lg border-2 border-primary bg-card p-3 font-body text-sm font-semibold text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
                  >
                    {downloadingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                    Télécharger en PDF vectoriel
                  </button>

                  <div className="flex items-center justify-center gap-2 rounded-lg bg-primary/10 p-3 font-body text-sm text-primary">
                    <Award className="h-4 w-4" /> Délivré par SkillFlash Academy
                  </div>
                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-lg border border-border p-3 font-body text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    <ExternalLink className="h-4 w-4" /> Ajouter à LinkedIn
                  </a>
                </div>
              </>
            )}

            {!isValid && (
              <p className="mt-4 font-body text-sm text-muted-foreground">
                Ce code de vérification ne correspond à aucun certificat dans notre base de données.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function drawCertificateCanvas(
  ctx: CanvasRenderingContext2D, W: number, H: number,
  name: string, courseTitle: string, score: number, date: string, verificationCode: string
) {
  // Background
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, W, H);

  // Navy border
  ctx.strokeStyle = NAVY; ctx.lineWidth = 4;
  ctx.strokeRect(24, 24, W - 48, H - 48);

  // Gold inner border
  ctx.strokeStyle = GOLD; ctx.lineWidth = 1.5;
  ctx.strokeRect(34, 34, W - 68, H - 68);

  // Top emerald bar
  ctx.fillStyle = EMERALD;
  ctx.fillRect(34, 34, W - 68, 6);

  // Logo
  roundRect(ctx, W / 2 - 30, 65, 60, 60, 12);
  ctx.fillStyle = EMERALD; ctx.fill();
  ctx.fillStyle = "#FFFFFF"; ctx.font = "bold 24px 'Unbounded', sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("SF", W / 2, 95);

  // Platform name
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = NAVY; ctx.font = "700 26px 'Unbounded', sans-serif";
  ctx.fillText("SkillFlash Academy", W / 2, 160);

  // Subtitle
  ctx.fillStyle = GRAY; ctx.font = "400 11px 'Oswald', sans-serif";
  ctx.fillText("DOCUMENT OFFICIEL DE CERTIFICATION", W / 2, 185);

  // Separator
  const sepY = 205;
  ctx.strokeStyle = GOLD; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(W / 2 - 200, sepY); ctx.lineTo(W / 2 - 12, sepY); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W / 2 + 12, sepY); ctx.lineTo(W / 2 + 200, sepY); ctx.stroke();
  ctx.fillStyle = GOLD; ctx.save(); ctx.translate(W / 2, sepY); ctx.rotate(Math.PI / 4);
  ctx.fillRect(-5, -5, 10, 10); ctx.restore();

  // Title
  ctx.fillStyle = NAVY; ctx.font = "700 44px 'Oswald', sans-serif";
  ctx.fillText("CERTIFICAT DE RÉUSSITE", W / 2, 265);

  // Attestation
  ctx.fillStyle = GRAY; ctx.font = "400 14px 'Oswald', sans-serif";
  ctx.fillText("CE DOCUMENT ATTESTE QUE", W / 2, 310);

  // Name
  ctx.fillStyle = NAVY; ctx.font = "700 40px 'Unbounded', sans-serif";
  ctx.fillText(name, W / 2, 370);
  const nameW = ctx.measureText(name).width;
  ctx.strokeStyle = EMERALD; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(W / 2 - nameW / 2 - 30, 385); ctx.lineTo(W / 2 + nameW / 2 + 30, 385); ctx.stroke();

  // Completion
  ctx.fillStyle = GRAY; ctx.font = "400 14px 'Oswald', sans-serif";
  ctx.fillText("A complété avec succès le cursus de formation :", W / 2, 425);

  // Course
  ctx.fillStyle = NAVY; ctx.font = "700 28px 'Unbounded', sans-serif";
  const maxTW = W - 200;
  if (ctx.measureText(courseTitle).width > maxTW) ctx.font = "700 22px 'Unbounded', sans-serif";
  ctx.fillText(courseTitle, W / 2, 475, maxTW);

  // Score badge
  ctx.beginPath(); ctx.arc(W / 2, 545, 35, 0, Math.PI * 2);
  ctx.fillStyle = EMERALD; ctx.fill();
  ctx.fillStyle = "#FFFFFF"; ctx.font = "700 22px 'Unbounded', sans-serif";
  ctx.fillText(`${score}%`, W / 2, 552);
  ctx.fillStyle = GRAY; ctx.font = "400 12px 'Oswald', sans-serif";
  ctx.fillText("NOTE D'EXCELLENCE", W / 2, 595);

  // Status badge
  roundRect(ctx, W / 2 - 70, 615, 140, 32, 16);
  ctx.fillStyle = "#1B9E5A18"; ctx.fill();
  ctx.strokeStyle = EMERALD; ctx.lineWidth = 1.5;
  roundRect(ctx, W / 2 - 70, 615, 140, 32, 16); ctx.stroke();
  ctx.fillStyle = EMERALD; ctx.font = "600 14px 'Oswald', sans-serif";
  ctx.fillText("✅ DÉLIVRÉ", W / 2, 637);

  // Bottom separator
  ctx.strokeStyle = LIGHT_GRAY; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(80, 670); ctx.lineTo(W - 80, 670); ctx.stroke();

  // Left: Date
  ctx.textAlign = "left";
  ctx.fillStyle = GRAY; ctx.font = "400 11px 'Oswald', sans-serif";
  ctx.fillText("DÉLIVRÉ LE", 100, 700);
  ctx.fillStyle = NAVY; ctx.font = "500 16px 'Oswald', sans-serif";
  ctx.fillText(date, 100, 725);
  ctx.fillStyle = GRAY; ctx.font = "400 10px 'Oswald', sans-serif";
  ctx.fillText(`ID: ${verificationCode}`, 100, 750);

  // Right: Signature
  ctx.textAlign = "right";
  ctx.fillStyle = GRAY; ctx.font = "400 11px 'Oswald', sans-serif";
  ctx.fillText("SIGNATURE NUMÉRIQUE", W - 100, 700);
  ctx.fillStyle = NAVY; ctx.font = "italic 26px 'Oswald', serif";
  ctx.fillText("SkillFlash", W - 100, 735);
  ctx.fillStyle = GRAY; ctx.font = "400 12px 'Oswald', sans-serif";
  ctx.fillText("Directeur Académique", W - 100, 760);

  // Bottom bar
  ctx.fillStyle = EMERALD;
  ctx.fillRect(34, H - 40, W - 68, 6);

  // Footer
  ctx.textAlign = "left";
  ctx.fillStyle = NAVY; ctx.font = "700 14px 'Unbounded', sans-serif";
  ctx.fillText("SkillFlash", 55, H - 55);
  ctx.fillStyle = GRAY; ctx.font = "400 9px 'Oswald', sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("Innovation béninoise 🇧🇯 — Certificat vérifiable en ligne", W - 55, H - 55);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
}

export default VerifyCertificate;