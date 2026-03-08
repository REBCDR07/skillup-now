
INSERT INTO public.courses (slug, title, description, level, skills, duration, icon) VALUES
  ('java', 'Java', 'Maîtrisez Java, le langage de prédilection pour les applications d''entreprise et Android.', 'Intermédiaire', ARRAY['Java', 'POO', 'Collections', 'Spring Boot'], '8h', '☕'),
  ('csharp', 'C# & .NET', 'Développez des applications Windows, web et jeux vidéo avec C# et le framework .NET.', 'Intermédiaire', ARRAY['C#', '.NET', 'LINQ', 'Entity Framework'], '7h', '🟣'),
  ('go', 'Go (Golang)', 'Apprenez Go, le langage performant de Google pour les microservices et le cloud.', 'Intermédiaire', ARRAY['Go', 'Goroutines', 'Concurrence', 'Microservices'], '5h', '🐹'),
  ('rust', 'Rust', 'Programmation système sécurisée avec Rust : mémoire safe, performances maximales.', 'Avancé', ARRAY['Rust', 'Ownership', 'Concurrence', 'WebAssembly'], '8h', '🦀'),
  ('php', 'PHP & Laravel', 'Créez des applications web dynamiques avec PHP et le framework Laravel.', 'Intermédiaire', ARRAY['PHP 8', 'Laravel', 'Eloquent', 'Blade'], '6h', '🐘'),
  ('swift', 'Swift & iOS', 'Développez des applications iOS natives avec Swift et SwiftUI.', 'Intermédiaire', ARRAY['Swift', 'SwiftUI', 'UIKit', 'Xcode'], '7h', '🍎'),
  ('kotlin', 'Kotlin & Android', 'Créez des applications Android modernes avec Kotlin et Jetpack Compose.', 'Intermédiaire', ARRAY['Kotlin', 'Jetpack Compose', 'Android Studio', 'Material 3'], '7h', '🤖'),
  ('docker', 'Docker & Conteneurs', 'Maîtrisez la conteneurisation avec Docker. Images, volumes et orchestration.', 'Intermédiaire', ARRAY['Docker', 'Docker Compose', 'Volumes', 'Networking'], '4h', '🐳'),
  ('kubernetes', 'Kubernetes', 'Orchestrez vos conteneurs à grande échelle avec Kubernetes en production.', 'Avancé', ARRAY['Kubernetes', 'Pods', 'Services', 'Helm'], '6h', '☸️'),
  ('aws', 'AWS Cloud', 'Déployez et gérez des infrastructures cloud avec Amazon Web Services.', 'Avancé', ARRAY['EC2', 'S3', 'Lambda', 'CloudFormation'], '8h', '☁️'),
  ('mongodb', 'MongoDB & NoSQL', 'Maîtrisez les bases de données NoSQL avec MongoDB. Agrégations et indexation.', 'Intermédiaire', ARRAY['MongoDB', 'NoSQL', 'Agrégation', 'Atlas'], '5h', '🍃'),
  ('graphql', 'GraphQL', 'API modernes avec GraphQL : requêtes flexibles, mutations et subscriptions.', 'Intermédiaire', ARRAY['GraphQL', 'Apollo', 'Schemas', 'Resolvers'], '4h', '◆'),
  ('tailwindcss', 'Tailwind CSS', 'Créez des interfaces élégantes et rapides avec le framework CSS utility-first.', 'Débutant', ARRAY['Tailwind CSS', 'Responsive', 'Components', 'Animations'], '3h', '🎨'),
  ('nextjs', 'Next.js', 'Framework React full-stack : SSR, SSG, API routes et App Router.', 'Avancé', ARRAY['Next.js', 'SSR', 'App Router', 'Server Components'], '6h', '▲'),
  ('linux', 'Linux & Administration', 'Administrez des serveurs Linux : ligne de commande, scripts et sécurité.', 'Intermédiaire', ARRAY['Linux', 'Bash', 'Shell Scripts', 'Administration'], '5h', '🐧'),
  ('machine-learning', 'Machine Learning avec PyTorch', 'Créez des modèles ML avancés avec PyTorch : CNN, RNN et Transformers.', 'Avancé', ARRAY['PyTorch', 'CNN', 'RNN', 'Transformers'], '9h', '🔥'),
  ('ruby', 'Ruby on Rails', 'Développez des applications web rapidement avec Ruby on Rails.', 'Intermédiaire', ARRAY['Ruby', 'Rails', 'ActiveRecord', 'MVC'], '5h', '💎'),
  ('vuejs', 'Vue.js', 'Construisez des interfaces réactives avec Vue.js 3 et la Composition API.', 'Intermédiaire', ARRAY['Vue.js 3', 'Composition API', 'Pinia', 'Vuetify'], '5h', '💚'),
  ('wordpress', 'WordPress', 'Créez des sites web professionnels sans coder avec WordPress et ses plugins.', 'Débutant', ARRAY['WordPress', 'Thèmes', 'Plugins', 'WooCommerce'], '3h', '📝'),
  ('angular', 'Angular', 'Framework complet de Google pour des applications d''entreprise robustes.', 'Intermédiaire', ARRAY['Angular', 'RxJS', 'Services', 'Modules'], '7h', '🅰️')
ON CONFLICT (slug) DO NOTHING;
