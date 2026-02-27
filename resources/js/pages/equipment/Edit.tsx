import { useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageTemplate } from '@/components/page-template';
import { useTranslation } from 'react-i18next';

interface Equipment {
    id: number;
    name: string;
    project_id: number;
    equipment_type_id: number;
    installation_date?: string;
    last_service_date?: string;
    health_status: string;
    notes?: string;
}

interface Props {
    equipment: Equipment;
    projects: { id: number; title: string }[];
    equipmentTypes: { id: number; name: string }[];
}

export default function EquipmentEdit({ equipment, projects, equipmentTypes }: Props) {
    const { t } = useTranslation();
    const { data, setData, put, processing, errors } = useForm({
        name: equipment.name,
        project_id: String(equipment.project_id),
        equipment_type_id: String(equipment.equipment_type_id),
        installation_date: equipment.installation_date?.slice(0, 10) || '',
        last_service_date: equipment.last_service_date?.slice(0, 10) || '',
        health_status: equipment.health_status || 'green',
        notes: equipment.notes || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('equipment.update', equipment.id));
    };

    const breadcrumbs = [
        { title: t('Dashboard'), href: route('dashboard') },
        { title: t('Equipment'), href: route('equipment.index') },
        { title: equipment.name, href: route('equipment.show', equipment.id) },
        { title: t('Edit') }
    ];

    return (
        <PageTemplate title={t('Edit Equipment')} url={`/equipment/${equipment.id}/edit`} breadcrumbs={breadcrumbs}>
            <form onSubmit={handleSubmit} className="max-w-md space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2">{t('Name')}</label>
                    <Input value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                    {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">{t('Branch')}</label>
                    <Select value={data.project_id} onValueChange={(v) => setData('project_id', v)} required>
                        <SelectTrigger><SelectValue placeholder={t('Select')} /></SelectTrigger>
                        <SelectContent>
                            {projects?.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.title}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">{t('Equipment Type')}</label>
                    <Select value={data.equipment_type_id} onValueChange={(v) => setData('equipment_type_id', v)} required>
                        <SelectTrigger><SelectValue placeholder={t('Select')} /></SelectTrigger>
                        <SelectContent>
                            {equipmentTypes?.map((et) => <SelectItem key={et.id} value={String(et.id)}>{et.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">{t('Health Status')}</label>
                    <Select value={data.health_status} onValueChange={(v) => setData('health_status', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="green">{t('Green')}</SelectItem>
                            <SelectItem value="yellow">{t('Yellow')}</SelectItem>
                            <SelectItem value="red">{t('Red')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">{t('Installation Date')}</label>
                    <Input type="date" value={data.installation_date} onChange={(e) => setData('installation_date', e.target.value)} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">{t('Last Service Date')}</label>
                    <Input type="date" value={data.last_service_date} onChange={(e) => setData('last_service_date', e.target.value)} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">{t('Notes')}</label>
                    <Input value={data.notes} onChange={(e) => setData('notes', e.target.value)} />
                </div>
                <div className="flex gap-2">
                    <Button type="submit" disabled={processing}>{t('Update')}</Button>
                    <Button type="button" variant="outline" onClick={() => router.visit(route('equipment.show', equipment.id))}>{t('Cancel')}</Button>
                </div>
            </form>
        </PageTemplate>
    );
}
