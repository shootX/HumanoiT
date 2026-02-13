import { useState, useEffect } from 'react';
import { router, usePage, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, Search, Eye, Edit, Trash2, Package } from 'lucide-react';
import { PageTemplate } from '@/components/page-template';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import AssetFormModal from '@/components/assets/AssetFormModal';
import { toast } from '@/components/custom-toast';
import { hasPermission } from '@/utils/authorization';
import { useTranslation } from 'react-i18next';
import { Asset, Project } from '@/types';

const ASSET_TYPES = ['hvac', 'elevator', 'electrical', 'plumbing', 'generator', 'other'] as const;
const ASSET_STATUSES = ['active', 'maintenance', 'retired'] as const;

export default function AssetsIndex() {
    const { t } = useTranslation();
    const { auth, assets, projects, filters: pageFilters = {}, flash } = usePage().props as any;
    const permissions = auth?.permissions || [];

    const [searchTerm, setSearchTerm] = useState(pageFilters.search || '');
    const [selectedType, setSelectedType] = useState(pageFilters.type || 'all');
    const [selectedStatus, setSelectedStatus] = useState(pageFilters.status || 'all');
    const [selectedProject, setSelectedProject] = useState(pageFilters.project_id || 'all');
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const applyFilters = () => {
        const params: Record<string, string> = { page: '1' };
        if (searchTerm) params.search = searchTerm;
        if (selectedType !== 'all') params.type = selectedType;
        if (selectedStatus !== 'all') params.status = selectedStatus;
        if (selectedProject !== 'all') params.project_id = selectedProject;
        router.get(route('assets.index'), params);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters();
    };

    const handleAddNew = () => {
        setEditingAsset(null);
        setIsFormModalOpen(true);
    };

    const handleEdit = (asset: Asset) => {
        setEditingAsset(asset);
        setIsFormModalOpen(true);
    };

    const handleView = (asset: Asset) => {
        router.get(route('assets.show', asset.id));
    };

    const handleDelete = (asset: Asset) => {
        setEditingAsset(asset);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (!editingAsset) return;
        router.delete(route('assets.destroy', editingAsset.id), {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setEditingAsset(null);
            },
        });
    };

    const handleFormSubmit = (data: Record<string, unknown>) => {
        if (editingAsset) {
            router.put(route('assets.update', editingAsset.id), data, {
                onSuccess: () => {
                    setIsFormModalOpen(false);
                    setEditingAsset(null);
                },
            });
        } else {
            router.post(route('assets.store'), data, {
                onSuccess: () => setIsFormModalOpen(false),
            });
        }
    };

    const getTypeLabel = (type: string) => t(`asset_type_${type}`);
    const getStatusLabel = (status: string) => t(`asset_status_${status}`);

    const pageActions = [];
    if (hasPermission(permissions, 'asset_create')) {
        pageActions.push({
            label: t('Add Asset'),
            icon: <Plus className="h-4 w-4 mr-2" />,
            variant: 'default' as const,
            onClick: handleAddNew,
        });
    }

    const breadcrumbs = [
        { title: t('Dashboard'), href: route('dashboard') },
        { title: t('Assets') },
    ];

    const items = assets?.data ?? [];
    const pagination = assets ? { current: assets.current_page, last: assets.last_page, total: assets.total } : null;

    return (
        <PageTemplate title={t('Assets')} url="/assets" actions={pageActions} breadcrumbs={breadcrumbs} noPadding>
            <div className="space-y-4">
                <Card>
                    <CardContent className="p-4">
                        <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-end">
                            <div className="flex-1 min-w-[180px]">
                                <Input
                                    placeholder={t('Search by name, code, location...')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="h-9"
                                />
                            </div>
                            <Select value={selectedType} onValueChange={setSelectedType}>
                                <SelectTrigger className="w-[140px] h-9">
                                    <SelectValue placeholder={t('Type')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('All Types')}</SelectItem>
                                    {ASSET_TYPES.map((type) => (
                                        <SelectItem key={type} value={type}>{getTypeLabel(type)}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                <SelectTrigger className="w-[140px] h-9">
                                    <SelectValue placeholder={t('Status')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('All Status')}</SelectItem>
                                    {ASSET_STATUSES.map((s) => (
                                        <SelectItem key={s} value={s}>{getStatusLabel(s)}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={selectedProject} onValueChange={setSelectedProject}>
                                <SelectTrigger className="w-[160px] h-9">
                                    <SelectValue placeholder={t('Project')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('All Projects')}</SelectItem>
                                    {(projects || []).map((p: Project) => (
                                        <SelectItem key={p.id} value={String(p.id)}>{p.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button type="submit" variant="secondary" size="sm">{t('Apply')}</Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((asset: Asset) => (
                        <Card key={asset.id} className="overflow-hidden hover:shadow-md transition-shadow">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Package className="h-4 w-4 text-muted-foreground" />
                                        {asset.name}
                                    </CardTitle>
                                    <Badge variant={asset.status === 'active' ? 'default' : asset.status === 'maintenance' ? 'secondary' : 'destructive'}>
                                        {getStatusLabel(asset.status)}
                                    </Badge>
                                </div>
                                {asset.asset_code && (
                                    <p className="text-xs text-muted-foreground mt-1">{t('Asset Code')}: {asset.asset_code}</p>
                                )}
                                <p className="text-xs text-muted-foreground">{getTypeLabel(asset.type)}</p>
                                {asset.project && (
                                    <p className="text-xs text-muted-foreground truncate">{asset.project.title}</p>
                                )}
                            </CardHeader>
                            <CardFooter className="flex justify-end gap-1 pt-0">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" onClick={() => handleView(asset)} className="h-8 w-8">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>{t('View')}</TooltipContent>
                                </Tooltip>
                                {hasPermission(permissions, 'asset_update') && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(asset)} className="h-8 w-8 text-amber-500">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>{t('Edit')}</TooltipContent>
                                    </Tooltip>
                                )}
                                {hasPermission(permissions, 'asset_delete') && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(asset)} className="h-8 w-8 text-red-500">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>{t('Delete')}</TooltipContent>
                                    </Tooltip>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                {pagination && pagination.last > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.current <= 1}
                            onClick={() => router.get(route('assets.index'), { ...pageFilters, page: pagination.current - 1 })}
                        >
                            {t('Previous')}
                        </Button>
                        <span className="flex items-center px-2 text-sm text-muted-foreground">
                            {pagination.current} / {pagination.last}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.current >= pagination.last}
                            onClick={() => router.get(route('assets.index'), { ...pageFilters, page: pagination.current + 1 })}
                        >
                            {t('Next')}
                        </Button>
                    </div>
                )}
            </div>

            <AssetFormModal
                isOpen={isFormModalOpen}
                onClose={() => { setIsFormModalOpen(false); setEditingAsset(null); }}
                asset={editingAsset ?? undefined}
                projects={projects || []}
                onSubmit={handleFormSubmit}
            />

            <CrudDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => { setIsDeleteModalOpen(false); setEditingAsset(null); }}
                onConfirm={handleDeleteConfirm}
                itemName={editingAsset?.name ?? ''}
                entityName={t('asset')}
            />
        </PageTemplate>
    );
}
