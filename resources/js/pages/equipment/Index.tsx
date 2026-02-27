import { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Eye, Wrench, Circle, Trash2 } from 'lucide-react';
import { PageTemplate } from '@/components/page-template';
import { toast } from '@/components/custom-toast';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { useTranslation } from 'react-i18next';

interface Equipment {
    id: number;
    name: string;
    health_status: string;
    project?: { id: number; title: string };
    equipment_type?: { id: number; name: string };
}

interface Props {
    equipment: { data: Equipment[]; links: unknown[] };
    projects: { id: number; title: string }[];
    equipmentTypes: { id: number; name: string }[];
    filters: Record<string, string>;
    canDelete?: boolean;
}

export default function EquipmentIndex({ equipment, projects, equipmentTypes, filters, canDelete }: Props) {
    const { t } = useTranslation();
    const { flash } = usePage().props as any;
    const [search, setSearch] = useState(filters.search || '');
    const [projectId, setProjectId] = useState(filters.project_id || 'all');
    const [typeId, setTypeId] = useState(filters.equipment_type_id || 'all');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [equipmentToDelete, setEquipmentToDelete] = useState<Equipment | null>(null);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

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
        const params: Record<string, string> = { page: '1' };
        if (search) params.search = search;
        if (projectId !== 'all') params.project_id = projectId;
        if (typeId !== 'all') params.equipment_type_id = typeId;
        router.get(route('equipment.index'), params);
    };

    const healthColor = (s: string) => s === 'green' ? 'text-green-600' : s === 'yellow' ? 'text-yellow-600' : 'text-red-600';

    const breadcrumbs = [
        { title: t('Dashboard'), href: route('dashboard') },
        { title: t('Equipment') }
    ];

    const items = equipment?.data ?? (Array.isArray(equipment) ? equipment : []);

    return (
        <PageTemplate title={t('Equipment')} url="/equipment" breadcrumbs={breadcrumbs}>
            <div className="space-y-4">
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
                        <Button type="submit" variant="secondary"><Search className="h-4 w-4 mr-2" />{t('Filter')}</Button>
                    </form>
                    <Button onClick={() => router.get(route('equipment.create'))}>
                        <Plus className="h-4 w-4 mr-2" />{t('Add Equipment')}
                    </Button>
                </div>

                <div className="bg-white border rounded-lg divide-y">
                    {Array.isArray(items) && items.map((eq: Equipment) => (
                        <div key={eq.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                            <div className="flex items-center gap-3">
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
            </div>
            <CrudDeleteModal
                isOpen={deleteModalOpen}
                onClose={() => { setDeleteModalOpen(false); setEquipmentToDelete(null); }}
                onConfirm={handleDeleteConfirm}
                itemName={equipmentToDelete?.name}
                entityName={t('Equipment')}
            />
        </PageTemplate>
    );
}
