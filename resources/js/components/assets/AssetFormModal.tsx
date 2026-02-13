import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { Asset, Project } from '@/types';

const ASSET_TYPES = ['hvac', 'elevator', 'electrical', 'plumbing', 'generator', 'other'] as const;
const ASSET_STATUSES = ['active', 'maintenance', 'retired'] as const;

interface Props {
    isOpen: boolean;
    onClose: () => void;
    asset?: Asset;
    projects: Project[];
    onSubmit: (data: Record<string, unknown>) => void;
}

export default function AssetFormModal({ isOpen, onClose, asset, projects, onSubmit }: Props) {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        asset_code: '',
        type: 'other' as string,
        location: '',
        project_id: '' as string,
        purchase_date: '',
        warranty_until: '',
        status: 'active' as string,
        notes: '',
    });

    useEffect(() => {
        if (asset) {
            setFormData({
                name: asset.name,
                asset_code: asset.asset_code || '',
                type: asset.type,
                location: asset.location || '',
                project_id: asset.project_id?.toString() || 'none',
                purchase_date: asset.purchase_date ? String(asset.purchase_date).split('T')[0] : '',
                warranty_until: asset.warranty_until ? String(asset.warranty_until).split('T')[0] : '',
                status: asset.status,
                notes: asset.notes || '',
            });
        } else {
            setFormData({
                name: '',
                asset_code: '',
                type: 'other',
                location: '',
                project_id: 'none',
                purchase_date: '',
                warranty_until: '',
                status: 'active',
                notes: '',
            });
        }
    }, [asset, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data: Record<string, unknown> = {
            name: formData.name,
            asset_code: formData.asset_code || null,
            type: formData.type,
            location: formData.location || null,
            project_id: formData.project_id && formData.project_id !== 'none' ? formData.project_id : null,
            purchase_date: formData.purchase_date || null,
            warranty_until: formData.warranty_until || null,
            status: formData.status,
            notes: formData.notes || null,
        };
        onSubmit(data);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{asset ? t('Edit Asset') : t('Add Asset')}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="name">{t('Name')} *</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label htmlFor="asset_code">{t('Asset Code')}</Label>
                        <Input
                            id="asset_code"
                            value={formData.asset_code}
                            onChange={(e) => setFormData({ ...formData, asset_code: e.target.value })}
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label htmlFor="type">{t('Type')} *</Label>
                        <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                            <SelectTrigger className="mt-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {ASSET_TYPES.map((type) => (
                                    <SelectItem key={type} value={type}>{t(`asset_type_${type}`)}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="location">{t('Location')}</Label>
                        <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label htmlFor="project_id">{t('Project')}</Label>
                        <Select value={formData.project_id || 'none'} onValueChange={(v) => setFormData({ ...formData, project_id: v })}>
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder={t('Select project')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">{t('None')}</SelectItem>
                                {projects.map((p) => (
                                    <SelectItem key={p.id} value={String(p.id)}>{p.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="purchase_date">{t('Purchase Date')}</Label>
                            <Input
                                id="purchase_date"
                                type="date"
                                value={formData.purchase_date}
                                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="warranty_until">{t('Warranty Until')}</Label>
                            <Input
                                id="warranty_until"
                                type="date"
                                value={formData.warranty_until}
                                onChange={(e) => setFormData({ ...formData, warranty_until: e.target.value })}
                                className="mt-1"
                            />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="status">{t('Status')} *</Label>
                        <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                            <SelectTrigger className="mt-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {ASSET_STATUSES.map((status) => (
                                    <SelectItem key={status} value={status}>{t(`asset_status_${status}`)}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="notes">{t('Notes')}</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={3}
                            className="mt-1"
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={onClose}>{t('Cancel')}</Button>
                        <Button type="submit">{asset ? t('Update') : t('Create')}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
