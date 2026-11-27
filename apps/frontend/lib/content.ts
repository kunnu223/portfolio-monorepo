/**
 * Everything the homepage says lives here. Facts come from the job-mission profile
 * (switch-mission/app/config/profile.ts) and the current resume: keep them true, and do not add metrics, clients
 * or tools that are not real. Edit this file, rebuild, done.
 */

export const site = {
  name: "Kunal Kumawat",
  shortName: "Kunal",
  role: "Full-stack engineer",
  focus: "AI agents & LLM features",
  location: "Surat, India",
  timeZone: "Asia/Kolkata",
  email: "kunalkumawat223@gmail.com",
  github: "https://github.com/kunnu223",
  linkedin: "https://www.linkedin.com/in/kunal-kumawat-7b99061ba/",
  /** The current resume (copy of switch-mission/resume/Kunal_Kumawat_Resume.pdf); null hides the button. */
  resumeUrl: "/resume.pdf" as string | null,
  available: "Open to full-stack + AI roles",
  relocate: "open to relocating",
  url: "https://portfolio-monorepo-frontend-two.vercel.app",
};

export const hero = {
  kicker: "Full-stack engineer · Node.js & TypeScript",
  lines: [
    [{ t: "I build " }, { t: "AI agents", em: true }],
    [{ t: "that ship to" }],
    [{ t: "production." }],
  ],
  intro:
    "Right now I'm a core developer on a production AI-agents product for sellers on Amazon, Flipkart and Meesho. Before that: two years of restaurant ordering, payments and POS integrations.",
};

export const about = {
  statement:
    "I spent two years shipping restaurant-ordering products wired into payment, POS and loyalty systems. Now I build AI agents that audit and rewrite marketplace listings, with code checks that keep the model honest.",
  facts: [
    { value: "3", label: "AI agents I built, live in production" },
    { value: "5", label: "payment, POS & loyalty integrations" },
    { value: "2.5", label: "years full-time, plus a 6-month internship" },
  ],
  education: "B.Tech, Computer Science & Engineering · Sagar Group of Institutions, Bhopal (RGPV) · 2019–2023",
};

export type Role = {
  period: string;
  title: string;
  company: string;
  where: string;
  summary: string;
  points: string[];
  stack: string[];
};

export const experience: Role[] = [
  {
    period: "Jun 2026 — Now",
    title: "Full Stack Developer",
    company: "AI-agents startup",
    where: "E-commerce · India",
    summary:
      "Core developer of a production AI-agents product for sellers on Amazon, Flipkart and Meesho: Listing Auditor, Listing Optimiser, Market Analysis, Ads Agent and Image Gen Studio.",
    points: [
      "Built the listing audit and optimisation flow: it scores a listing on marketplace-specific checks, then rewrites its copy with an LLM, with code checks that keep the copy to the product's own facts.",
      "Built Portfolio Insights, which compares a seller's products with their category, and the AI-credit wallet that charges each agent run and refunds failed ones.",
      "Made Razorpay subscription billing reliable across NestJS microservices with Kafka.",
    ],
    stack: ["Next.js", "Vercel AI SDK", "Cloudflare Workers", "NestJS", "Kafka"],
  },
  {
    period: "Jun 2024 — Jun 2026",
    title: "MERN Stack Developer",
    company: "Knovator Technologies",
    where: "Surat",
    summary:
      "Owned end-to-end development of SaaS products for restaurant, healthcare and job-board businesses.",
    points: [
      "Integrated Olo Pay, Toast POS, OLO, SpendGo and Punchh, with idempotency keys and webhook-driven reconciliation so a retried request never charges twice.",
      "Built admin panels for ICAI and for iCall, the mental-health helpline of TISS.",
      "Secure REST APIs with JWT auth, input validation and role-based access, plus 20+ reusable React / Next.js components for ordering and admin dashboards.",
      "Sped up slow APIs by tuning MongoDB aggregation pipelines and compound indexes; designed relational schemas in Directus CMS (MySQL / PostgreSQL).",
    ],
    stack: ["Node.js", "TypeScript", "React", "Next.js", "MongoDB", "Directus"],
  },
  {
    period: "Aug 2023 — Feb 2024",
    title: "React Developer (Intern)",
    company: "Infogram",
    where: "Ratlam",
    summary: "Responsive React apps, global state with Redux and Context, reusable UI components.",
    points: [],
    stack: ["React", "Redux", "JavaScript"],
  },
];

export type Work = {
  index: string;
  title: string;
  kind: string;
  year: string;
  problem: string;
  built: string[];
  stack: string[];
  visual: "agents" | "billing" | "integrations" | "admin";
};

