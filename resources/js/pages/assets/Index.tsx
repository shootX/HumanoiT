import { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, Search, Eye, Edit, Trash2, Package, Settings, Download, Upload, Ruler, Wrench, Undo2, GitMerge } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { PageTemplate } from '@/components/page-template';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import AssetFormModal from '@/components/assets/AssetFormModal';
import { ImportModal } from '@/components/ImportModal';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/components/custom-toast';
import { hasPermission } from '@/utils/authorization';
import { useTranslation } from 'react-i18next';
import { Asset, Project } from '@/types';

const ASSET_TYPES = ['hvac', 'elevator', 'electrical', 'plumbing', 'generator', 'other'] as const;
const ASSET_STATUSES = ['active', 'used', 'maintenance', 'retired'] as const;

export default function AssetsIndex() {
    const { t } = useTranslation();
    const { auth, assets, projects, assetCategories = [], units = [], filters: pageFilters = {}, flash, assetListMode = 'default' } = usePage().props as any;
    const instrumentsOnly = assetListMode === 'instruments';
    const listRouteName = instrumentsOnly ? 'assets.instruments' : 'assets.index';
    const canManageWorkspaceUnits =
        auth?.user?.can_manage_workspace_units === true || auth?.can_manage_workspace_units === true;
    const permissions = auth?.permissions || [];

    const [searchTerm, setSearchTerm] = useState(pageFilters.search || '');
    const [selectedType, setSelectedType] = useState(pageFilters.type || 'all');
    const [selectedStatus, setSelectedStatus] = useState(pageFilters.status ?? 'active');
    const [selectedProject, setSelectedProject] = useState(pageFilters.project_id || 'all');
    const [selectedCategory, setSelectedCategory] = useState(pageFilters.asset_category_id || 'all');
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
    const [mergePrimaryId, setMergePrimaryId] = useState<number>(0);
    const [mergeName, setMergeName] = useState('');

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    useEffect(() => {
        setSelectedIds([]);
    }, [assets?.data, instrumentsOnly]);

    const applyFilters = () => {
        const params: Record<string, string> = { page: '1' };
        if (searchTerm) params.search = searchTerm;
        if (selectedType !== 'all') params.type = selectedType;
        params.status = selectedStatus;
        if (selectedProject !== 'all') params.project_id = selectedProject;
        if (selectedCategory !== 'all') params.asset_category_id = selectedCategory;
        params.per_page = '30';
        router.get(route(listRouteName), params);
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

    const handleBulkInstrument = (isInstrument: boolean, ids: number[]) => {
        if (ids.length === 0) return;
        router.post(
            route('assets.bulk-instrument'),
            { ids, is_instrument: isInstrument },
            { preserveScroll: true, onSuccess: () => setSelectedIds([]) },
        );
    };

    const openMergeModal = () => {
        if (selectedIds.length < 2) return;
        const items = (assets?.data ?? []) as Asset[];
        const selected = items.filter((a) => selectedIds.includes(a.id));
        if (selected.length < 2) return;
        const primary = selectedIds[0];
        setMergePrimaryId(primary);
        setMergeName(selected.map((a) => a.name).join(' / '));
        setIsMergeModalOpen(true);
    };

    const handleMergeConfirm = () => {
        const name = mergeName.trim();
        if (!name) {
            toast.error(t('Please enter a final name.'));
            return;
        }
        const secondaries = selectedIds.filter((id) => id !== mergePrimaryId);
        if (secondaries.length === 0) {
            toast.error(t('Select at least one other asset to merge.'));
            return;
        }
        router.post(
            route('assets.merge'),
            {
                primary_asset_id: mergePrimaryId,
                merge_asset_ids: secondaries,
                name,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsMergeModalOpen(false);
                    setSelectedIds([]);
                },
                onError: (errors: Record<string, string | string[]>) => {
                    const first = Object.values(errors).flat()[0];
                    if (first) toast.error(String(first));
                },
            },
        );
    };

    const toggleSelectAsset = (id: number) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const selectAllOnPage = () => {
        const pageItems = (assets?.data ?? []) as Asset[];
        const pageIds = pageItems.map((a) => a.id);
        if (pageIds.length === 0) return;
        const allSelected = pageIds.every((id) => selectedIds.includes(id));
        if (allSelected) {
            setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
        } else {
            setSelectedIds((prev) => [...new Set([...prev, ...pageIds])]);
        }
    };

    const getTypeLabel = (type: string) => t(`asset_type_${type}`);
    const getStatusLabel = (status: string) => t(`asset_status_${status}`);

    const pageActions = [];
    if (hasPermission(permissions, 'asset_view_any')) {
        pageActions.push({
            label: t('Export'),
            icon: <Download className="h-4 w-4 mr-2" />,
            variant: 'outline' as const,
            onClick: async () => {
                try {
                    const params = new URLSearchParams();
                    if (pageFilters.search) params.set('search', pageFilters.search);
                    if (pageFilters.status && pageFilters.status !== 'all') params.set('status', pageFilters.status);
                    if (pageFilters.project_id && pageFilters.project_id !== 'all') params.set('project_id', pageFilters.project_id);
                    if (pageFilters.asset_category_id && pageFilters.asset_category_id !== 'all') params.set('asset_category_id', pageFilters.asset_category_id);
                    if (instrumentsOnly) params.set('instruments', '1');
                    const response = await fetch(route('assets.export') + (params.toString() ? '?' + params : ''));
                    if (!response.ok) throw new Error('Export failed');
                    const blob = await response.blob();
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = `აქტივები_${new Date().toISOString().split('T')[0]}.xlsx`;
                    a.click();
                    URL.revokeObjectURL(a.href);
                    toast.success(t('Export completed successfully'));
                } catch {
                    toast.error(t('Export failed'));
                }
            },
        });
    }
    if (hasPermission(permissions, 'asset_create')) {
        pageActions.push({
            label: t('Import'),
            icon: <Upload className="h-4 w-4 mr-2" />,
            variant: 'outline' as const,
            onClick: () => setIsImportModalOpen(true),
        });
    }
    if (canManageWorkspaceUnits) {
        pageActions.push({
            label: t('Units'),
            icon: <Ruler className="h-4 w-4 mr-2" />,
            variant: 'outline' as const,
            onClick: () => router.get(route('units.index')),
        });
    }
    if (hasPermission(permissions, 'asset_manage_categories')) {
        pageActions.push({
            label: t('Asset Categories'),
            icon: <Settings className="h-4 w-4 mr-2" />,
            variant: 'outline' as const,
            onClick: () => router.get(route('asset-categories.index')),
        });
    }
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
        { title: t('Assets'), href: route('assets.index') },
        ...(instrumentsOnly ? [{ title: t('Instruments') }] : []),
    ];

    const items = assets?.data ?? [];
    const pageIds = (items as Asset[]).map((a) => a.id);
    const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));
    const somePageSelected = pageIds.some((id) => selectedIds.includes(id)) && !allPageSelected;
    const pagination = assets ? { current: assets.current_page, last: assets.last_page, total: assets.total } : null;

    return (
        <PageTemplate
            title={instrumentsOnly ? t('Instruments') : t('Assets')}
            url={instrumentsOnly ? '/assets/instruments' : '/assets'}
            actions={pageActions}
            breadcrumbs={breadcrumbs}
            noPadding
        >
            <div className="space-y-4">
                <Card>
                    <CardContent className="p-3 sm:p-4">
                        <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
                            <div className="w-full flex-1 min-w-0 sm:min-w-[180px]">
                                <Input
                                    placeholder={t('Search by name, code, location...')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="h-9"
                                />
                            </div>
                            <Select value={selectedType} onValueChange={setSelectedType}>
                                <SelectTrigger className="w-full sm:w-[140px] h-9 min-h-[44px] sm:min-h-0">
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
                                <SelectTrigger className="w-full sm:w-[140px] h-9 min-h-[44px] sm:min-h-0">
                                    <SelectValue placeholder={t('Status')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {ASSET_STATUSES.map((s) => (
                                        <SelectItem key={s} value={s}>{getStatusLabel(s)}</SelectItem>
                                    ))}
                                    <SelectItem value="all">{t('All Status')}</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={selectedProject} onValueChange={setSelectedProject}>
                                <SelectTrigger className="w-full sm:w-[160px] h-9 min-h-[44px] sm:min-h-0">
                                    <SelectValue placeholder={t('Project')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('All Projects')}</SelectItem>
                                    {(projects || []).map((p: Project) => (
                                        <SelectItem key={p.id} value={String(p.id)}>{p.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="w-full sm:w-[160px] h-9 min-h-[44px] sm:min-h-0">
                                    <SelectValue placeholder={t('Category')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('All Categories')}</SelectItem>
                                    {(assetCategories || []).map((c: { id: number; name: string }) => (
                                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button type="submit" variant="secondary" size="sm" className="min-h-[44px] sm:min-h-0 touch-manipulation w-full sm:w-auto">{t('Apply')}</Button>
                        </form>
                    </CardContent>
                </Card>

                {hasPermission(permissions, 'asset_update') && items.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 px-1">
                        <span className="text-sm text-muted-foreground">
                            {selectedIds.length > 0 ? `${selectedIds.length} ${t('selected')}` : null}
                        </span>
                        {!instrumentsOnly && (
                            <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                disabled={selectedIds.length === 0}
                                onClick={() => handleBulkInstrument(true, selectedIds)}
                            >
                                {t('Mark selected as instruments')}
                            </Button>
                        )}
                        {instrumentsOnly && (
                            <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                disabled={selectedIds.length === 0}
                                onClick={() => handleBulkInstrument(false, selectedIds)}
                            >
                                {t('Remove selected from instruments')}
                            </Button>
                        )}
                        <Button
                            type="button"
                            size="sm"
                            variant="default"
                            disabled={selectedIds.length < 2}
                            onClick={openMergeModal}
                        >
                            <GitMerge className="h-4 w-4 mr-2" />
                            {t('Merge assets')}
                        </Button>
                    </div>
                )}

                <Card>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {hasPermission(permissions, 'asset_update') && (
                                        <TableHead className="w-[44px] pr-0">
                                            <Checkbox
                                                checked={allPageSelected ? true : somePageSelected ? 'indeterminate' : false}
                                                onCheckedChange={() => selectAllOnPage()}
                                                aria-label={t('Select all on page')}
                                            />
                                        </TableHead>
                                    )}
                                    <TableHead className="w-[40px]">#</TableHead>
                                    <TableHead>{t('Name')}</TableHead>
                                    <TableHead className="text-center w-[120px]">{t('Quantity')}</TableHead>
                                    <TableHead>{t('Asset Code')}</TableHead>
                                    <TableHead>{t('Category')}</TableHead>
                                    <TableHead>{t('Project')}</TableHead>
                                    <TableHead>{t('Status')}</TableHead>
                                    <TableHead className="text-right">{t('Actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((asset: Asset, idx: number) => (
                                    <TableRow key={asset.id} className="hover:bg-muted/50">
                                        {hasPermission(permissions, 'asset_update') && (
                                            <TableCell className="pr-0 w-[44px]">
                                                <Checkbox
                                                    checked={selectedIds.includes(asset.id)}
                                                    onCheckedChange={() => toggleSelectAsset(asset.id)}
                                                    aria-label={t('Select row')}
                                                />
                                            </TableCell>
                                        )}
                                        <TableCell className="text-muted-foreground">
                                            {(assets?.current_page - 1) * (assets?.per_page || 30) + idx + 1}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                                                <span className="font-medium">{asset.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center font-medium">
                                            {asset.quantity ?? 1} {asset.unit?.short_name || ''}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{asset.asset_code || '—'}</TableCell>
                                        <TableCell>
                                            {asset.asset_category ? asset.asset_category.name : (asset.type ? getTypeLabel(asset.type) : '—')}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground truncate max-w-[180px]">
                                            {asset.project?.title || '—'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={asset.status === 'active' ? 'default' : asset.status === 'used' || asset.status === 'maintenance' ? 'secondary' : 'destructive'}>
                                                {getStatusLabel(asset.status)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" onClick={() => handleView(asset)} className="h-8 w-8">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>{t('View')}</TooltipContent>
                                                </Tooltip>
                                                {hasPermission(permissions, 'asset_update') && !instrumentsOnly && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleBulkInstrument(true, [asset.id])}
                                                                className="h-8 w-8 text-sky-600"
                                                            >
                                                                <Wrench className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>{t('Mark as instrument')}</TooltipContent>
                                                    </Tooltip>
                                                )}
                                                {hasPermission(permissions, 'asset_update') && instrumentsOnly && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleBulkInstrument(false, [asset.id])}
                                                                className="h-8 w-8 text-sky-600"
                                                            >
                                                                <Undo2 className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>{t('Remove from instruments')}</TooltipContent>
                                                    </Tooltip>
                                                )}
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
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {items.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={hasPermission(permissions, 'asset_update') ? 9 : 8} className="h-24 text-center text-muted-foreground">
                                            {t('No results found.')}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </Card>

                {pagination && pagination.last > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.current <= 1}
                            onClick={() => router.get(route(listRouteName), { ...pageFilters, page: pagination.current - 1 })}
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
                            onClick={() => router.get(route(listRouteName), { ...pageFilters, page: pagination.current + 1 })}
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
                assetCategories={assetCategories || []}
                units={units || []}
                defaultAsInstrument={instrumentsOnly}
                onSubmit={handleFormSubmit}
            />

            <CrudDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => { setIsDeleteModalOpen(false); setEditingAsset(null); }}
                onConfirm={handleDeleteConfirm}
                itemName={editingAsset?.name ?? ''}
                entityName={t('asset')}
            />

            <ImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                type="assets"
                title="Assets"
            />

            <Dialog open={isMergeModalOpen} onOpenChange={(open) => !open && setIsMergeModalOpen(false)}>
                <DialogContent className="sm:max-w-md" style={{ zIndex: 10000 }}>
                    <DialogHeader>
                        <DialogTitle>{t('Merge selected assets')}</DialogTitle>
                        <DialogDescription>{t('Keeps code and category; quantities will be summed.')}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>{t('Primary asset')}</Label>
                            <RadioGroup
                                value={String(mergePrimaryId)}
                                onValueChange={(v) => setMergePrimaryId(Number(v))}
                                className="grid gap-2"
                            >
                                {((assets?.data ?? []) as Asset[])
                                    .filter((a) => selectedIds.includes(a.id))
                                    .map((a) => (
                                        <div key={a.id} className="flex items-center space-x-2">
                                            <RadioGroupItem value={String(a.id)} id={`merge-primary-${a.id}`} />
                                            <Label htmlFor={`merge-primary-${a.id}`} className="font-normal cursor-pointer">
                                                {a.name}
                                                {a.asset_code ? ` (${a.asset_code})` : ''}
                                            </Label>
                                        </div>
                                    ))}
                            </RadioGroup>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="merge-final-name">{t('Final name')}</Label>
                            <Input
                                id="merge-final-name"
                                value={mergeName}
                                onChange={(e) => setMergeName(e.target.value)}
                                className="h-9"
                            />
                        </div>
                    </div>
                    <DialogFooter className="sm:justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsMergeModalOpen(false)}>
                            {t('Cancel')}
                        </Button>
                        <Button type="button" onClick={handleMergeConfirm}>
                            {t('Merge assets')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </PageTemplate>
    );
}
