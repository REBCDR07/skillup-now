export const courses = [
  { id: "html", title: "HTML & CSS", level: "Débutant", description: "Maîtrisez les fondamentaux du web avec HTML5 et CSS3. Créez des pages web modernes et responsives.", duration: "4h", skills: ["HTML5", "CSS3", "Responsive Design", "Sémantique Web"], modules: 10, icon: "🌐" },
  { id: "python", title: "Python", level: "Intermédiaire", description: "Apprenez Python de A à Z. Automatisation, data science et développement backend.", duration: "6h", skills: ["Python 3", "Algorithmes", "POO", "Data Science"], modules: 10, icon: "🐍" },
  { id: "react", title: "React.js", level: "Intermédiaire", description: "Construisez des interfaces modernes avec React. Components, hooks et state management.", duration: "5h", skills: ["React", "Hooks", "JSX", "State Management"], modules: 10, icon: "⚛️" },
  { id: "management", title: "Management", level: "Débutant", description: "Leadership et gestion d'équipe. Apprenez à diriger des projets et motiver vos équipes.", duration: "3h", skills: ["Leadership", "Communication", "Gestion de projet", "Agilité"], modules: 10, icon: "📊" },
  { id: "javascript", title: "JavaScript Avancé", level: "Avancé", description: "Plongez dans les concepts avancés de JavaScript : closures, prototypes, async/await.", duration: "7h", skills: ["ES6+", "Async", "Design Patterns", "Performance"], modules: 10, icon: "⚡" },
  { id: "devops", title: "DevOps & CI/CD", level: "Avancé", description: "Automatisez le déploiement et la livraison continue. Docker, GitHub Actions et plus.", duration: "5h", skills: ["Docker", "CI/CD", "Linux", "Cloud"], modules: 10, icon: "🚀" },
  { id: "sql", title: "SQL & Bases de données", level: "Débutant", description: "Maîtrisez SQL pour interroger, manipuler et optimiser vos bases de données relationnelles.", duration: "5h", skills: ["SQL", "PostgreSQL", "Requêtes", "Modélisation"], modules: 10, icon: "🗄️" },
  { id: "typescript", title: "TypeScript", level: "Intermédiaire", description: "Ajoutez le typage statique à JavaScript pour du code plus robuste et maintenable.", duration: "5h", skills: ["TypeScript", "Types", "Generics", "Interfaces"], modules: 10, icon: "🔷" },
  { id: "nodejs", title: "Node.js & Express", level: "Intermédiaire", description: "Construisez des APIs REST performantes avec Node.js et le framework Express.", duration: "6h", skills: ["Node.js", "Express", "REST API", "Middleware"], modules: 10, icon: "🟢" },
  { id: "git", title: "Git & GitHub", level: "Débutant", description: "Versionnez votre code et collaborez efficacement avec Git et GitHub.", duration: "3h", skills: ["Git", "GitHub", "Branches", "Pull Requests"], modules: 10, icon: "🔀" },
  { id: "flutter", title: "Flutter & Dart", level: "Intermédiaire", description: "Créez des applications mobiles cross-platform élégantes avec Flutter.", duration: "7h", skills: ["Flutter", "Dart", "Widgets", "Mobile"], modules: 10, icon: "📱" },
  { id: "ia", title: "Intelligence Artificielle", level: "Avancé", description: "Découvrez le machine learning, les réseaux de neurones et le deep learning.", duration: "8h", skills: ["ML", "Deep Learning", "TensorFlow", "NLP"], modules: 10, icon: "🧠" },
  { id: "cybersecurity", title: "Cybersécurité", level: "Avancé", description: "Protégez les systèmes informatiques contre les menaces et vulnérabilités.", duration: "6h", skills: ["Sécurité", "Cryptographie", "Pentest", "OWASP"], modules: 10, icon: "🔐" },
  { id: "figma", title: "Design UI/UX avec Figma", level: "Débutant", description: "Concevez des interfaces utilisateur modernes et des expériences mémorables.", duration: "4h", skills: ["Figma", "UI Design", "Prototypage", "UX"], modules: 10, icon: "🎨" },
  { id: "data-science", title: "Data Science & Analytics", level: "Intermédiaire", description: "Analysez les données, créez des visualisations et prenez des décisions data-driven.", duration: "6h", skills: ["Pandas", "Matplotlib", "Statistiques", "Jupyter"], modules: 10, icon: "📊" },
  { id: "blockchain", title: "Blockchain & Web3", level: "Avancé", description: "Comprenez la blockchain, les smart contracts et le développement Web3.", duration: "7h", skills: ["Blockchain", "Solidity", "Smart Contracts", "DeFi"], modules: 10, icon: "⛓️" },
];

export const leaderboard = [
  { rank: 1, name: "Kofi Adjovi", points: 4850, badges: 12, avatar: "KA", courses: 8 },
  { rank: 2, name: "Amina Bello", points: 4200, badges: 10, avatar: "AB", courses: 7 },
  { rank: 3, name: "Sékou Dossou", points: 3900, badges: 9, avatar: "SD", courses: 6 },
  { rank: 4, name: "Fatimatou Yao", points: 3600, badges: 8, avatar: "FY", courses: 6 },
  { rank: 5, name: "Hervé Ganvo", points: 3100, badges: 7, avatar: "HG", courses: 5 },
  { rank: 6, name: "Rachida Akpo", points: 2800, badges: 6, avatar: "RA", courses: 5 },
  { rank: 7, name: "Landry Hounsa", points: 2500, badges: 5, avatar: "LH", courses: 4 },
  { rank: 8, name: "Estelle Agbo", points: 2200, badges: 5, avatar: "EA", courses: 4 },
];

export const mockModules = [
  { id: 1, title: "Introduction et fondamentaux", completed: true },
  { id: 2, title: "Structure et syntaxe de base", completed: true },
  { id: 3, title: "Variables et types de données", completed: true },
  { id: 4, title: "Structures de contrôle", completed: false },
  { id: 5, title: "Fonctions et modularité", completed: false },
  { id: 6, title: "Manipulation de données", completed: false },
  { id: 7, title: "Concepts avancés", completed: false },
  { id: 8, title: "Projet pratique I", completed: false },
  { id: 9, title: "Projet pratique II", completed: false },
  { id: 10, title: "Révision et certification", completed: false },
];
