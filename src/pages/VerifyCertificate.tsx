import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle2, XCircle, Award, ExternalLink, Download, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";

const NAVY = "#0B1D35";
const EMERALD = "#1B9E5A";
const GOLD = "#D4A024";
const LIGHT_BG = "#F8FAFB";
const GRAY = "#6B7B8D";

const VerifyCertificate = () => {
  const { certificateId } = useParams();
  const [cert, setCert] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

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

  const downloadCertificate = async () => {
    if (!cert) return;
    setDownloading(true);
    try {
      await Promise.all([
        loadFont("https://fonts.gstatic.com/s/unbounded/v7/Yq6F-LOTXCb04q32xlpat-6uR42XTqtG65jEkA.woff2", "Unbounded"),
        loadFont("https://fonts.gstatic.com/s/oswald/v53/TK3_WkUHHAIjg75cFRf3bXL8LICs1_FvsUZiZQ.woff2", "Oswald"),
      ]);

      const canvas = document.createElement("canvas");
      const W = 1400;
      const H = 990;
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d")!;

      // ===== BACKGROUND =====
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, W, H);

      // ===== NAVY BORDER =====
      ctx.strokeStyle = NAVY;
      ctx.lineWidth = 4;
      ctx.strokeRect(24, 24, W - 48, H - 48);

      // Inner gold accent line
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(34, 34, W - 68, H - 68);

      // ===== TOP EMERALD BAR =====
      ctx.fillStyle = EMERALD;
      ctx.fillRect(34, 34, W - 68, 6);

      // ===== LOGO =====
      // Rounded emerald square
      const logoX = W / 2 - 30;
      const logoY = 65;
      const logoS = 60;
      roundRect(ctx, logoX, logoY, logoS, logoS, 12);
      ctx.fillStyle = EMERALD;
      ctx.fill();
      // "SF" text in logo
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 24px 'Unbounded', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("SF", W / 2, logoY + logoS / 2);

      // Platform name
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = NAVY;
      ctx.font = "700 26px 'Unbounded', sans-serif";
      ctx.fillText("SkillFlash Academy", W / 2, 160);

      // Subtitle
      ctx.fillStyle = GRAY;
      ctx.font = "400 11px 'Oswald', sans-serif";
      ctx.letterSpacing = "6px";
      ctx.fillText("DOCUMENT OFFICIEL DE CERTIFICATION", W / 2, 185);

      // ===== DECORATIVE SEPARATOR =====
      const sepY = 205;
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(W / 2 - 200, sepY);
      ctx.lineTo(W / 2 - 12, sepY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(W / 2 + 12, sepY);
      ctx.lineTo(W / 2 + 200, sepY);
      ctx.stroke();
      // Diamond
      ctx.fillStyle = GOLD;
      ctx.save();
      ctx.translate(W / 2, sepY);
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-5, -5, 10, 10);
      ctx.restore();

      // ===== TITLE =====
      ctx.fillStyle = NAVY;
      ctx.font = "700 44px 'Oswald', sans-serif";
      ctx.fillText("CERTIFICAT DE RÉUSSITE", W / 2, 265);

      // ===== ATTESTATION =====
      ctx.fillStyle = GRAY;
      ctx.font = "400 14px 'Oswald', sans-serif";
      ctx.fillText("CE DOCUMENT ATTESTE QUE", W / 2, 310);

      // ===== NAME =====
      ctx.fillStyle = NAVY;
      ctx.font = "700 40px 'Unbounded', sans-serif";
      ctx.fillText(cert.profileName.toUpperCase(), W / 2, 370);

      // Name underline
      const nameW = ctx.measureText(cert.profileName.toUpperCase()).width;
      ctx.strokeStyle = EMERALD;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(W / 2 - nameW / 2 - 30, 385);
      ctx.lineTo(W / 2 + nameW / 2 + 30, 385);
      ctx.stroke();

      // ===== COMPLETION TEXT =====
      ctx.fillStyle = GRAY;
      ctx.font = "400 14px 'Oswald', sans-serif";
      ctx.fillText("A complété avec succès le cursus de formation :", W / 2, 425);

      // ===== COURSE TITLE =====
      ctx.fillStyle = NAVY;
      ctx.font = "700 28px 'Unbounded', sans-serif";
      const courseTitle = ((cert.courses as any)?.title || "Cours").toUpperCase();
      // Word wrap if needed
      const maxTitleWidth = W - 200;
      const titleMetrics = ctx.measureText(courseTitle);
      if (titleMetrics.width > maxTitleWidth) {
        ctx.font = "700 22px 'Unbounded', sans-serif";
      }
      ctx.fillText(courseTitle, W / 2, 475, maxTitleWidth);

      // ===== SCORE BADGE =====
      const badgeY = 520;
      const scoreText = `${Math.round(cert.score)}%`;
      // Circle badge
      ctx.beginPath();
      ctx.arc(W / 2, badgeY + 25, 35, 0, Math.PI * 2);
      ctx.fillStyle = EMERALD;
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "700 22px 'Unbounded', sans-serif";
      ctx.fillText(scoreText, W / 2, badgeY + 32);

      // Label under score
      ctx.fillStyle = GRAY;
      ctx.font = "400 12px 'Oswald', sans-serif";
      ctx.fillText("NOTE D'EXCELLENCE", W / 2, badgeY + 75);

      // ===== STATUT BADGE =====
      const statusY = 630;
      const statusText = "✅ DÉLIVRÉ";
      roundRect(ctx, W / 2 - 70, statusY, 140, 32, 16);
      ctx.fillStyle = EMERALD + "18";
      ctx.fill();
      ctx.strokeStyle = EMERALD;
      ctx.lineWidth = 1.5;
      roundRect(ctx, W / 2 - 70, statusY, 140, 32, 16);
      ctx.stroke();
      ctx.fillStyle = EMERALD;
      ctx.font = "600 14px 'Oswald', sans-serif";
      ctx.fillText(statusText, W / 2, statusY + 22);

      // ===== BOTTOM SEPARATOR =====
      ctx.strokeStyle = NAVY + "20";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(80, 690);
      ctx.lineTo(W - 80, 690);
      ctx.stroke();

      // ===== BOTTOM SECTION: Date | QR | Signature =====
      const date = new Date(cert.created_at).toLocaleDateString("fr-FR", {
        year: "numeric", month: "long", day: "numeric",
      });

      // Left: Date
      ctx.textAlign = "left";
      ctx.fillStyle = GRAY;
      ctx.font = "400 11px 'Oswald', sans-serif";
      ctx.fillText("DÉLIVRÉ LE", 100, 720);
      ctx.fillStyle = NAVY;
      ctx.font = "500 16px 'Oswald', sans-serif";
      ctx.fillText(date, 100, 745);

      // Left: Verification ID
      ctx.fillStyle = GRAY;
      ctx.font = "400 10px 'Oswald', sans-serif";
      ctx.fillText(`ID: ${cert.verification_code}`, 100, 775);

      // Center: QR Code
      ctx.textAlign = "center";
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(window.location.href)}&bgcolor=FFFFFF&color=0B1D35`;
      const qrImg = new Image();
      qrImg.crossOrigin = "anonymous";
      await new Promise<void>((resolve) => {
        qrImg.onload = () => resolve();
        qrImg.onerror = () => resolve();
        qrImg.src = qrUrl;
      });
      if (qrImg.complete && qrImg.naturalWidth > 0) {
        ctx.drawImage(qrImg, W / 2 - 50, 705, 100, 100);
      }
      ctx.fillStyle = GRAY;
      ctx.font = "400 9px 'Oswald', sans-serif";
      ctx.fillText("SCANNER POUR VÉRIFIER", W / 2, 820);

      // Right: Signature
      ctx.textAlign = "right";
      ctx.fillStyle = GRAY;
      ctx.font = "400 11px 'Oswald', sans-serif";
      ctx.fillText("SIGNATURE NUMÉRIQUE", W - 100, 720);
      ctx.fillStyle = NAVY;
      ctx.font = "italic 26px 'Oswald', serif";
      ctx.fillText("SkillFlash", W - 100, 755);
      ctx.fillStyle = GRAY;
      ctx.font = "400 12px 'Oswald', sans-serif";
      ctx.fillText("Directeur Académique", W - 100, 780);

      // ===== BOTTOM EMERALD BAR =====
      ctx.fillStyle = EMERALD;
      ctx.fillRect(34, H - 40, W - 68, 6);

      // ===== FOOTER BRANDING =====
      ctx.textAlign = "left";
      ctx.fillStyle = NAVY;
      ctx.font = "700 14px 'Unbounded', sans-serif";
      ctx.fillText("SkillFlash", 55, H - 55);
      ctx.fillStyle = GRAY;
      ctx.font = "400 9px 'Oswald', sans-serif";
      ctx.fillText("Academy", 55 + ctx.measureText("SkillFlash").width + 6, H - 55);

      // Right footer
      ctx.textAlign = "right";
      ctx.fillStyle = GRAY;
      ctx.font = "400 9px 'Oswald', sans-serif";
      ctx.fillText("Innovation béninoise 🇧🇯 — Certificat vérifiable en ligne", W - 55, H - 55);

      // Download
      const link = document.createElement("a");
      link.download = `SkillFlash-Certificat-${cert.verification_code}.png`;
      link.href = canvas.toDataURL("image/png", 1.0);
      link.click();
    } catch (e) {
      console.error("Download error:", e);
    } finally {
      setDownloading(false);
    }
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
                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1">
                    <span className="font-body text-xs font-semibold text-primary">✅ DÉLIVRÉ</span>
                  </div>
                </div>

                <div className="mt-6 space-y-3 text-left">
                  <div className="flex justify-between border-b border-border py-3">
                    <span className="font-body text-sm text-muted-foreground">Date de délivrance</span>
                    <span className="font-body text-sm font-medium text-foreground">
                      {new Date(cert.created_at).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
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
                  <button
                    onClick={downloadCertificate}
                    disabled={downloading}
                    className="flex items-center justify-center gap-2 rounded-lg bg-primary p-3 font-body text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                  >
                    {downloading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    Télécharger le certificat (PNG)
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

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export default VerifyCertificate;