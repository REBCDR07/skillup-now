// Mapping course slugs to devicon CDN URLs for real tech icons
const iconMap: Record<string, string> = {
  // Web fundamentals
  html: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
  css: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg",

  // Languages
  python: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
  javascript: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
  typescript: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
  java: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg",
  csharp: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg",
  cpp: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg",
  rust: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rust/rust-original.svg",
  go: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg",
  php: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg",
  swift: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swift/swift-original.svg",
  kotlin: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kotlin/kotlin-original.svg",
  ruby: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ruby/ruby-original.svg",

  // Frameworks
  react: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
  nextjs: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg",
  vuejs: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg",
  angular: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg",
  svelte: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/svelte/svelte-original.svg",
  nodejs: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
  django: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg",
  laravel: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/laravel/laravel-original.svg",
  spring: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg",
  flutter: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flutter/flutter-original.svg",
  "react-native": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",

  // Tools & DevOps
  git: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg",
  docker: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",
  devops: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",
  kubernetes: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-original.svg",
  aws: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg",
  azure: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg",
  linux: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg",
  terraform: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/terraform/terraform-original.svg",

  // Databases
  sql: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg",
  mongodb: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg",
  redis: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg",
  firebase: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg",

  // Design
  figma: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg",

  // Data & AI
  ia: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg",
  "data-science": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pandas/pandas-original.svg",
  "machine-learning": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pytorch/pytorch-original.svg",

  // Security & Blockchain
  cybersecurity: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg",
  blockchain: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/solidity/solidity-original.svg",

  // Management & Agile
  management: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jira/jira-original.svg",

  // Other
  tailwindcss: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg",
  graphql: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/graphql/graphql-plain.svg",
  wordpress: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/wordpress/wordpress-original.svg",
};

export const getCourseIcon = (slug: string): string | null => {
  return iconMap[slug] || null;
};
