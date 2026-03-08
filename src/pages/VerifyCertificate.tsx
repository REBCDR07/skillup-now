import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle2, XCircle, Award, ExternalLink, Download, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";

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
      // Load Google Fonts
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

      // ===== OUTER BORDER (double line) =====
      ctx.strokeStyle = "#1a5276";
      ctx.lineWidth = 3;
      ctx.strokeRect(20, 20, W - 40, H - 40);
      ctx.strokeStyle = "#c8dae8";
      ctx.lineWidth = 1;
      ctx.strokeRect(30, 30, W - 60, H - 60);

      // ===== TOP BLUE ACCENT BAR =====
      ctx.fillStyle = "#1a5276";
      ctx.fillRect(30, 30, W - 60, 8);

      // ===== LOGO AREA =====
      // Blue square icon
      ctx.fillStyle = "#1a5276";
      roundRect(ctx, W / 2 - 25, 65, 50, 50, 8);
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 28px 'Unbounded', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("S", W / 2, 100);

      // Academy name
      ctx.fillStyle = "#1a5276";
      ctx.font = "bold 22px 'Unbounded', sans-serif";
      ctx.fillText("SkillFlash Academy", W / 2, 150);

      // ===== DOCUMENT OFFICIEL =====
      ctx.fillStyle = "#6b7b8d";
      ctx.font = "12px 'Oswald', sans-serif";
      ctx.letterSpacing = "4px";
      ctx.fillText("DOCUMENT OFFICIEL DE CERTIFICATION", W / 2, 180);

      // ===== CERTIFICAT DE RÉUSSITE =====
      ctx.fillStyle = "#1a5276";
      ctx.font = "italic bold 42px 'Oswald', serif";
      ctx.fillText("CERTIFICAT DE RÉUSSITE", W / 2, 240);

      // ===== Decorative line under title =====
      const lineY = 258;
      const lineW = 300;
      ctx.strokeStyle = "#c8dae8";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(W / 2 - lineW, lineY);
      ctx.lineTo(W / 2 + lineW, lineY);
      ctx.stroke();
      // Center diamond
      ctx.fillStyle = "#1a5276";
      ctx.save();
      ctx.translate(W / 2, lineY);
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-5, -5, 10, 10);
      ctx.restore();

      // ===== CE DOCUMENT ATTESTE QUE =====
      ctx.fillStyle = "#6b7b8d";
      ctx.font = "14px 'Oswald', sans-serif";
      ctx.fillText("CE DOCUMENT ATTESTE QUE", W / 2, 300);

      // ===== NAME =====
      ctx.fillStyle = "#1a3c5a";
      ctx.font = "bold 38px 'Oswald', sans-serif";
      ctx.fillText(cert.profileName.toUpperCase(), W / 2, 355);

      // Underline name
      const nameWidth = ctx.measureText(cert.profileName.toUpperCase()).width;
      ctx.strokeStyle = "#1a5276";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(W / 2 - nameWidth / 2 - 20, 370);
      ctx.lineTo(W / 2 + nameWidth / 2 + 20, 370);
      ctx.stroke();

      // ===== COMPLETION TEXT =====
      ctx.fillStyle = "#6b7b8d";
      ctx.font = "14px 'Oswald', sans-serif";
      ctx.fillText("A complété avec succès le cursus intensif de formation intitulé :", W / 2, 410);

      // ===== COURSE TITLE =====
      ctx.fillStyle = "#1a3c5a";
      ctx.font = "bold 30px 'Unbounded', sans-serif";
      const courseTitle = ((cert.courses as any)?.title || "Cours").toUpperCase();
      ctx.fillText(courseTitle, W / 2, 465);

      // ===== SCORE =====
      ctx.fillStyle = "#6b7b8d";
      ctx.font = "16px 'Oswald', sans-serif";
      ctx.fillText(`Obtenu avec une note d'excellence de`, W / 2, 520);
      ctx.fillStyle = "#1a5276";
      ctx.font = "bold 22px 'Unbounded', sans-serif";
      ctx.fillText(`${Math.round(cert.score)}%`, W / 2, 555);

      // ===== CHECKMARK ICON =====
      ctx.strokeStyle = "#1a5276";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(W / 2, 600, 20, 0, Math.PI * 2);
      ctx.stroke();
      // Checkmark
      ctx.strokeStyle = "#1a5276";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(W / 2 - 8, 600);
      ctx.lineTo(W / 2 - 2, 608);
      ctx.lineTo(W / 2 + 10, 592);
      ctx.stroke();

      // ===== BOTTOM SECTION =====
      // Bottom line
      ctx.strokeStyle = "#c8dae8";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(80, 660);
      ctx.lineTo(W - 80, 660);
      ctx.stroke();

      // Left: Délivré le
      const date = new Date(cert.created_at).toLocaleDateString("fr-FR", {
        year: "numeric", month: "long", day: "numeric",
      });
      ctx.textAlign = "left";
      ctx.fillStyle = "#6b7b8d";
      ctx.font = "11px 'Oswald', sans-serif";
      ctx.fillText("DÉLIVRÉ LE", 100, 700);
      ctx.fillStyle = "#1a3c5a";
      ctx.font = "16px 'Oswald', sans-serif";
      ctx.fillText(date, 100, 725);

      // Center: ID + QR
      ctx.textAlign = "center";
      ctx.fillStyle = "#6b7b8d";
      ctx.font = "11px 'Oswald', sans-serif";
      ctx.fillText(`ID: ${cert.verification_code}`, W / 2, 750);

      // QR Code
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(window.location.href)}&bgcolor=FFFFFF&color=1a5276`;
      const qrImg = new Image();
      qrImg.crossOrigin = "anonymous";
      await new Promise<void>((resolve) => {
        qrImg.onload = () => resolve();
        qrImg.onerror = () => resolve();
        qrImg.src = qrUrl;
      });
      if (qrImg.complete && qrImg.naturalWidth > 0) {
        ctx.drawImage(qrImg, W / 2 - 40, 690, 80, 80);
      }

      // Right: Signature
      ctx.textAlign = "right";
      ctx.fillStyle = "#6b7b8d";
      ctx.font = "11px 'Oswald', sans-serif";
      ctx.fillText("SIGNATURE NUMÉRIQUE", W - 100, 700);
      ctx.fillStyle = "#1a5276";
      ctx.font = "italic 24px 'Oswald', serif";
      ctx.fillText("SkillFlash Certi", W - 100, 735);

      // ===== BOTTOM BLUE ACCENT BAR =====
      ctx.fillStyle = "#1a5276";
      ctx.fillRect(30, H - 38, W - 60, 8);

      // ===== FOOTER TEXT =====
      ctx.textAlign = "center";
      ctx.fillStyle = "#a0aec0";
      ctx.font = "10px 'Oswald', sans-serif";
      ctx.fillText("SkillFlash Academy — Innovation béninoise 🇧🇯 — Ce certificat est vérifiable en ligne", W / 2, H - 48);

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
              <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500" />
            ) : (
              <XCircle className="mx-auto h-16 w-16 text-destructive" />
            )}

            <h1 className="mt-4 font-display text-2xl font-bold text-foreground">
              {isValid ? "Certificat vérifié ✅" : "Certificat non trouvé ❌"}
            </h1>

            {isValid && (
              <>
                {/* Certificate Preview Card */}
                <div className="mt-6 overflow-hidden rounded-lg border-2 border-[#1a5276]/20 bg-white p-6 shadow-inner">
                  <p className="text-xs font-semibold tracking-[0.2em] text-[#6b7b8d]">
                    DOCUMENT OFFICIEL
                  </p>
                  <p
                    className="mt-1 text-xl font-bold italic text-[#1a5276]"
                    style={{ fontFamily: "'Oswald', sans-serif" }}
                  >
                    CERTIFICAT DE RÉUSSITE
                  </p>
                  <div className="mx-auto my-3 h-px w-40 bg-[#c8dae8]" />
                  <p className="text-xs text-[#6b7b8d]">Ce document atteste que</p>
                  <p
                    className="mt-1 text-lg font-bold uppercase tracking-wide text-[#1a3c5a]"
                    style={{ fontFamily: "'Oswald', sans-serif" }}
                  >
                    {cert.profileName}
                  </p>
                  <p className="mt-2 text-xs text-[#6b7b8d]">a complété avec succès</p>
                  <p
                    className="mt-1 text-base font-bold uppercase text-[#1a3c5a]"
                    style={{ fontFamily: "'Unbounded', sans-serif" }}
                  >
                    {(cert.courses as any)?.title}
                  </p>
                  <p className="mt-3 text-2xl font-bold text-[#1a5276]">
                    {Math.round(cert.score)}%
                  </p>
                </div>

                <div className="mt-6 space-y-3 text-left">
                  <div className="flex justify-between border-b border-border py-3">
                    <span className="text-sm text-muted-foreground">Date de délivrance</span>
                    <span className="text-sm font-medium text-foreground">
                      {new Date(cert.created_at).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="text-sm text-muted-foreground">Code de vérification</span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {cert.verification_code}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  <button
                    onClick={downloadCertificate}
                    disabled={downloading}
                    className="flex items-center justify-center gap-2 rounded-lg bg-[#1a5276] p-3 text-sm font-semibold text-white transition-colors hover:bg-[#1a5276]/90 disabled:opacity-50"
                  >
                    {downloading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    Télécharger le certificat (PNG)
                  </button>
                  <div className="flex items-center justify-center gap-2 rounded-lg bg-[#1a5276]/10 p-3 text-sm text-[#1a5276]">
                    <Award className="h-4 w-4" /> Délivré par SkillFlash Academy
                  </div>
                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-lg border border-border p-3 text-sm text-muted-foreground transition-colors hover:border-[#1a5276]/40 hover:text-[#1a5276]"
                  >
                    <ExternalLink className="h-4 w-4" /> Ajouter à LinkedIn
                  </a>
                </div>
              </>
            )}

            {!isValid && (
              <p className="mt-4 text-sm text-muted-foreground">
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
