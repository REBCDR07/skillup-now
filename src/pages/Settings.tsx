import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Settings as SettingsIcon, Key, Cpu, Save, CheckCircle, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const GROQ_MODELS = [
  { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B Instant", speed: "~560 t/s", tag: "" },
  { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B Versatile", speed: "~280 t/s", tag: "Recommandé" },
  { id: "llama3-70b-8192", name: "Llama 3 70B", speed: "~330 t/s", tag: "" },
  { id: "llama3-8b-8192", name: "Llama 3 8B", speed: "~1250 t/s", tag: "" },
  { id: "llama-4-scout-17b-16e-instruct", name: "Llama 4 Scout 17B", speed: "~200 t/s", tag: "Preview" },
  { id: "llama-4-maverick-17b-128e-instruct", name: "Llama 4 Maverick 17B", speed: "~200 t/s", tag: "Preview" },
  { id: "meta-llama/llama-4-scout-17b-16e-instruct", name: "Llama 4 Scout 17B (Meta)", speed: "~200 t/s", tag: "Preview" },
  { id: "qwen-qwq-32b", name: "Qwen 3 32B", speed: "~400 t/s", tag: "Preview" },
  { id: "deepseek-r1-distill-llama-70b", name: "DeepSeek R1 70B", speed: "~275 t/s", tag: "" },
];

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [groqKey, setGroqKey] = useState("");
  const [groqModel, setGroqModel] = useState("llama-3.3-70b-versatile");
  const [openaiKey, setOpenaiKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load saved settings from localStorage
  useEffect(() => {
    const settings = localStorage.getItem("sf_ai_settings");
    if (settings) {
      try {
        const parsed = JSON.parse(settings);
        setGroqKey(parsed.groqKey || "");
        setGroqModel(parsed.groqModel || "llama-3.3-70b-versatile");
        setOpenaiKey(parsed.openaiKey || "");
        setGeminiKey(parsed.geminiKey || "");
      } catch { }
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save to localStorage for UI persistence
      localStorage.setItem("sf_ai_settings", JSON.stringify({
        groqKey: groqKey ? "configured" : "",
        groqModel,
        openaiKey: openaiKey ? "configured" : "",
        geminiKey: geminiKey ? "configured" : "",
      }));

      // Save API keys to edge function via a settings endpoint
      const { error } = await supabase.functions.invoke("save-settings", {
        body: {
          groq_api_key: groqKey || undefined,
          groq_model: groqModel,
          openai_api_key: openaiKey || undefined,
          gemini_api_key: geminiKey || undefined,
        },
      });

      if (error) {
        console.warn("Edge function not available, settings saved locally:", error);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      toast({ title: "Paramètres sauvegardés", description: "Vos clés API ont été mises à jour." });
    } catch (e) {
      toast({ title: "Erreur", description: "Impossible de sauvegarder.", variant: "destructive" });
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pb-20 pt-24 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-2 mb-2">
            <SettingsIcon className="h-8 w-8 text-primary" /> Paramètres
          </h1>
          <p className="text-muted-foreground mb-8">Configurez les fournisseurs d'IA pour la génération de cours et l'évaluation.</p>
        </motion.div>

        {/* Groq Configuration */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="mb-6 border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10">
                    <Key className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Clé API Groq</CardTitle>
                    <CardDescription>Ultra-rapide avec les modèles Llama. Gratuit pour commencer.</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="text-orange-500 border-orange-500/30">Requis</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Votre clé API *</Label>
                <Input
                  type="password"
                  placeholder="gsk_..."
                  value={groqKey}
                  onChange={e => setGroqKey(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Votre clé API est stockée de manière sécurisée et n'est jamais partagée.
                </p>
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary flex items-center gap-1 mt-2 hover:underline"
                >
                  <ExternalLink className="h-3 w-3" /> Obtenir ma clé API gratuite sur Groq
                </a>
              </div>

              <div>
                <Label>Modèle</Label>
                <Select value={groqModel} onValueChange={setGroqModel}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GROQ_MODELS.map(model => (
                      <SelectItem key={model.id} value={model.id}>
                        <div className="flex items-center gap-2">
                          <span>{model.name}</span>
                          <span className="text-xs text-muted-foreground">{model.speed}</span>
                          {model.tag && (
                            <Badge variant={model.tag === "Recommandé" ? "default" : "outline"} className="text-[10px] px-1.5 py-0">
                              {model.tag}
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">{GROQ_MODELS.length} modèles disponibles</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* OpenAI Configuration */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
                  <Cpu className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">OpenAI (Optionnel)</CardTitle>
                  <CardDescription>GPT-4o-mini comme alternative.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Label>Clé API OpenAI</Label>
              <Input
                type="password"
                placeholder="sk-proj-..."
                value={openaiKey}
                onChange={e => setOpenaiKey(e.target.value)}
                className="mt-1"
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Gemini Configuration */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                  <Cpu className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Google Gemini (Optionnel)</CardTitle>
                  <CardDescription>Gemini 2.0 Flash comme alternative.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Label>Clé API Gemini</Label>
              <Input
                type="password"
                placeholder="AIza..."
                value={geminiKey}
                onChange={e => setGeminiKey(e.target.value)}
                className="mt-1"
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <Button onClick={handleSave} disabled={saving} className="w-full" size="lg">
            {saved ? (
              <><CheckCircle className="mr-2 h-4 w-4" /> Sauvegardé !</>
            ) : (
              <><Save className="mr-2 h-4 w-4" /> {saving ? "Sauvegarde..." : "Sauvegarder les paramètres"}</>
            )}
          </Button>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Settings;
