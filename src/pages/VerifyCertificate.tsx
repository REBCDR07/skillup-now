import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle2, XCircle, Award, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";

const VerifyCertificate = () => {
  const { certificateId } = useParams();
  const [cert, setCert] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background"><Navbar />
        <div className="flex min-h-screen items-center justify-center"><p className="text-muted-foreground">Vérification...</p></div>
      </div>
    );
  }

  const isValid = !!cert;

  // LinkedIn URL
  const linkedinUrl = cert ? `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent((cert.courses as any)?.title || 'SkillFlash')}&organizationName=SkillFlash&certUrl=${encodeURIComponent(window.location.href)}&certId=${encodeURIComponent(cert.verification_code)}` : "";

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
