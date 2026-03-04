import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { router, useForm } from '@inertiajs/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Wrench, Circle, Trash2, Plus, Calendar, List } from 'lucide-react';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { PageTemplate } from '@/components/page-template';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { toast } from '@/components/custom-toast';
import { useTranslation } from 'react-i18next';

interface Equipment {
    code?: string;
    id: number;
    name: string;
    health_status: string;
    qr_token: string;
    qr_url?: string;
    installation_date?: string;
    last_service_date?: string;
    notes?: string;
    project?: { id: number; title: string };
    equipment_type?: { id: number; name: string };
}

interface Props {
    equipment: Equipment;
    completedServices: unknown[];
    upcomingSchedules: { id: number; service_type: string; next_service_date?: string; task_due_date?: string }[];
    serviceTypes: { id: number; name: string }[];
    canDelete?: boolean;
    canManage?: boolean;
}

export default function EquipmentShow({ equipment, completedServices, upcomingSchedules, serviceTypes, canDelete, canManage }: Props) {
    const { t } = useTranslation();
    const { flash } = usePage().props as any;
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [addScheduleModalOpen, setAddScheduleModalOpen] = useState(false);

    const scheduleForm = useForm({
        equipment_id: String(equipment.id),
        service_type_id: '',
        interval_days: '30',
        advance_days: '7',
        last_service_date: ''
    });

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const handleAddSchedule = (e: React.FormEvent) => {
        e.preventDefault();
        if (!scheduleForm.data.service_type_id) {
            toast.error(t('Please select Service Type'));
            return;
        }
        scheduleForm.post(route('equipment-schedule.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setAddScheduleModalOpen(false);
                scheduleForm.reset();
            },
            onError: () => toast.error(t('Failed to create schedule'))
        });
    };
    const healthColor = equipment.health_status === 'green' ? 'green' : equipment.health_status === 'yellow' ? 'yellow' : 'destructive';

    const breadcrumbs = [
        { title: t('Dashboard'), href: route('dashboard') },
        { title: t('Equipment'), href: route('equipment.index') },
        { title: equipment.name }
    ];

    const qrUrl = equipment.qr_token ? (() => {
        const r = route('equipment.show-by-qr', equipment.qr_token);
        return r.startsWith('http') ? r : `${window.location.origin}${r.startsWith('/') ? r : '/' + r}`;
    })() : null;

    return (
        <PageTemplate title={equipment.name} url={`/equipment/${equipment.id}`} breadcrumbs={breadcrumbs}>
            <div className="space-y-6">
                <div className="flex flex-wrap gap-4 items-start justify-between">
                    <div className="flex items-center gap-3">
                        <Wrench className="h-10 w-10 text-gray-400" />
                        <div>
                            <h1 className="text-2xl font-bold">{equipment.code ? `${equipment.code} – ${equipment.name}` : equipment.name}</h1>
                            <p className="text-muted-foreground">{equipment.project?.title} | {equipment.equipment_type?.name}</p>
                            <Badge variant={healthColor as 'default'} className="mt-2">
                                <Circle className="h-2 w-2 mr-1 fill-current" />
                                {t('Health')}: {equipment.health_status}
                            </Badge>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {canManage && (
                                    <Button variant="outline" size="sm" onClick={() => setAddScheduleModalOpen(true)}>
                                        <Plus className="h-4 w-4 mr-2" />{t('Add Schedule')}
                                    </Button>
                                )}
                                <Button variant="outline" size="sm" onClick={() => router.get(route('equipment-schedule.index'), equipment.project?.id ? { project_id: String(equipment.project.id) } : {})}>
                                    <Calendar className="h-4 w-4 mr-2" />{t('Schedule')}
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => router.get(route('equipment.index'))}>
                                    <List className="h-4 w-4 mr-2" />{t('Equipment')}
                                </Button>
                                {canDelete && (
                                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeleteModalOpen(true)}>
                                        <Trash2 className="h-4 w-4 mr-2" />{t('Delete')}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                    {qrUrl && (
                        <div className="p-4 bg-white border rounded-lg">
                            <p className="text-sm font-medium mb-2">{t('QR Code')}</p>
                            <div className="flex justify-center p-2 bg-white rounded">
                                <QRCodeGenerator value={qrUrl} size={160} />
                            </div>
                            <p className="text-xs text-muted-foreground mt-2 text-center">{t('Scan to view')}</p>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white border rounded-lg p-4">
                        <h3 className="font-semibold mb-2">{t('Upcoming Services')}</h3>
                        {upcomingSchedules?.length ? (
                            <ul className="space-y-2">
                                {upcomingSchedules.map((s) => (
                                    <li key={s.id} className="flex justify-between text-sm">
                                        <span>{s.service_type}</span>
                                        <span>{s.next_service_date || '-'}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-muted-foreground text-sm">{t('No schedules')}</p>
                        )}
                    </div>
                    <div className="bg-white border rounded-lg p-4">
                        <h3 className="font-semibold mb-2">{t('Recent Services')}</h3>
                        {completedServices?.length ? (
                            <ul className="space-y-2">
                                {(completedServices as { id: number; end_date?: string; title?: string; equipment_schedule?: { service_type?: { name: string } } }[]).map((s) => (
                                    <li key={s.id} className="flex justify-between text-sm">
                                        <span>{s.equipment_schedule?.service_type?.name || s.title || '-'}</span>
                                        <span>{s.end_date || '-'}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-muted-foreground text-sm">{t('No completed services')}</p>
                        )}
                    </div>
                </div>
            </div>
            <Dialog open={addScheduleModalOpen} onOpenChange={(o) => { setAddScheduleModalOpen(o); if (!o) scheduleForm.reset(); }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t('Add Schedule')}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddSchedule} className="space-y-4">
                        <div className="text-sm text-muted-foreground py-1">
                            <p><strong>{t('Equipment')}:</strong> {equipment.code ? `${equipment.code} – ` : ''}{equipment.name}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">{t('Service Type')}</label>
                            <Select value={scheduleForm.data.service_type_id} onValueChange={(v) => scheduleForm.setData('service_type_id', v)} required>
                                <SelectTrigger><SelectValue placeholder={t('Select')} /></SelectTrigger>
                                <SelectContent>
                                    {serviceTypes?.map((st) => <SelectItem key={st.id} value={String(st.id)}>{st.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">{t('Interval')} ({t('days')})</label>
                            <Input type="number" min={1} value={scheduleForm.data.interval_days} onChange={(e) => scheduleForm.setData('interval_days', e.target.value)} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">{t('Advance')} ({t('days')})</label>
                            <Input type="number" min={0} value={scheduleForm.data.advance_days} onChange={(e) => scheduleForm.setData('advance_days', e.target.value)} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">{t('Last Service Date')}</label>
                            <Input type="date" value={scheduleForm.data.last_service_date} onChange={(e) => scheduleForm.setData('last_service_date', e.target.value)} />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button type="button" variant="outline" onClick={() => setAddScheduleModalOpen(false)}>{t('Cancel')}</Button>
                            <Button type="submit" disabled={scheduleForm.processing}>{t('Create')}</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <CrudDeleteModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={() => {
                    toast.loading(t('Deleting equipment...'));
                    router.delete(route('equipment.destroy', equipment.id), {
                        onSuccess: () => {
                            toast.dismiss();
                            router.visit(route('equipment.index'));
                        },
                        onError: () => toast.dismiss(),
                    });
                    setDeleteModalOpen(false);
                }}
                itemName={equipment.name}
                entityName={t('Equipment')}
            />
        </PageTemplate>
    );
}
