'use client';

import { useContext, useId, useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cva } from 'class-variance-authority';
import { ChevronDownIcon } from 'lucide-react';
import { z } from 'zod';

import { Button } from '../shadcn/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../shadcn/tooltip';
import { cn } from '../utils';
import { SidebarContext } from './context/sidebar.context';
import { If } from './if';
import isRouteActive from './is-route-active';
import { SidebarConfigSchema } from './sidebar-schema';
import { Trans } from './trans';

export type SidebarConfig = z.infer<typeof SidebarConfigSchema>;

export function Sidebar(props: {
  collapsed?: boolean;
  children:
    | React.ReactNode
    | ((props: {
        collapsed: boolean;
        setCollapsed: (collapsed: boolean) => void;
      }) => React.ReactNode);
}) {
  const [collapsed, setCollapsed] = useState(props.collapsed ?? false);

  const className = getClassNameBuilder()({
    collapsed,
  });

  const ctx = { collapsed, setCollapsed };

  return (
    <SidebarContext.Provider value={ctx}>
      <div className={className}>
        {typeof props.children === 'function'
          ? props.children(ctx)
          : props.children}
      </div>
    </SidebarContext.Provider>
  );
}

export function SidebarContent({
  children,
  className,
}: React.PropsWithChildren<{
  className?: string;
}>) {
  return (
    <div className={cn('flex w-full flex-col space-y-1.5 px-4', className)}>
      {children}
    </div>
  );
}

export function SidebarGroup({
  label,
  collapsed = false,
  collapsible = true,
  children,
}: React.PropsWithChildren<{
  label: string | React.ReactNode;
  collapsible?: boolean;
  collapsed?: boolean;
}>) {
  const { collapsed: sidebarCollapsed } = useContext(SidebarContext);
  const [isGroupCollapsed, setIsGroupCollapsed] = useState(collapsed);
  const id = useId();

  const Title = (props: React.PropsWithChildren) => {
    if (sidebarCollapsed) {
      return null;
    }

    return (
      <span className={'text-xs font-semibold uppercase text-muted-foreground'}>
        {props.children}
      </span>
    );
  };

  const Wrapper = () => {
    const className = cn(
      'group flex items-center justify-between px-container space-x-2.5',
      {
        'py-2.5': !sidebarCollapsed,
      },
    );

    if (collapsible) {
      return (
        <button
          aria-expanded={!isGroupCollapsed}
          aria-controls={id}
          onClick={() => setIsGroupCollapsed(!isGroupCollapsed)}
          className={className}
        >
          <Title>{label}</Title>

          <If condition={collapsible}>
            <ChevronDownIcon
              className={cn(`h-3 transition duration-300`, {
                'rotate-180': !isGroupCollapsed,
              })}
            />
          </If>
        </button>
      );
    }

    return (
      <div className={className}>
        <Title>{label}</Title>
      </div>
    );
  };

  return (
    <div className={'flex flex-col space-y-1 py-1'}>
      <Wrapper />

      <If condition={collapsible ? !isGroupCollapsed : true}>
        <div id={id} className={'flex flex-col space-y-1.5'}>
          {children}
        </div>
      </If>
    </div>
  );
}

export function SidebarDivider() {
  return (
    <div className={'dark:border-dark-800 my-2 border-t border-gray-100'} />
  );
}

export function SidebarItem({
  end,
  path,
  children,
  Icon,
}: React.PropsWithChildren<{
  path: string;
  Icon: React.ReactNode;
  end?: boolean;
}>) {
  const { collapsed } = useContext(SidebarContext);

  const currentPath = usePathname() ?? '';
  const active = isRouteActive(path, currentPath, end ? 0 : 3);
  const variant = active ? 'default' : 'ghost';
  const size = collapsed ? 'icon' : 'default';

  return (
    <Link key={path} href={path}>
      <Button
        className={cn('flex w-full', {
          'justify-start space-x-2': !collapsed,
        })}
        size={size}
        variant={variant}
      >
        <If condition={collapsed} fallback={Icon}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>{Icon}</TooltipTrigger>

              <TooltipContent side={'right'} sideOffset={20}>
                {children}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </If>

        <span
          className={cn({
            hidden: collapsed,
          })}
        >
          {children}
        </span>
      </Button>
    </Link>
  );
}

function getClassNameBuilder() {
  return cva(
    ['flex box-content h-screen flex-col border-r border-border relative'],
    {
      variants: {
        collapsed: {
          true: `w-[6rem]`,
          false: `w-2/12 lg:w-[17rem]`,
        },
      },
    },
  );
}

export function SidebarNavigation({
  config,
}: React.PropsWithChildren<{
  config: SidebarConfig;
}>) {
  return (
    <>
      {config.routes.map((item, index) => {
        if ('divider' in item) {
          return <SidebarDivider key={index} />;
        }

        if ('children' in item) {
          return (
            <SidebarGroup
              key={item.label}
              label={<Trans i18nKey={item.label} defaults={item.label} />}
              collapsible={item.collapsible}
              collapsed={item.collapsed}
            >
              {item.children.map((child) => {
                return (
                  <SidebarItem
                    key={child.path}
                    end={child.end}
                    path={child.path}
                    Icon={child.Icon}
                  >
                    <Trans i18nKey={child.label} defaults={child.label} />
                  </SidebarItem>
                );
              })}
            </SidebarGroup>
          );
        }

        return (
          <SidebarItem
            key={item.path}
            end={item.end}
            path={item.path}
            Icon={item.Icon}
          >
            <Trans i18nKey={item.label} defaults={item.label} />
          </SidebarItem>
        );
      })}
    </>
  );
}
