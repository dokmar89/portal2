export type SiteConfig = {
  name: string
  description: string
  mainNav: { title: string; href: string }[]
}

export const siteConfig: SiteConfig = {
  name: "PassProve",
  description: "Customer portal for PassProve verification service",
  mainNav: [
    {
      title: "Documentation",
      href: "/docs",
    },
  ],
}

