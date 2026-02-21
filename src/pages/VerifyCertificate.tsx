import { useParams } from "react-router-dom";
import { CheckCircle2, XCircle, Award, ExternalLink } from "lucide-react";
import Navbar from "@/components/Navbar";

const VerifyCertificate = () => {
  const { certificateId } = useParams();

  // Mock certificate data
  const certificate = {
    id: certificateId || "CERT-PY-2026-001",
    name: "Kofi Adjovi",
    course: "Python",
    score: 92,
    date: "15 Janvier 2026",
    valid: true,
    issuer: "SkillFlash",
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex min-h-screen items-center justify-center px-4 pt-16">
        <div className="w-full max-w-lg">
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            {certificate.valid ? (
              <CheckCircle2 className="mx-auto h-16 w-16 text-primary" />
            ) : (
              <XCircle className="mx-auto h-16 w-16 text-destructive" />
            )}

            <h1 className="mt-4 font-display text-2xl font-bold text-foreground">
              {certificate.valid ? "Certificat valide ✅" : "Certificat invalide ❌"}
            </h1>

            <div className="mt-6 space-y-4 text-left">
              <div className="flex justify-between border-b border-border py-3">
                <span className="text-sm text-muted-foreground">Nom</span>
                <span className="text-sm font-medium text-foreground">{certificate.name}</span>
              </div>
              <div className="flex justify-between border-b border-border py-3">
                <span className="text-sm text-muted-foreground">Cours</span>
                <span className="text-sm font-medium text-foreground">{certificate.course}</span>
              </div>
              <div className="flex justify-between border-b border-border py-3">
                <span className="text-sm text-muted-foreground">Score</span>
                <span className="text-sm font-medium text-primary">{certificate.score}%</span>
              </div>
              <div className="flex justify-between border-b border-border py-3">
                <span className="text-sm text-muted-foreground">Date</span>
                <span className="text-sm font-medium text-foreground">{certificate.date}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-sm text-muted-foreground">ID</span>
                <span className="font-mono text-xs text-muted-foreground">{certificate.id}</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <div className="flex items-center justify-center gap-2 rounded-lg bg-primary/10 p-3 text-sm text-primary">
                <Award className="h-4 w-4" />
                Délivré par {certificate.issuer}
              </div>
              <button className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary">
                <ExternalLink className="h-4 w-4" />
                Ajouter à LinkedIn
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyCertificate;
