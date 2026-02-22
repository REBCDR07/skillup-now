import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle2, XCircle, Award, ExternalLink, Download, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";

const VerifyCertificate = () => {
  const { certificateId } = useParams();
  const [cert, setCert] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  const downloadCertificate = async () => {
    if (!cert) return;
    setDownloading(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 850;
      const ctx = canvas.getContext("2d")!;

      // Background
      ctx.fillStyle = "#0a0a0b";
      ctx.fillRect(0, 0, 1200, 850);

      // Border
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 3;
      ctx.strokeRect(30, 30, 1140, 790);

      // Inner border
      ctx.strokeStyle = "#1a1a1e";
      ctx.lineWidth = 1;
      ctx.strokeRect(45, 45, 1110, 760);

      // Top accent line
      const gradient = ctx.createLinearGradient(100, 0, 1100, 0);
      gradient.addColorStop(0, "#10b981");
      gradient.addColorStop(1, "#f59e0b");
      ctx.fillStyle = gradient;
      ctx.fillRect(100, 60, 1000, 4);

      // Logo
      ctx.fillStyle = "#10b981";
      ctx.fillRect(530, 90, 50, 50);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 28px Arial";
      ctx.textAlign = "center";
      ctx.fillText("S", 555, 125);

      // Title
      ctx.fillStyle = "#e4e4e7";
      ctx.font = "bold 20px Arial";
      ctx.fillText("SkillFlash", 600, 175);

      // Certificate text
      ctx.fillStyle = "#71717a";
      ctx.font = "16px Arial";
      ctx.fillText("CERTIFICAT DE RÉUSSITE", 600, 220);

      // Divider
      ctx.fillStyle = "#27272a";
      ctx.fillRect(400, 240, 400, 1);

      // Name
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 40px Arial";
      ctx.fillText(cert.profileName, 600, 310);

      // Awarded text
      ctx.fillStyle = "#a1a1aa";
      ctx.font = "16px Arial";
      ctx.fillText("a complété avec succès la certification", 600, 360);

      // Course title
      ctx.fillStyle = "#10b981";
      ctx.font = "bold 32px Arial";
      ctx.fillText((cert.courses as any)?.title || "Cours", 600, 420);

      // Score
      ctx.fillStyle = "#f59e0b";
      ctx.font = "bold 48px Arial";
      ctx.fillText(`${Math.round(cert.score)}%`, 600, 500);
      ctx.fillStyle = "#71717a";
      ctx.font = "14px Arial";
      ctx.fillText("Score final", 600, 525);

      // Bottom divider
      ctx.fillStyle = "#27272a";
      ctx.fillRect(200, 560, 800, 1);

      // Date and ID
      const date = new Date(cert.created_at).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });
      ctx.fillStyle = "#a1a1aa";
      ctx.font = "14px Arial";
      ctx.textAlign = "left";
      ctx.fillText(`Date : ${date}`, 100, 610);
      ctx.fillText(`ID : ${cert.verification_code}`, 100, 640);

      // QR Code
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(window.location.href)}&bgcolor=0a0a0b&color=10b981`;
      const qrImg = new Image();
      qrImg.crossOrigin = "anonymous";
      await new Promise<void>((resolve) => {
        qrImg.onload = () => resolve();
        qrImg.onerror = () => resolve();
        qrImg.src = qrUrl;
      });
      if (qrImg.complete && qrImg.naturalWidth > 0) {
        ctx.drawImage(qrImg, 980, 580, 120, 120);
        ctx.fillStyle = "#71717a";
        ctx.font = "10px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Scanner pour vérifier", 1040, 715);
      }

      // Footer
      ctx.fillStyle = "#52525b";
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Délivré par SkillFlash — Innovation béninoise 🇧🇯 — skillflash.lovable.app", 600, 780);

      // Bottom accent
      ctx.fillStyle = gradient;
      ctx.fillRect(100, 800, 1000, 4);

      // Download
      const link = document.createElement("a");
      link.download = `SkillFlash-Certificat-${cert.verification_code}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error("Download error:", e);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background"><Navbar />
        <div className="flex min-h-screen items-center justify-center"><p className="text-muted-foreground">Vérification...</p></div>
      </div>
    );
  }

  const isValid = !!cert;
  const linkedinUrl = cert ? `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent((cert.courses as any)?.title || 'SkillFlash')}&organizationName=SkillFlash&certUrl=${encodeURIComponent(window.location.href)}&certId=${encodeURIComponent(cert.verification_code)}` : "";
  const qrCodeUrl = cert ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.href)}&bgcolor=0a0a0b&color=10b981` : "";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex min-h-screen items-center justify-center px-4 pt-16">
        <div className="w-full max-w-lg">
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            {isValid ? (
              <CheckCircle2 className="mx-auto h-16 w-16 text-primary" />
            ) : (
              <XCircle className="mx-auto h-16 w-16 text-destructive" />
            )}

            <h1 className="mt-4 font-display text-2xl font-bold text-foreground">
              {isValid ? "Certificat valide ✅" : "Certificat non trouvé ❌"}
            </h1>

            {isValid && (
              <>
                {/* QR Code */}
                <div className="mt-6 flex justify-center">
                  <img src={qrCodeUrl} alt="QR Code de vérification" className="h-32 w-32 rounded-lg" />
                </div>

                <div className="mt-6 space-y-4 text-left">
                  <div className="flex justify-between border-b border-border py-3">
                    <span className="text-sm text-muted-foreground">Nom</span>
                    <span className="text-sm font-medium text-foreground">{cert.profileName}</span>
                  </div>
                  <div className="flex justify-between border-b border-border py-3">
                    <span className="text-sm text-muted-foreground">Cours</span>
                    <span className="text-sm font-medium text-foreground">{(cert.courses as any)?.title}</span>
                  </div>
                  <div className="flex justify-between border-b border-border py-3">
                    <span className="text-sm text-muted-foreground">Score</span>
                    <span className="text-sm font-medium text-primary">{Math.round(cert.score)}%</span>
                  </div>
                  <div className="flex justify-between border-b border-border py-3">
                    <span className="text-sm text-muted-foreground">Date</span>
                    <span className="text-sm font-medium text-foreground">
                      {new Date(cert.created_at).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}
                    </span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="text-sm text-muted-foreground">ID</span>
                    <span className="font-mono text-xs text-muted-foreground">{cert.verification_code}</span>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  <button onClick={downloadCertificate} disabled={downloading}
                    className="flex items-center justify-center gap-2 rounded-lg bg-primary p-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
                    {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    Télécharger le certificat (PNG)
                  </button>
                  <div className="flex items-center justify-center gap-2 rounded-lg bg-primary/10 p-3 text-sm text-primary">
                    <Award className="h-4 w-4" /> Délivré par SkillFlash
                  </div>
                  <a href={linkedinUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-lg border border-border p-3 text-sm text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors">
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

export default VerifyCertificate;
