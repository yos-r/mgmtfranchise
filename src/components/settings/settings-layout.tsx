import { Separator } from "@/components/ui/separator";
import { SidebarNav } from "./sidebar-nav";

const sidebarNavItems = [
  {
    title: "Profile",
    href: "/settings/profile",
  },
  {
    title: "Company",
    href: "/settings/company",
  },
  {
    title: "Team",
    href: "/settings/team",
  },
  {
    title: "Appearance",
    href: "/settings/appearance",
  },
  {
    title: "Notifications",
    href: "/settings/notifications",
  },
  {
    title: "Security",
    href: "/settings/security",
  },
];

interface SettingsLayoutProps {
  children: React.ReactNode;
  onSectionChange?: (section: string) => void;
}

export function SettingsLayout({ children, onSectionChange }: SettingsLayoutProps) {
  return (
    <div className="space-y-6 p-10 pb-16">
      <div className="space-y-0.5">
        <h2 className="tagline-1">Settings</h2>
        <p className="body-lead text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>
      <Separator />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/5">
          <SidebarNav items={sidebarNavItems} onSectionChange={onSectionChange} />
        </aside>
        <div className="flex-1 lg:max-w-2xl">{children}</div>
      </div>
    </div>
  );
}