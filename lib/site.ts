export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const siteTitle = "Nathan Nicholas D'Souza | AI/ML & Full-Stack Engineer";
export const siteDescription =
  "Portfolio of Nathan Nicholas D'Souza, an AI/ML & Full-Stack Engineer in Vancouver, BC. Machine learning, computer vision and full-stack projects, including Clarity, BinIt! and AISmileDetector.";

export const resumePath = "/Nathan_DSouza_Resume.pdf";
