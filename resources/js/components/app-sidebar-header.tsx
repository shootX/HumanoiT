import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useLayout } from '@/contexts/LayoutContext';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { ProfileMenu } from '@/components/profile-menu';
import { LanguageSwitcher } from '@/components/language-switcher';
import { WorkspaceSwitcher } from '@/components/workspace-switcher';
import NavigationTimer from '@/components/timesheets/NavigationTimer';
import { usePage, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Building2 } from 'lucide-react';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const { t } = useTranslation();
    const { position } = useLayout();
    const { auth } = usePage().props as any;
    const currentWorkspace = auth?.user?.current_workspace;

    return (
        <>
            <header className="border-sidebar-border/50 flex h-14 shrink-0 items-center gap-2 border-b px-3 sm:px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-3 overflow-x-auto">
            <div className="flex w-full min-w-0 items-center justify-between gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
                    {position === 'left' && <SidebarTrigger className="-ml-1 flex-shrink-0" />}
                    {auth?.user?.type === 'company' && (
                        <div className="hidden flex-shrink-0 items-center gap-1 text-sm text-muted-foreground sm:flex">
                            <Building2 className="h-4 w-4" />
                            <span className="truncate">{currentWorkspace?.name || 'No Workspace'}</span>
                            {breadcrumbs.length > 0 && <span className="mx-1">/</span>}
                        </div>
                    )}
                    <div className="min-w-0 flex-1 overflow-hidden">
                        <Breadcrumbs items={breadcrumbs.map(b => ({ label: b.title, href: b.href }))} />
                    </div>
                </div>
                <div className="flex flex-shrink-0 items-center gap-1 sm:gap-2">
                    {(usePage().props as any).isImpersonating && (
                        <button 
                            onClick={() => router.post(route('impersonate.leave'))}
                            className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                        >
                            {t("Return Back")}
                        </button>
                    )}

                    {auth?.user?.type !== 'superadmin' && <NavigationTimer />}
                    <WorkspaceSwitcher />
                    <LanguageSwitcher />
                    <ProfileMenu />
                    {position === 'right' && <SidebarTrigger className="-mr-1" />}
                </div>
            </div>
        </header>
        </>
    );
}
