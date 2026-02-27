import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { router } from '@inertiajs/react';
import { Wrench, Circle, Pencil, Trash2 } from 'lucide-react';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { PageTemplate } from '@/components/page-template';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { toast } from '@/components/custom-toast';
import { useTranslation } from 'react-i18next';

interface Equipment {
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
    canDelete?: boolean;
}

export default function EquipmentShow({ equipment, completedServices, upcomingSchedules, canDelete }: Props) {
    const { t } = useTranslation();
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
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
                            <h1 className="text-2xl font-bold">{equipment.name}</h1>
                            <p className="text-muted-foreground">{equipment.project?.title} | {equipment.equipment_type?.name}</p>
                            <Badge variant={healthColor as 'default'} className="mt-2">
                                <Circle className="h-2 w-2 mr-1 fill-current" />
                                {t('Health')}: {equipment.health_status}
                            </Badge>
                            <div className="flex gap-2 mt-2">
                                <Button variant="outline" size="sm" onClick={() => router.get(route('equipment.edit', equipment.id))}>
                                    <Pencil className="h-4 w-4 mr-2" />{t('Edit')}
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
                                {(completedServices as { id: number; end_date?: string }[]).slice(0, 5).map((s) => (
                                    <li key={s.id} className="text-sm">{s.end_date || '-'}</li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-muted-foreground text-sm">{t('No completed services')}</p>
                        )}
                    </div>
                </div>
            </div>
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
