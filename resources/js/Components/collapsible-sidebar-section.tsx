import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/Components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/Components/ui/collapsible';

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

interface CollapsibleSidebarSectionProps {
  title: string;
  items: NavItem[];
  defaultOpen?: boolean;
}

export function CollapsibleSidebarSection({
  title,
  items,
  defaultOpen = true,
}: CollapsibleSidebarSectionProps) {
  const { url } = usePage();
  const activePath = url;

  // Check if any item in this section is active
  const hasActiveItem = items.some(item => activePath.startsWith(item.href));

  return (
    <Collapsible
      defaultOpen={defaultOpen || hasActiveItem}
      className="group/collapsible"
    >
      <SidebarGroup>
        <SidebarGroupLabel asChild>
          <CollapsibleTrigger className="flex w-full items-center justify-between">
            {title}
            <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item, index) => {
                const isActive = activePath.startsWith(item.href);

                return (
                  <SidebarMenuItem key={index}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        {item.icon}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}
