import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
const STATUS_OPTIONS = [
    { value: 'repaired', labelKey: 'warranty_status_repaired' },
    { value: 'not_repaired', labelKey: 'warranty_status_not_repaired' },
    { value: 'not_done', labelKey: 'warranty_status_not_done' },
    { value: 'not_warranty_case', labelKey: 'warranty_status_not_warranty_case' },
];

interface WarrantyCase {
    id: number;
    asset_id: number;
    damage_description: string | null;
    comment: string | null;
    status: string;
    reported_at: string | null;
    created_at: string;
}

interface Props {
    asset: { id: number };
    warrantyCases: WarrantyCase[];
    canEdit?: boolean;
}

export default function AssetWarrantyCases({ asset, warrantyCases, canEdit = true }: Props) {
    const { t } = useTranslation();
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingCase, setEditingCase] = useState<WarrantyCase | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [caseToDelete, setCaseToDelete] = useState<WarrantyCase | null>(null);

    const [formData, setFormData] = useState({
        damage_description: '',
        comment: '',
        status: 'repaired',
        reported_at: new Date().toISOString().split('T')[0],
    });

    const resetForm = () => {
        setFormData({
            damage_description: '',
            comment: '',
            status: 'repaired',
            reported_at: new Date().toISOString().split('T')[0],
        });
        setShowAddForm(false);
        setEditingCase(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCase) {
            router.put(route('asset-warranty-cases.update', editingCase.id), {
                damage_description: formData.damage_description || null,
                comment: formData.comment || null,
                status: formData.status,
                reported_at: formData.reported_at || null,
            }, { onSuccess: resetForm });
        } else {
            router.post(route('asset-warranty-cases.store', asset.id), {
                damage_description: formData.damage_description || null,
                comment: formData.comment || null,
                status: formData.status,
                reported_at: formData.reported_at || null,
            }, { onSuccess: resetForm });
        }
    };

    const handleEdit = (wc: WarrantyCase) => {
        setEditingCase(wc);
        setFormData({
            damage_description: wc.damage_description || '',
            comment: wc.comment || '',
            status: wc.status,
            reported_at: wc.reported_at ? wc.reported_at.split('T')[0] : new Date().toISOString().split('T')[0],
        });
    };

    const handleDelete = (wc: WarrantyCase) => {
        setCaseToDelete(wc);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (caseToDelete) {
            router.delete(route('asset-warranty-cases.destroy', caseToDelete.id), {
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setCaseToDelete(null);
                },
            });
        }
    };

    const getStatusLabel = (status: string) => t(`warranty_status_${status}`);
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'repaired': return 'bg-green-100 text-green-800';
            case 'not_repaired': return 'bg-red-100 text-red-800';
            case 'not_done': return 'bg-amber-100 text-amber-800';
            case 'not_warranty_case': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-4">
            {warrantyCases.length > 0 && (
                <div className="space-y-3">
                    {warrantyCases.map((wc) => (
                        <Card key={wc.id}>
                            <CardContent className="pt-4">
                                <div className="flex justify-between items-start gap-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-2">
                                            <span className="text-sm text-muted-foreground">
                                                {wc.reported_at ? new Date(wc.reported_at).toLocaleDateString() : '—'}
                                            </span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(wc.status)}`}>
                                                {getStatusLabel(wc.status)}
                                            </span>
                                        </div>
                                        {wc.damage_description && (
                                            <p className="text-sm mb-1"><span className="font-medium text-muted-foreground">{t('Damage description')}:</span> {wc.damage_description}</p>
                                        )}
                                        {wc.comment && (
                                            <p className="text-sm text-muted-foreground">{wc.comment}</p>
                                        )}
                                    </div>
                                    {canEdit && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEdit(wc)}>
                                                    <Pencil className="h-4 w-4 mr-2" />
                                                    {t('Edit')}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDelete(wc)} className="text-red-600">
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    {t('Delete')}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {canEdit && (
                <>
                    {showAddForm || editingCase ? (
                        <Card>
                            <CardContent className="pt-4">
                                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>{t('Damage description')}</Label>
                                        <textarea
                                            value={formData.damage_description}
                                            onChange={(e) => setFormData(prev => ({ ...prev, damage_description: e.target.value }))}
                                            placeholder={t('Type text here')}
                                            rows={5}
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t('Comment')}</Label>
                                        <textarea
                                            value={formData.comment}
                                            onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                                            placeholder={t('Type text here')}
                                            rows={5}
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>{t('Status')}</Label>
                                            <Select value={formData.status} onValueChange={(v) => setFormData(prev => ({ ...prev, status: v }))}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {STATUS_OPTIONS.map((opt) => (
                                                        <SelectItem key={opt.value} value={opt.value}>
                                                            {t(opt.labelKey)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t('Date')}</Label>
                                            <Input
                                                type="date"
                                                value={formData.reported_at}
                                                onChange={(e) => setFormData(prev => ({ ...prev, reported_at: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button type="button" onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}>{editingCase ? t('Update') : t('Add')}</Button>
                                        <Button type="button" variant="outline" onClick={resetForm}>{t('Cancel')}</Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    ) : (
                        <Button type="button" variant="outline" onClick={() => setShowAddForm(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            {t('Add warranty case')}
                        </Button>
                    )}
                </>
            )}

            {!canEdit && warrantyCases.length === 0 && (
                <p className="text-sm text-muted-foreground">{t('No warranty cases recorded')}</p>
            )}

            <CrudDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => { setIsDeleteModalOpen(false); setCaseToDelete(null); }}
                onConfirm={handleDeleteConfirm}
                itemName={caseToDelete?.damage_description?.slice(0, 50) || 'warranty case'}
                entityName="warranty_case"
            />
        </div>
    );
}
