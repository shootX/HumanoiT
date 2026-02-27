import { useState, useEffect } from 'react';
import { router, usePage, useForm } from '@inertiajs/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Calendar, Pencil, Trash2 } from 'lucide-react';
import { PageTemplate } from '@/components/page-template';
import { toast } from '@/components/custom-toast';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { useTranslation } from 'react-i18next';

interface Schedule {
    id: number;
    equipment_id: number;
    service_type_id: number;
    equipment: { id: number; name: string; project?: { title: string } };
    service_type: string;
    interval_days: number;
    advance_days: number;
    last_service_date?: string;
    next_service_date?: string;
    task_due_date?: string;
}

interface EquipmentItem {
    id: number;
    name: string;
    project?: { title: string };
}

interface Props {
    schedules: Schedule[];
    projects: { id: number; title: string }[];
    equipmentTypes: { id: number; name: string }[];
    serviceTypes: { id: number; name: string }[];
    equipment: EquipmentItem[];
    filters: Record<string, string>;
    canManage?: boolean;
}

export default function EquipmentScheduleIndex({ schedules, projects, equipmentTypes, serviceTypes, equipment, filters, canManage }: Props) {
    const { t } = useTranslation();
    const { flash } = usePage().props as any;
    const [projectId, setProjectId] = useState(filters.project_id || 'all');
    const [typeId, setTypeId] = useState(filters.equipment_type_id || 'all');
    const [serviceId, setServiceId] = useState(filters.service_type_id || 'all');
    const [showModal, setShowModal] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [scheduleToDelete, setScheduleToDelete] = useState<Schedule | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        equipment_id: '',
        service_type_id: '',
        interval_days: '30',
        advance_days: '7',
        last_service_date: ''
    });

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const applyFilters = () => {
        const params: Record<string, string> = {};
        if (projectId !== 'all') params.project_id = projectId;
        if (typeId !== 'all') params.equipment_type_id = typeId;
        if (serviceId !== 'all') params.service_type_id = serviceId;
        router.get(route('equipment-schedule.index'), params);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingSchedule) {
            put(route('equipment-schedule.update', editingSchedule.id), {
                onSuccess: () => {
                    setShowModal(false);
                    setEditingSchedule(null);
                    reset({ equipment_id: '', service_type_id: '', interval_days: '30', advance_days: '7', last_service_date: '' });
                },
                onError: () => toast.error(t('Failed to update'))
            });
        } else {
            if (!data.equipment_id || !data.service_type_id) {
                toast.error(t('Please select Equipment and Service Type'));
                return;
            }
            post(route('equipment-schedule.store'), {
                onSuccess: () => {
                    setShowModal(false);
                    reset({ equipment_id: '', service_type_id: '', interval_days: '30', advance_days: '7', last_service_date: '' });
                },
                onError: () => toast.error(t('Failed to create'))
            });
        }
    };

    const handleEdit = (s: Schedule) => {
        setEditingSchedule(s);
        setData({
            equipment_id: String(s.equipment_id),
            service_type_id: String(s.service_type_id),
            interval_days: String(s.interval_days),
            advance_days: String(s.advance_days),
            last_service_date: s.last_service_date || ''
        });
        setShowModal(true);
    };

    const handleDeleteConfirm = () => {
        if (!scheduleToDelete) return;
        router.delete(route('equipment-schedule.destroy', scheduleToDelete.id), {
            onSuccess: () => {
                setDeleteModalOpen(false);
                setScheduleToDelete(null);
            }
        });
    };

    const breadcrumbs = [
        { title: t('Dashboard'), href: route('dashboard') },
        { title: t('Equipment'), href: route('equipment.index') },
        { title: t('Schedule') }
    ];

    return (
        <PageTemplate title={t('Equipment Schedule')} url="/equipment-schedule" breadcrumbs={breadcrumbs}>
            <div className="space-y-4">
                <div className="flex flex-wrap gap-4 items-center">
                    <Select value={projectId} onValueChange={setProjectId}>
                        <SelectTrigger className="w-40"><SelectValue placeholder={t('Branch')} /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('All')}</SelectItem>
                            {projects?.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.title}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={typeId} onValueChange={setTypeId}>
                        <SelectTrigger className="w-40"><SelectValue placeholder={t('Equipment Type')} /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('All')}</SelectItem>
                            {equipmentTypes?.map((et) => <SelectItem key={et.id} value={String(et.id)}>{et.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={serviceId} onValueChange={setServiceId}>
                        <SelectTrigger className="w-40"><SelectValue placeholder={t('Service Type')} /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('All')}</SelectItem>
                            {serviceTypes?.map((st) => <SelectItem key={st.id} value={String(st.id)}>{st.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Button type="button" variant="secondary" onClick={applyFilters}>{t('Filter')}</Button>
                    {canManage && (
                        <Button onClick={() => { setEditingSchedule(null); reset({ equipment_id: '', service_type_id: '', interval_days: '30', advance_days: '7', last_service_date: '' }); setShowModal(true); }}>
                            <Plus className="h-4 w-4 mr-2" />{t('Add Schedule')}
                        </Button>
                    )}
                </div>

                <div className="bg-white border rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left p-3">{t('Equipment')}</th>
                                <th className="text-left p-3">{t('Service')}</th>
                                <th className="text-left p-3">{t('Interval')}</th>
                                <th className="text-left p-3">{t('Next Service')}</th>
                                <th className="text-left p-3">{t('Task Due')}</th>
                                {canManage && <th className="text-right p-3">{t('Actions')}</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {schedules?.map((s) => (
                                <tr key={s.id} className="border-t hover:bg-gray-50">
                                    <td className="p-3">{s.equipment?.name} ({s.equipment?.project?.title})</td>
                                    <td className="p-3">{s.service_type}</td>
                                    <td className="p-3">{s.interval_days} {t('days')}</td>
                                    <td className="p-3">{s.next_service_date || '-'}</td>
                                    <td className="p-3">{s.task_due_date || '-'}</td>
                                    {canManage && (
                                        <td className="p-3 text-right">
                                            <div className="flex gap-2 justify-end">
                                                <Button variant="ghost" size="sm" onClick={() => handleEdit(s)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => { setScheduleToDelete(s); setDeleteModalOpen(true); }}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {(!schedules || schedules.length === 0) && (
                        <div className="p-12 text-center text-muted-foreground">
                            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>{t('No schedules')}</p>
                            {canManage && (
                                <Button className="mt-4" onClick={() => setShowModal(true)}>
                                    <Plus className="h-4 w-4 mr-2" />{t('Add First Schedule')}
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={showModal} onOpenChange={(o) => { setShowModal(o); if (!o) { setEditingSchedule(null); reset({ equipment_id: '', service_type_id: '', interval_days: '30', advance_days: '7', last_service_date: '' }); } }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingSchedule ? t('Edit Schedule') : t('Add Schedule')}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!editingSchedule ? (
                            <>
                                <div>
                                    <label className="block text-sm font-medium mb-2">{t('Equipment')}</label>
                                    <Select value={data.equipment_id} onValueChange={(v) => setData('equipment_id', v)} required>
                                        <SelectTrigger><SelectValue placeholder={t('Select')} /></SelectTrigger>
                                        <SelectContent>
                                            {equipment?.map((e) => (
                                                <SelectItem key={e.id} value={String(e.id)}>
                                                    {e.name} {e.project ? `(${e.project.title})` : ''}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.equipment_id && <p className="text-sm text-destructive mt-1">{errors.equipment_id}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">{t('Service Type')}</label>
                                    <Select value={data.service_type_id} onValueChange={(v) => setData('service_type_id', v)} required>
                                        <SelectTrigger><SelectValue placeholder={t('Select')} /></SelectTrigger>
                                        <SelectContent>
                                            {serviceTypes?.map((st) => <SelectItem key={st.id} value={String(st.id)}>{st.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    {errors.service_type_id && <p className="text-sm text-destructive mt-1">{errors.service_type_id}</p>}
                                </div>
                            </>
                        ) : (
                            <div className="text-sm text-muted-foreground py-2">
                                <p><strong>{t('Equipment')}:</strong> {editingSchedule.equipment?.name} ({editingSchedule.equipment?.project?.title})</p>
                                <p><strong>{t('Service')}:</strong> {editingSchedule.service_type}</p>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium mb-2">{t('Interval')} ({t('days')})</label>
                            <Input type="number" min={1} value={data.interval_days} onChange={(e) => setData('interval_days', e.target.value)} required />
                            {errors.interval_days && <p className="text-sm text-destructive mt-1">{errors.interval_days}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">{t('Advance')} ({t('days')})</label>
                            <Input type="number" min={0} value={data.advance_days} onChange={(e) => setData('advance_days', e.target.value)} required />
                            {errors.advance_days && <p className="text-sm text-destructive mt-1">{errors.advance_days}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">{t('Last Service Date')}</label>
                            <Input type="date" value={data.last_service_date} onChange={(e) => setData('last_service_date', e.target.value)} />
                </div>
                        <div className="flex gap-2 justify-end">
                            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>{t('Cancel')}</Button>
                            <Button type="submit" disabled={processing}>{editingSchedule ? t('Update') : t('Create')}</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <CrudDeleteModal
                isOpen={deleteModalOpen}
                onClose={() => { setDeleteModalOpen(false); setScheduleToDelete(null); }}
                onConfirm={handleDeleteConfirm}
                itemName={scheduleToDelete ? `${scheduleToDelete.equipment?.name} - ${scheduleToDelete.service_type}` : ''}
                entityName={t('Schedule')}
            />
        </PageTemplate>
    );
}
