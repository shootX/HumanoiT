import React, { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Ruler } from 'lucide-react';
import { PageTemplate } from '@/components/page-template';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { toast } from '@/components/custom-toast';
import { useTranslation } from 'react-i18next';
import { Unit } from '@/types';

export default function UnitsIndex() {
    const { t } = useTranslation();
    const { units, permissions, flash } = usePage().props as any;

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
    const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        short_name: '',
    });

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const handleAddNew = () => {
        setEditingUnit(null);
        setFormData({ name: '', short_name: '' });
        setIsFormModalOpen(true);
    };

    const handleEdit = (unit: Unit) => {
        setEditingUnit(unit);
        setFormData({ name: unit.name, short_name: unit.short_name });
        setIsFormModalOpen(true);
    };

    const handleDelete = (unit: Unit) => {
        setUnitToDelete(unit);
        setIsDeleteModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUnit) {
            router.put(route('units.update', editingUnit.id), formData, {
                onSuccess: () => setIsFormModalOpen(false),
            });
        } else {
            router.post(route('units.store'), formData, {
                onSuccess: () => setIsFormModalOpen(false),
            });
        }
    };

    const handleDeleteConfirm = () => {
        if (unitToDelete) {
            router.delete(route('units.destroy', unitToDelete.id), {
                onSuccess: () => setIsDeleteModalOpen(false),
            });
        }
    };

    const pageActions = [];
    if (permissions.create) {
        pageActions.push({
            label: t('Add Unit'),
            icon: <Plus className="h-4 w-4 mr-2" />,
            variant: 'default' as const,
            onClick: handleAddNew,
        });
    }

    const breadcrumbs = [
        { title: t('Dashboard'), href: route('dashboard') },
        { title: t('Assets'), href: route('assets.index') },
        { title: t('Units of Measurement') },
    ];

    return (
        <PageTemplate title={t('Units of Measurement')} url="/units" actions={pageActions} breadcrumbs={breadcrumbs}>
            <Card>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('Name')}</TableHead>
                                <TableHead>{t('Short Name')}</TableHead>
                                <TableHead className="text-center">{t('Assets Count')}</TableHead>
                                <TableHead className="text-right">{t('Actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {units.map((unit: Unit) => (
                                <TableRow key={unit.id}>
                                    <TableCell className="font-medium">{unit.name}</TableCell>
                                    <TableCell>{unit.short_name}</TableCell>
                                    <TableCell className="text-center">{unit.assets_count}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {permissions.update && (
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(unit)} className="text-amber-500 h-8 w-8">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            )}
                                            {permissions.delete && (
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(unit)} className="text-red-500 h-8 w-8">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {units.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                        {t('No units found.')}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingUnit ? t('Edit Unit') : t('Add Unit')}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">{t('Name')} *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="short_name">{t('Short Name')} *</Label>
                            <Input
                                id="short_name"
                                value={formData.short_name}
                                onChange={(e) => setFormData({ ...formData, short_name: e.target.value })}
                                required
                                placeholder="e.g. kg, L, pc"
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsFormModalOpen(false)}>{t('Cancel')}</Button>
                            <Button type="submit">{editingUnit ? t('Update') : t('Create')}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <CrudDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                itemName={unitToDelete?.name || ''}
                entityName={t('unit')}
            />
        </PageTemplate>
    );
}
