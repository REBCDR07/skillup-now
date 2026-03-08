import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Shield, Users, BookOpen, Award, TrendingUp, Lock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ADMIN_PASSWORD = "SkillFlash2026";

const Admin = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setError("");
      sessionStorage.setItem("sf_admin", "1");
    } else {
      setError("Mot de passe incorrect");
    }
  };

  useEffect(() => {
    if (sessionStorage.getItem("sf_admin") === "1") {
      setAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    setLoading(true);
    Promise.all([
      supabase.from("profiles").select("*").order("points", { ascending: false }),
      supabase.from("courses").select("*"),
      supabase.from("certificates").select("*"),
      supabase.from("user_module_progress").select("*"),
      supabase.from("results").select("*"),
    ]).then(([profilesRes, coursesRes, certsRes, progressRes, resultsRes]) => {
      setUsers(profilesRes.data || []);
      setCourses(coursesRes.data || []);
      setCertificates(certsRes.data || []);
      setProgress(progressRes.data || []);
      setResults(resultsRes.data || []);
      setLoading(false);
    });
  }, [authenticated]);

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="w-[380px]">
            <CardHeader className="text-center">
              <Lock className="mx-auto h-10 w-10 text-primary mb-2" />
              <CardTitle className="font-display text-xl">Administration SkillFlash</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  type="password"
                  placeholder="Mot de passe admin"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full">Accéder</Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const getUserCourseProgress = (userId: string) => {
    const userProgress = progress.filter(p => p.user_id === userId && p.completed);
    return userProgress.length;
  };

  const getUserCertCount = (userId: string) => {
    return certificates.filter(c => c.user_id === userId).length;
  };

  const getUserAvgScore = (userId: string) => {
    const userResults = results.filter(r => r.user_id === userId);
    if (userResults.length === 0) return 0;
    return Math.round(userResults.reduce((a, b) => a + Number(b.score), 0) / userResults.length);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pb-20 pt-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-2">
                <Shield className="h-8 w-8 text-primary" /> Panel Admin
              </h1>
              <p className="text-muted-foreground mt-1">Gérez votre plateforme SkillFlash</p>
            </div>
            <Button variant="outline" onClick={() => { sessionStorage.removeItem("sf_admin"); setAuthenticated(false); }}>
              Déconnexion
            </Button>
          </div>
        </motion.div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Inscrits", value: users.length, icon: Users, color: "text-primary" },
            { label: "Cours", value: courses.length, icon: BookOpen, color: "text-secondary" },
            { label: "Certifications", value: certificates.length, icon: Award, color: "text-green-500" },
            { label: "Score moyen", value: results.length > 0 ? Math.round(results.reduce((a, b) => a + Number(b.score), 0) / results.length) + "%" : "N/A", icon: TrendingUp, color: "text-orange-500" },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  <div>
                    <p className="text-2xl font-bold font-display text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground py-12">Chargement...</div>
        ) : (
          <Tabs defaultValue="users">
            <TabsList className="mb-4">
              <TabsTrigger value="users">Utilisateurs ({users.length})</TabsTrigger>
              <TabsTrigger value="courses">Cours ({courses.length})</TabsTrigger>
              <TabsTrigger value="certs">Certifications ({certificates.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Points</TableHead>
                        <TableHead>Modules complétés</TableHead>
                        <TableHead>Certifications</TableHead>
                        <TableHead>Score moyen</TableHead>
                        <TableHead>Badges</TableHead>
                        <TableHead>Inscription</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map(user => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name || "Anonyme"}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{user.points} pts</Badge>
                          </TableCell>
                          <TableCell>{getUserCourseProgress(user.user_id)}</TableCell>
                          <TableCell>{getUserCertCount(user.user_id)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={getUserAvgScore(user.user_id)} className="w-16 h-2" />
                              <span className="text-xs">{getUserAvgScore(user.user_id)}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              {(user.badges || []).map((b: string, i: number) => (
                                <Badge key={i} variant="outline" className="text-xs">{b}</Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(user.created_at).toLocaleDateString("fr-FR")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="courses">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Titre</TableHead>
                        <TableHead>Niveau</TableHead>
                        <TableHead>Durée</TableHead>
                        <TableHead>Inscrits actifs</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courses.map(course => (
                        <TableRow key={course.id}>
                          <TableCell className="font-medium">{course.title}</TableCell>
                          <TableCell><Badge>{course.level}</Badge></TableCell>
                          <TableCell>{course.duration}</TableCell>
                          <TableCell>{progress.filter(p => p.course_id === course.id).length}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="certs">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Utilisateur</TableHead>
                        <TableHead>Cours</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {certificates.map(cert => {
                        const user = users.find(u => u.user_id === cert.user_id);
                        const course = courses.find(c => c.id === cert.course_id);
                        return (
                          <TableRow key={cert.id}>
                            <TableCell>{user?.name || "Inconnu"}</TableCell>
                            <TableCell>{course?.title || "N/A"}</TableCell>
                            <TableCell><Badge variant="secondary">{Math.round(cert.score)}%</Badge></TableCell>
                            <TableCell className="font-mono text-xs">{cert.verification_code}</TableCell>
                            <TableCell className="text-xs">{new Date(cert.created_at).toLocaleDateString("fr-FR")}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Admin;
