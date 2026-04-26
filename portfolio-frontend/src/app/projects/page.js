import ProjectsClient from "@/components/ProjectsClient";
import { SITE_URL, getApiUrl } from "@/lib/siteConfig";

const PROJECTS_REVALIDATE_SECONDS = 300;

export const metadata = {
  title: "Projects | Narayan Paul",
  description: "A curated collection of full-stack and systems projects with tech stack details and live demos.",
  alternates: {
    canonical: "/projects",
  },
  openGraph: {
    title: "Projects | Narayan Paul",
    description: "A curated collection of full-stack and systems projects with tech stack details and live demos.",
    url: `${SITE_URL}/projects`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Projects | Narayan Paul",
    description: "A curated collection of full-stack and systems projects with tech stack details and live demos.",
  },
};

async function getProjects() {
  try {
    const res = await fetch(getApiUrl("/projects"), {
      next: { revalidate: PROJECTS_REVALIDATE_SECONDS },
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data : data?.data || [];
  } catch {
    return [];
  }
}

export default async function ProjectsPage() {
  const projects = await getProjects();
  return <ProjectsClient initialProjects={projects} />;
}
