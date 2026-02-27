import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageTemplate } from '@/components/page-template';
import { useTranslation } from 'react-i18next';
import { toast } from '@/components/custom-toast';

interface Props {
    projects: { id: number; title: string }[];
    equipmentTypes: { id: number; name: string }[];
}

export default function EquipmentCreate({ projects, equipmentTypes }: Props) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        project_id: '',
        equipment_type_id: '',
        installation_date: '',
        last_service_date: '',
        health_status: 'green',
        notes: ''
    });

    useEffect(() => {
        const err = Object.values(errors)[0];
        if (err) toast.error(String(err));
    }, [errors]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.project_id || !data.equipment_type_id) {
            toast.error(t('Please select Branch and Equipment Type'));
            return;
        }
        post(route('equipment.store'));
    };

    const breadcrumbs = [
        { title: t('Dashboard'), href: route('dashboard') },
        { title: t('Equipment'), href: route('equipment.index') },
        { title: t('Add Equipment') }
    ];

    const canCreate = (projects?.length ?? 0) > 0 && (equipmentTypes?.length ?? 0) > 0;

    return (
        <PageTemplate title={t('Add Equipment')} url="/equipment/create" breadcrumbs={breadcrumbs}>
            {!canCreate && (
                <div className="mb-4 p-4 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                    {t('Please create at least one Branch (Project) and Equipment Type first.')}
                </div>
            )}
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
                    {errors.project_id && <p className="text-sm text-destructive mt-1">{errors.project_id}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">{t('Equipment Type')}</label>
                    <Select value={data.equipment_type_id} onValueChange={(v) => setData('equipment_type_id', v)} required>
                        <SelectTrigger><SelectValue placeholder={t('Select')} /></SelectTrigger>
                        <SelectContent>
                            {equipmentTypes?.map((et) => <SelectItem key={et.id} value={String(et.id)}>{et.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    {errors.equipment_type_id && <p className="text-sm text-destructive mt-1">{errors.equipment_type_id}</p>}
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
                    <Button type="submit" disabled={processing || !canCreate}>{t('Create')}</Button>
                    <Button type="button" variant="outline" onClick={() => window.history.back()}>{t('Cancel')}</Button>
                </div>
            </form>
        </PageTemplate>
    );
}