export const work: Work[] = [
  {
    index: "01",
    title: "AI agents for marketplace sellers",
    kind: "Production · AI",
    year: "2026",
    problem:
      "Sellers on Amazon, Flipkart and Meesho lose sales to weak listings, and every marketplace grades them differently.",
    built: [
      "Listing Auditor: scores a listing on marketplace-specific checks.",
      "Listing Optimiser: rewrites the copy with an LLM; code checks keep the rewrite to the product's own facts.",
      "Portfolio Insights (market analysis): compares a seller's products with their category.",
    ],
    stack: ["Next.js", "Vercel AI SDK", "Cloudflare Workers", "OpenAI", "Anthropic", "Gemini"],
    visual: "agents",
  },
  {
    index: "02",
    title: "Billing that stays in order",
    kind: "Production · Payments",
    year: "2026",
    problem:
      "Razorpay subscription webhooks can arrive late or out of order, and a wrong order means a wrong subscription state.",
    built: [
      "Webhook events go through Kafka keyed by subscription, so each subscription's events are processed in order.",
      "Each state change commits in one database transaction; late events are judged by event time.",
      "An AI-credit wallet charges every agent run and refunds the failed ones.",
    ],
    stack: ["NestJS", "Microservices", "Kafka", "Razorpay"],
    visual: "billing",
  },
  {
    index: "03",
    title: "Restaurant ordering, wired up",
    kind: "Knovator · Integrations",
    year: "2024–26",
    problem:
      "Restaurant ordering products have to talk to the payment, POS and loyalty systems each restaurant already runs.",
    built: [
      "Integrated Olo Pay, Toast POS, OLO, SpendGo and Punchh.",
      "Idempotency keys and webhook-driven reconciliation, so a retried request never charges twice.",
      "20+ reusable React / Next.js components for ordering systems and admin dashboards.",
    ],
    stack: ["Node.js", "TypeScript", "React", "Next.js", "Webhooks"],
    visual: "integrations",
  },
  {
    index: "04",
    title: "Admin panels for ICAI & iCall",
    kind: "Knovator · SaaS",
    year: "2024–26",
    problem:
      "Admin tools for the Institute of Chartered Accountants of India and iCall, the mental-health helpline of TISS.",
    built: [
      "Secure REST APIs in Node.js/TypeScript with JWT auth and input validation.",
      "Role-based access control, so each staff role sees only its own tools.",
      "MongoDB-backed services, tuned with aggregation pipelines and compound indexes.",
    ],
    stack: ["Node.js", "TypeScript", "JWT", "RBAC", "MongoDB"],
    visual: "admin",
  },
];

/** personal projects, not products with users */
export const sideProjects: { title: string; note: string; stack: string; url?: string }[] = [
  {
    title: "AI Video Studio & Opportunity Desk",
    note: "Turns a script and sourced data into finished YouTube videos for 3 channels: AI voice, animated scenes, captions, Shorts and automatic QA. An AI agent also reads ideas shared from my phone, looks for proof of demand and gives a Go / Drop verdict.",
    stack: "Node.js · Remotion · Next.js · PostgreSQL",
  },
  {
    title: "Stock Assist",
    note: "A PWA that reads Nifty 100 stocks with technical indicators (RSI, MACD, ADX, VWAP) and two LLMs side by side, Groq and Gemini.",
    stack: "React · Node.js · Groq · Gemini",
    url: "https://stock-assist-web.vercel.app",
  },
];

export type StackGroup = { name: string; items: { label: string; level: "daily" | "working" }[] };

export const stack: StackGroup[] = [
  {
    name: "AI & LLM",
    items: [
      { label: "OpenAI · Anthropic · Gemini · Groq APIs", level: "daily" },
      { label: "Vercel AI SDK", level: "daily" },
      { label: "AI agents", level: "daily" },
      { label: "Tool calling", level: "working" },
      { label: "Structured output · code checks", level: "daily" },
    ],
  },
  {
    name: "Backend",
    items: [
      { label: "Node.js · TypeScript", level: "daily" },
      { label: "NestJS · Express", level: "daily" },
      { label: "REST APIs · JWT · RBAC", level: "daily" },
      { label: "Webhooks · idempotency", level: "daily" },
      { label: "Microservices · Kafka", level: "working" },
    ],
  },
  {
    name: "Frontend",
    items: [
      { label: "React", level: "daily" },
      { label: "Next.js", level: "daily" },
      { label: "Redux · Context", level: "working" },
    ],
  },
  {
    name: "Data & infra",
    items: [
      { label: "MongoDB", level: "daily" },
      { label: "PostgreSQL · MySQL · Prisma", level: "working" },
      { label: "Directus CMS", level: "working" },
      { label: "Cloudflare Workers · D1 · Vercel", level: "working" },
      { label: "Docker", level: "working" },
    ],
  },
];

export const marquee = [
  "TypeScript",
  "Node.js",
  "NestJS",
  "React",
  "Next.js",
  "Vercel AI SDK",
  "OpenAI",
  "Anthropic",
  "Gemini",
  "Kafka",
  "MongoDB",
  "PostgreSQL",
  "Cloudflare Workers",
  "Razorpay",
  "Toast POS",
];

export const nav = [
  { href: "#work", label: "Work" },
  { href: "#experience", label: "Experience" },
  { href: "#stack", label: "Stack" },
  { href: "#contact", label: "Contact" },
];
