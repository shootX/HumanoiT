import { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Eye, Wrench, Circle, Trash2, Download, Upload, BarChart3, X, Pencil, Calendar } from 'lucide-react';
import { PageTemplate } from '@/components/page-template';
import { toast } from '@/components/custom-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { ImportModal } from '@/components/ImportModal';
import { hasPermission } from '@/utils/authorization';
import { useTranslation } from 'react-i18next';

interface Equipment {
    id: number;
    name: string;
    health_status: string;
    project?: { id: number; title: string };
    equipment_type?: { id: number; name: string };
}

interface Props {
    equipment: { data: Equipment[]; links: unknown[]; current_page?: number; last_page?: number; per_page?: number; total?: number };
    projects: { id: number; title: string }[];
    equipmentTypes: { id: number; name: string }[];
    metrics?: { total: number; by_type: { name: string; count: number }[]; by_status: { green: number; yellow: number; red: number } };
    filters: Record<string, string>;
    canDelete?: boolean;
}

export default function EquipmentIndex({ equipment, projects, equipmentTypes, metrics, filters, canDelete }: Props) {
    const { t } = useTranslation();
    const { flash, auth } = usePage().props as any;
    const permissions = auth?.permissions || [];
    const [search, setSearch] = useState(filters.search || '');
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [projectId, setProjectId] = useState(filters.project_id || 'all');
    const [typeId, setTypeId] = useState(filters.equipment_type_id || 'all');
    const [perPage, setPerPage] = useState(filters.per_page || '50');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [equipmentToDelete, setEquipmentToDelete] = useState<Equipment | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
    const [bulkEditModalOpen, setBulkEditModalOpen] = useState(false);
    const [bulkStatus, setBulkStatus] = useState<string>('');
    const [bulkServiceDate, setBulkServiceDate] = useState<string>('');

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);
    useEffect(() => {
        if (filters.per_page) setPerPage(filters.per_page);
    }, [filters.per_page]);

    const handleDeleteConfirm = () => {
        if (!equipmentToDelete) return;
        toast.loading(t('Deleting equipment...'));
        router.delete(route('equipment.destroy', equipmentToDelete.id), {
            onSuccess: () => {
                toast.dismiss();
                setDeleteModalOpen(false);
                setEquipmentToDelete(null);
            },
            onError: () => toast.dismiss(),
        });
    };

    const applyFilters = () => {
        const params: Record<string, string> = { page: '1', per_page: perPage };
        if (search) params.search = search;
        if (projectId !== 'all') params.project_id = projectId;
        if (typeId !== 'all') params.equipment_type_id = typeId;
        router.get(route('equipment.index'), params);
    };

    const healthColor = (s: string) => s === 'green' ? 'text-green-600' : s === 'yellow' ? 'text-yellow-600' : 'text-red-600';

    const items = equipment?.data ?? (Array.isArray(equipment) ? equipment : []);
    const toggleSelection = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };
    const toggleAll = () => {
        if (selectedIds.length === items.length) setSelectedIds([]);
        else setSelectedIds(items.map((e: Equipment) => e.id));
    };
    const isAllSelected = items.length > 0 && selectedIds.length === items.length;
    const isSomeSelected = selectedIds.length > 0;

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        toast.loading(t('Deleting...'));
        router.post(route('equipment.bulk-delete'), { equipment_ids: selectedIds }, {
            onSuccess: () => { toast.dismiss(); setSelectedIds([]); setBulkDeleteModalOpen(false); },
            onError: () => { toast.dismiss(); toast.error(t('Failed to delete')); setBulkDeleteModalOpen(false); }
        });
    };
    const handleBulkUpdate = () => {
        if (selectedIds.length === 0) return;
        const payload: Record<string, unknown> = { equipment_ids: selectedIds };
        if (bulkStatus) payload.health_status = bulkStatus;
        if (bulkServiceDate) payload.last_service_date = bulkServiceDate;
        if (!bulkStatus && !bulkServiceDate) {
            toast.error(t('Select status or service date'));
            return;
        }
        toast.loading(t('Updating...'));
        router.post(route('equipment.bulk-update'), payload, {
            onSuccess: () => {
                toast.dismiss();
                setSelectedIds([]);
                setBulkEditModalOpen(false);
                setBulkStatus('');
                setBulkServiceDate('');
            },
            onError: () => { toast.dismiss(); toast.error(t('Failed to update')); }
        });
    };

    const breadcrumbs = [
        { title: t('Dashboard'), href: route('dashboard') },
        { title: t('Equipment') }
    ];

    const pageActions = [];
    if (hasPermission(permissions, 'equipment_view_any')) {
        pageActions.push({
            label: t('Export'),
            icon: <Download className="h-4 w-4 mr-2" />,
            variant: 'outline' as const,
            onClick: async () => {
                try {
                    const response = await fetch(route('equipment.export'));
                    if (!response.ok) throw new Error('Export failed');
                    const blob = await response.blob();
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = `ტექნიკა_${new Date().toISOString().split('T')[0]}.xlsx`;
                    a.click();
                    URL.revokeObjectURL(a.href);
                    toast.success(t('Export completed successfully'));
                } catch {
                    toast.error(t('Export failed'));
                }
            },
        });
    }
    if (hasPermission(permissions, 'equipment_create')) {
        pageActions.push({
            label: t('Import'),
            icon: <Upload className="h-4 w-4 mr-2" />,
            variant: 'outline' as const,
            onClick: () => setIsImportModalOpen(true),
        });
    }
    if (hasPermission(permissions, 'equipment_create')) {
        pageActions.push({
            label: t('Add Equipment'),
            icon: <Plus className="h-4 w-4 mr-2" />,
            variant: 'default' as const,
            onClick: () => router.get(route('equipment.create')),
        });
    }

    return (
        <PageTemplate title={t('Equipment')} url="/equipment" breadcrumbs={breadcrumbs} actions={pageActions}>
            <div className="space-y-4">
                {metrics && (
                    <div className="grid gap-3 sm:grid-cols-3">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">{t('Total')}</p>
                                        <p className="text-2xl font-bold">{metrics.total}</p>
                                    </div>
                                    <Wrench className="h-8 w-8 text-muted-foreground" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm text-muted-foreground">{t('By type')}</p>
                                        <div className="mt-1 max-h-20 overflow-y-auto space-y-0.5">
                                            {metrics.by_type?.map((ty: { name: string; count: number }, i: number) => (
                                                <p key={i} className="text-sm">{ty.name}: <strong>{ty.count}</strong></p>
                                            ))}
                                            {(!metrics.by_type || metrics.by_type.length === 0) && (
                                                <p className="text-sm text-muted-foreground">—</p>
                                            )}
                                        </div>
                                    </div>
                                    <BarChart3 className="h-8 w-8 text-muted-foreground shrink-0 ml-2" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">{t('Status')}</p>
                                    <div className="mt-1 flex flex-wrap gap-3 items-center">
                                        <span className="flex items-center gap-1 text-green-600"><Circle className="h-3 w-3 fill-current" />{metrics.by_status?.green ?? 0}</span>
                                        <span className="flex items-center gap-1 text-yellow-600"><Circle className="h-3 w-3 fill-current" />{metrics.by_status?.yellow ?? 0}</span>
                                        <span className="flex items-center gap-1 text-red-600"><Circle className="h-3 w-3 fill-current" />{metrics.by_status?.red ?? 0}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
                <div className="flex flex-wrap gap-4 items-center">
                    <form onSubmit={(e) => { e.preventDefault(); applyFilters(); }} className="flex gap-2">
                        <Input placeholder={t('Search')} value={search} onChange={(e) => setSearch(e.target.value)} className="w-48" />
                        <Select value={projectId} onValueChange={setProjectId}>
                            <SelectTrigger className="w-40"><SelectValue placeholder={t('Branch')} /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('All')}</SelectItem>
                                {projects?.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.title}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={typeId} onValueChange={setTypeId}>
                            <SelectTrigger className="w-40"><SelectValue placeholder={t('Type')} /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('All')}</SelectItem>
                                {equipmentTypes?.map((et) => <SelectItem key={et.id} value={String(et.id)}>{et.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={perPage} onValueChange={(v) => {
                            setPerPage(v);
                            const params: Record<string, string> = { page: '1', per_page: v };
                            if (search) params.search = search;
                            if (projectId !== 'all') params.project_id = projectId;
                            if (typeId !== 'all') params.equipment_type_id = typeId;
                            router.get(route('equipment.index'), params);
                        }}>
                            <SelectTrigger className="w-24"><SelectValue placeholder={t('per_page')} /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button type="submit" variant="secondary"><Search className="h-4 w-4 mr-2" />{t('Filter')}</Button>
                    </form>
                </div>

                {isSomeSelected && (hasPermission(permissions, 'equipment_update') || canDelete) && (
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex flex-wrap items-center gap-3">
                        <span className="text-sm font-medium">{selectedIds.length} {t('selected')}</span>
                        <div className="flex flex-wrap items-center gap-2">
                            {hasPermission(permissions, 'equipment_update') && (
                                <Button size="sm" variant="outline" onClick={() => setBulkEditModalOpen(true)}>
                                    <Pencil className="h-4 w-4 mr-1.5" />
                                    {t('Edit')}
                                </Button>
                            )}
                            {canDelete && (
                                <Button size="sm" variant="destructive" onClick={() => setBulkDeleteModalOpen(true)}>
                                    <Trash2 className="h-4 w-4 mr-1.5" />
                                    {t('Delete')}
                                </Button>
                            )}
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>
                            <X className="h-4 w-4 mr-1.5" />
                            {t('Clear selection')}
                        </Button>
                    </div>
                )}

                <div className="bg-white border rounded-lg divide-y">
                    {items.length > 0 && (hasPermission(permissions, 'equipment_update') || canDelete) && (
                        <div className="flex items-center gap-3 p-4 border-b bg-muted/30">
                            <Checkbox
                                checked={isAllSelected}
                                onCheckedChange={toggleAll}
                            />
                            <span className="text-sm text-muted-foreground">{t('Select all')}</span>
                        </div>
                    )}
                    {Array.isArray(items) && items.map((eq: Equipment) => (
                        <div key={eq.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                                {(hasPermission(permissions, 'equipment_update') || canDelete) && (
                                    <Checkbox
                                        checked={selectedIds.includes(eq.id)}
                                        onCheckedChange={() => toggleSelection(eq.id)}
                                    />
                                )}
                                <Wrench className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="font-medium">{eq.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {eq.project?.title} | {eq.equipment_type?.name}
                                    </p>
                                </div>
                                <Circle className={`h-3 w-3 fill-current ${healthColor(eq.health_status || 'green')}`} />
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" onClick={() => router.get(route('equipment.show', eq.id))}>
                                    <Eye className="h-4 w-4 mr-2" />{t('View')}
                                </Button>
                                {hasPermission(permissions, 'equipment_update') && (
                                    <Button variant="ghost" size="sm" onClick={() => router.get(route('equipment.edit', eq.id))}>
                                        <Pencil className="h-4 w-4 mr-2" />{t('Edit')}
                                    </Button>
                                )}
                                {canDelete && (
                                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => { setEquipmentToDelete(eq); setDeleteModalOpen(true); }}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                    {(!items || items.length === 0) && (
                        <div className="p-12 text-center text-muted-foreground">
                            <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>{t('No equipment yet')}</p>
                        </div>
                    )}
                </div>
                {equipment?.last_page && equipment.last_page > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={(equipment.current_page || 1) <= 1}
                            onClick={() => {
                                const params: Record<string, string> = { page: String((equipment.current_page || 1) - 1), per_page: perPage };
                                if (search) params.search = search;
                                if (projectId !== 'all') params.project_id = projectId;
                                if (typeId !== 'all') params.equipment_type_id = typeId;
                                router.get(route('equipment.index'), params);
                            }}
                        >
                            {t('Previous')}
                        </Button>
                        <span className="flex items-center px-2 text-sm text-muted-foreground">
                            {equipment.current_page || 1} / {equipment.last_page} ({equipment.total ?? items.length})
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={(equipment.current_page || 1) >= equipment.last_page}
                            onClick={() => {
                                const params: Record<string, string> = { page: String((equipment.current_page || 1) + 1), per_page: perPage };
                                if (search) params.search = search;
                                if (projectId !== 'all') params.project_id = projectId;
                                if (typeId !== 'all') params.equipment_type_id = typeId;
                                router.get(route('equipment.index'), params);
                            }}
                        >
                            {t('Next')}
                        </Button>
                    </div>
                )}
            </div>
            <CrudDeleteModal
                isOpen={deleteModalOpen}
                onClose={() => { setDeleteModalOpen(false); setEquipmentToDelete(null); }}
                onConfirm={handleDeleteConfirm}
                itemName={equipmentToDelete?.name}
                entityName={t('Equipment')}
            />
            <CrudDeleteModal
                isOpen={bulkDeleteModalOpen}
                onClose={() => setBulkDeleteModalOpen(false)}
                onConfirm={handleBulkDelete}
                itemName={`${selectedIds.length} ${t('Equipment')}`}
                entityName={t('Equipment')}
            />
            <Dialog open={bulkEditModalOpen} onOpenChange={setBulkEditModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t('Bulk edit')} ({selectedIds.length})</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">{t('Status')}</label>
                            <Select value={bulkStatus || '__none__'} onValueChange={(v) => setBulkStatus(v === '__none__' ? '' : v)}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder={t('Change status')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__none__"><span className="text-muted-foreground">—</span></SelectItem>
                                    <SelectItem value="green"><span className="flex items-center gap-2"><Circle className="h-3 w-3 fill-green-600" />OK</span></SelectItem>
                                    <SelectItem value="yellow"><span className="flex items-center gap-2"><Circle className="h-3 w-3 fill-yellow-600" />!</span></SelectItem>
                                    <SelectItem value="red"><span className="flex items-center gap-2"><Circle className="h-3 w-3 fill-red-600" />{t('Critical')}</span></SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">{t('Last service date')}</label>
                            <Input
                                type="date"
                                value={bulkServiceDate}
                                onChange={(e) => setBulkServiceDate(e.target.value)}
                                className="mt-1"
                            />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={() => setBulkEditModalOpen(false)}>{t('Cancel')}</Button>
                            <Button onClick={handleBulkUpdate} disabled={!bulkStatus && !bulkServiceDate}>
                                {t('Apply')}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            <ImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                type="equipment"
                title="Equipment"
            />
        </PageTemplate>
    );
}
