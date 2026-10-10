export const profile = {
  fullName: "Nathan Nicholas D'Souza",
  nameLines: ["Nathan", "Nicholas", "D'Souza"],
  subtitle: "AI/ML & Full-Stack Engineer | Vancouver, BC",
  education: "BSc Computing Science (AI), Simon Fraser University",
  location: "Vancouver, BC",
  email: "naythandsouza@gmail.com",
  github: "https://github.com/NDNathanRocks",
  linkedin: "https://www.linkedin.com/in/nathannicholasdsouza/",
} as const;

export type Metric = { value: number; prefix?: string; suffix?: string; label: string };

export type Demo =
  | { kind: "client"; note: string }
  | { kind: "iframe"; note: string; src?: string }
  | { kind: "confidential" };

export type Project = {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
  stack: string[];
  repo?: string;
  from: string;
  to: string;
  origin: string;
  layout: string;
  titleClass: string;
  demo: Demo;
  impact?: Metric[];
};

export const projects: Project[] = [
  {
    id: "clarity",
    title: "Clarity",
    subtitle: "AI time awareness assistant",
    meta: "Sept - Nov 2025",
    stack: ["React Native", "Django", "Claude API"],
    repo: "https://github.com/NDNathanRocks/Clarity-Your-AI-Time-Companion",
    from: "#a78bfa",
    to: "#f472b6",
    origin: "100% 0%",
    layout: "md:col-span-7 md:row-span-4",
    titleClass: "text-[clamp(3rem,7vw,6.5rem)]",
    demo: { kind: "iframe", note: "Planned: the app running live in a sandboxed frame." },
  },
  {
    id: "binit",
    title: "BinIt!",
    subtitle: "AI-powered trash sorter",
    meta: "March 2023 · SystemHacks WiCS Award",
    stack: ["Flask", "ReactJS", "ResNet152"],
    repo: "https://github.com/NDNathanRocks/BinIt",
    from: "#34d399",
    to: "#d9f99d",
    origin: "0% 0%",
    layout: "md:col-span-5 md:row-span-2",
    titleClass: "text-[clamp(2.5rem,4.2vw,3.75rem)]",
    demo: { kind: "client", note: "Planned: runs in your browser. Images are never uploaded." },
  },
  {
    id: "smile",
    title: "AISmileDetector",
    subtitle: "Real-time facial expression analysis model",
    meta: "Computer vision",
    stack: ["Python", "OpenCV", "Neural Networks"],
    repo: "https://github.com/NDNathanRocks/AISmileDetector",
    from: "#fbbf24",
    to: "#fb923c",
    origin: "0% 100%",
    layout: "md:col-span-5 md:row-span-2",
    titleClass: "text-[clamp(2.25rem,3.6vw,3.25rem)]",
    demo: { kind: "client", note: "Planned: runs in your browser. Your webcam feed stays on your device." },
  },
  {
    id: "panoramic",
    title: "Panoramic Image Stitching",
    subtitle: "ORB feature detection, optimized 14x",
    meta: "Aug - Dec 2022",
    stack: ["MATLAB", "ORBFeaturesDetector"],
    repo: "https://github.com/NDNathanRocks/PanoramicStitching",
    from: "#fb923c",
    to: "#f43f5e",
    origin: "100% 100%",
    layout: "md:col-span-8 md:row-span-3",
    titleClass: "text-[clamp(2.5rem,5vw,4.75rem)]",
    demo: { kind: "client", note: "Planned: feature detection and matching on sample images, in your browser." },
  },
  {
    id: "rfp",
    title: "RFP Utility",
    subtitle: "Automated ETL pipelines reducing manual labor by 99%",
    meta: "Aug 2024 - Aug 2025 · Fraser Health",
    stack: ["PySide6", "pywin32", "ETL"],
    from: "#22d3ee",
    to: "#6366f1",
    origin: "50% 0%",
    layout: "md:col-span-4 md:row-span-3",
    titleClass: "text-[clamp(2.5rem,4.2vw,3.75rem)]",
    demo: { kind: "confidential" },
    impact: [
      { value: 30, suffix: "+ hrs", label: "weekly manual labor, before" },
      { value: 5, prefix: "<", suffix: " min", label: "weekly effort, after" },
    ],
  },
];

export const experience: {
  role: string;
  org: string;
  dates: string;
  from: string;
  to: string;
  metrics: Metric[];
}[] = [
  {
    role: "Assistant, HR Consulting Services",
    org: "Fraser Health Authority",
    dates: "Sept 2025 - Present",
    from: "#a78bfa",
    to: "#f472b6",
    metrics: [
      { value: 100, suffix: "%", label: "of agency contracts tracked digitally" },
      { value: 8, suffix: "-week", label: "staffing trend dashboards" },
    ],
  },
  {
    role: "Workforce QI and Optimization Co-op",
    org: "Fraser Health Authority",
    dates: "Aug 2024 - Aug 2025",
    from: "#22d3ee",
    to: "#6366f1",
    metrics: [
      { value: 30, suffix: "+ hrs", label: "weekly labor automated" },
      { value: 5, prefix: "<", suffix: " min", label: "to run it now" },
      { value: 60, suffix: "%", label: "faster UKG WFM migration" },
    ],
  },
  {
    role: "BSc Computing Science, Conc. Artificial Intelligence",
    org: "Simon Fraser University",
    dates: "Sept 2020 - Dec 2025",
    from: "#fbbf24",
    to: "#fb923c",
    metrics: [],
  },
];

export const awards = [
  { title: "Mountain Madness 2025", detail: "1st place, \"The Classic\" hackathon", date: "March 2025" },
  { title: "SystemHacks 2023", detail: "Best Project, WiCS Award, for BinIt!", date: "March 2023" },
];

export const skills = [
  { group: "Machine Learning & AI", items: "PyTorch, TensorFlow, Keras, OpenCV, Pytesseract, Claude API, Computer Vision" },
  { group: "Data & Databases", items: "SQL (SQLite), Power BI, ETL Pipelines, Chart.js, NumPy, Pandas" },
  { group: "Full-Stack", items: "Django, Flask, PySide6, React, React Native, TypeScript, Java, C/C++" },
];

export const getProject = (slug: string) => projects.find((p) => p.id === slug);
