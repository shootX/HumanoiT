import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { Asset, Project } from '@/types';

const ASSET_STATUSES = ['active', 'maintenance', 'retired'] as const;

interface AssetCategory {
    id: number;
    name: string;
    color?: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    asset?: Asset;
    projects: Project[];
    assetCategories?: AssetCategory[];
    onSubmit: (data: Record<string, unknown>) => void;
}

export default function AssetFormModal({ isOpen, onClose, asset, projects, assetCategories = [], onSubmit }: Props) {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        quantity: '1',
        asset_code: '',
        asset_category_id: '' as string,
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
                quantity: String(asset.quantity ?? 1),
                asset_code: asset.asset_code || '',
                asset_category_id: asset.asset_category_id?.toString() || 'none',
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
                quantity: '1',
                asset_code: '',
                asset_category_id: 'none',
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
            quantity: parseInt(formData.quantity, 10) || 1,
            asset_code: formData.asset_code || null,
            asset_category_id: formData.asset_category_id && formData.asset_category_id !== 'none' ? formData.asset_category_id : null,
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
                        <Label htmlFor="quantity">{t('Quantity')}</Label>
                        <Input
                            id="quantity"
                            type="number"
                            min={1}
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value || '1' })}
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
                        <Label htmlFor="asset_category_id">{t('Category')}</Label>
                        <Select value={formData.asset_category_id || 'none'} onValueChange={(v) => setFormData({ ...formData, asset_category_id: v })}>
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder={t('Select category')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">{t('None')}</SelectItem>
                                {assetCategories.map((c) => (
                                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
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
