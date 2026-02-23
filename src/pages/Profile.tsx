import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Camera, Save, Award, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { navigate("/auth"); return; }
    if (user) fetchProfile();
  }, [user, authLoading]);

  const fetchProfile = async () => {
    const [profileRes, certsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user!.id).single(),
      supabase.from("certificates").select("*, courses(title, slug)").eq("user_id", user!.id),
    ]);
    if (profileRes.data) {
      setProfile(profileRes.data);
      setName(profileRes.data.name || "");
      setBio(profileRes.data.bio || "");
    }
    if (certsRes.data) setCertificates(certsRes.data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ name, bio }).eq("user_id", user.id);
    if (error) toast.error("Erreur de sauvegarde");
    else { toast.success("Profil mis à jour !"); setProfile({ ...profile, name, bio }); }
    setSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    // Upload to a simple data URL approach since no storage bucket is set up
    const reader = new FileReader();
    reader.onload = async () => {
      const avatarUrl = reader.result as string;
      const { error } = await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("user_id", user.id);
      if (error) toast.error("Erreur upload");
      else {
        toast.success("Photo mise à jour !");
        setProfile({ ...profile, avatar_url: avatarUrl });
      }
    };
    reader.readAsDataURL(file);
  };

  if (authLoading || loading) return <div className="flex min-h-screen items-center justify-center bg-background"><p className="text-muted-foreground">Chargement...</p></div>;
  if (!user) return null;

  const initials = (profile?.name || user.email || "?").substring(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-2xl px-4 pb-20 pt-24">
        <h1 className="mb-8 font-display text-3xl font-bold text-foreground">Mon Profil</h1>

        <div className="rounded-xl border border-border bg-card p-6">
          {/* Avatar */}
          <div className="flex flex-col items-center">
            <div className="relative">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="h-24 w-24 rounded-full border-2 border-primary object-cover" />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 font-display text-3xl font-bold text-primary">
                  {initials}
                </div>
              )}
              <label className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                <Camera className="h-4 w-4" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </label>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{user.email}</p>
          </div>

          {/* Edit form */}
          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Nom complet</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Votre nom"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Parlez un peu de vous..."
              />
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Enregistrer
            </button>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4 border-t border-border pt-6">
            <div className="text-center">
              <p className="font-display text-xl font-bold text-foreground">{profile?.points || 0}</p>
              <p className="text-xs text-muted-foreground">Points</p>
            </div>
            <div className="text-center">
              <p className="font-display text-xl font-bold text-foreground">{profile?.badges?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Badges</p>
            </div>
            <div className="text-center">
              <p className="font-display text-xl font-bold text-foreground">{certificates.length}</p>
              <p className="text-xs text-muted-foreground">Certificats</p>
            </div>
          </div>
        </div>

        {/* Badges */}
        {profile?.badges?.length > 0 && (
          <div className="mt-6 rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 font-display text-lg font-bold text-foreground">🏅 Badges</h2>
            <div className="flex flex-wrap gap-2">
              {profile.badges.map((badge: string, i: number) => (
                <span key={i} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {badge}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Certifications history */}
        {certificates.length > 0 && (
          <div className="mt-6 rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 font-display text-lg font-bold text-foreground">🏆 Certifications</h2>
            <div className="space-y-3">
              {certificates.map((cert) => (
                <div key={cert.id} className="flex items-center justify-between rounded-lg border border-border bg-background p-4">
                  <div>
                    <p className="font-medium text-foreground">{(cert.courses as any)?.title}</p>
                    <p className="text-xs text-muted-foreground">{new Date(cert.created_at).toLocaleDateString("fr-FR")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    <span className="font-display text-sm font-bold text-primary">{Math.round(cert.score)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
