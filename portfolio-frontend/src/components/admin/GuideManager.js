"use client";

const guideSections = [
  {
    title: "Projects",
    steps: [
      "Create: complete the project title, description, tech stack, status, GitHub URL, and optional Live URL. Choose an image, set Public Visibility, choose Display Order, then click EXECUTE_INSERT.",
      "Update: click [ EDIT ] on a project, change its fields, optionally choose a replacement image, then click EXECUTE_UPDATE. Leave the image empty to keep the current image.",
      "Delete: click [ DELETE ] beside the project and confirm. This permanently removes the project record.",
      "Display Order controls the project sequence. Lower numbers appear first.",
    ],
  },
  {
    title: "Blogs",
    steps: [
      "Create: enter a title and unique URL slug, write Markdown content, optionally choose a Cloudinary cover image, add the summary, tags, and read time, then click PUBLISH_LOG.",
      "Update: click [ EDIT ] on a blog, change the fields, optionally replace the cover image, then click EXECUTE_UPDATE. Leave the image empty to keep the current cover.",
      "Delete: click [ DELETE ] beside the blog and confirm. This permanently removes the blog record.",
      "Inline images: place the cursor between content blocks, then use INSERT_INLINE_IMAGE for a Cloudinary upload or paste any public image URL and click INSERT IMAGE URL. Google Drive sharing links are converted automatically.",
      "Normal text can be pasted beside Markdown headings, lists, links, code blocks, and images. A duplicate slug cannot be saved.",
    ],
  },
  {
    title: "Markdown Quick Reference",
    steps: [
      "Heading: ## Internship Overview",
      "Bold text: **important detail**",
      "Link: [Apple](https://www.apple.com)",
      "Bullet list: - first item",
      "Code: `npm run dev` or a fenced block with three backticks.",
      "Image: ![Description](image-url)",
      "Leave a blank line between paragraphs and blocks for predictable rendering.",
    ],
  },
  {
    title: "Diary",
    steps: [
      "Create: choose a Current Status, write Entry Content, then click COMMIT_ENTRY.",
      "Update: click [ EDIT ] on a diary entry, change the status or content, then click UPDATE_ENTRY. Use CANCEL_EDIT to leave it unchanged.",
      "Delete: click [ DELETE ] beside the diary entry and confirm the permanent deletion.",
    ],
  },
  {
    title: "Skills, Education, and Experience",
    steps: [
      "Skills - Create: enter name, category, level, and optional icon, then click Add New Skill. For Other, complete the required details field.",
      "Skills - Update: click [EDIT], change the fields, then click Update Skill. Delete: click [DEL] and confirm.",
      "Education - Create or update: complete the institution, degree, dates, score, description, and other fields, then submit. Use [EDIT] to load an existing item.",
      "Education - Delete: click [DEL] beside the education entry and confirm.",
      "Experience - Create or update: complete the role, company, dates, description, and links, then submit. Use [EDIT] to load an existing role.",
      "Experience - Delete: click [DEL] beside the experience entry and confirm.",
    ],
  },
  {
    title: "Home Content",
    steps: [
      "Create: click Add Section, enter the eyebrow, title, body, and accent, then save the page.",
      "Update: edit an existing section, use Up or Down to reorder it, then save.",
      "Delete: click Remove on a section, then save to persist the deletion.",
      "The public content cache is revalidated automatically after saving.",
    ],
  },
  {
    title: "Universal Settings",
    steps: [
      "Update: edit the site-wide values exposed by Universal Settings, then use its save button.",
      "There is no separate create or delete action because settings are a single shared record. Clear a value only when intentionally removing that setting.",
    ],
  },
  {
    title: "Messages and Security",
    steps: [
      "Messages are created automatically by the public contact form. Review them and use the delete action when a submission is no longer needed.",
      "Security Logs are created automatically by the API. Review them for investigation; they are not manually created or edited here.",
      "Terminate the admin session with the logout control when finished, especially on a shared computer.",
    ],
  },
];

export default function GuideManager() {
  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">ADMIN_GUIDE</h2>
        <p className="text-sm text-green-600 mt-2">
          Reference for managing the public portfolio from this dashboard.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {guideSections.map((section) => (
          <section key={section.title} className="border border-green-900/50 rounded-lg p-5 bg-gray-950/60">
            <h3 className="text-lg font-bold text-green-300 mb-4">{section.title}</h3>
            <ol className="space-y-3 text-sm leading-6 text-gray-300 list-decimal list-inside">
              {section.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
