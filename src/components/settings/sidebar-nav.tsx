import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string;
    title: string;
  }[];
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  return (
    <nav
      className={cn(
        "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
        className
      )}
      {...props}
    >
      {items.map((item) => (
        <Button
          key={item.href}
          variant="ghost"
          className={cn(
            "justify-start button-2",
            "hover:bg-muted hover:text-foreground"
          )}
          onClick={() => {
            // Handle navigation through state management instead
            const section = item.href.split('/').pop() as 'profile' | 'company' | 'appearance' | 'notifications' | 'security';
            props.onSectionChange?.(section);
          }}
        >
          {item.title}
        </Button>
      ))}
    </nav>
  );
}