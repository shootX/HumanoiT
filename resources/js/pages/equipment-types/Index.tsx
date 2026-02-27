import React, { useState, useEffect } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { toast } from '@/components/custom-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Wrench, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { PageTemplate } from '@/components/page-template';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useTranslation } from 'react-i18next';

interface EquipmentType {
    id: number;
    name: string;
    order: number;
    equipment_count: number;
}

interface Props {
    types: EquipmentType[];
    permissions?: Record<string, boolean>;
}

export default function Index({ types, permissions }: Props) {
    const { t } = useTranslation();
    const { flash } = usePage().props as any;
    const permissionsObj = permissions || {};
    const [showModal, setShowModal] = useState(false);
    const [editingType, setEditingType] = useState<EquipmentType | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [typeToDelete, setTypeToDelete] = useState<EquipmentType | null>(null);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingType) {
            put(route('equipment-types.update', editingType.id), {
                onSuccess: () => {
                    setShowModal(false);
                    setEditingType(null);
                    reset();
                },
                onError: () => toast.error(t('Failed to update'))
            });
        } else {
            post(route('equipment-types.store'), {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
                onError: () => toast.error(t('Failed to create'))
            });
        }
    };

    const handleEdit = (type: EquipmentType) => {
        setEditingType(type);
        setData({ name: type.name });
        setShowModal(true);
    };

    const handleDelete = (type: EquipmentType) => {
        setTypeToDelete(type);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (typeToDelete) {
            destroy(route('equipment-types.destroy', typeToDelete.id), {
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setTypeToDelete(null);
                }
            });
        }
    };

    const breadcrumbs = [
        { title: t('Dashboard'), href: route('dashboard') },
        { title: t('Equipment'), href: route('equipment.index') },
        { title: t('Equipment Types') }
    ];

    return (
        <PageTemplate title={t('Equipment Types')} url="/equipment-types" breadcrumbs={breadcrumbs}>
            <Head title={t('Equipment Types')} />
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">{t('Equipment Types')}</h2>
                    {permissionsObj?.create && (
                        <Button onClick={() => { setEditingType(null); reset(); setShowModal(true); }}>
                            <Plus className="h-4 w-4 mr-2" />
                            {t('Add Type')}
                        </Button>
                    )}
                </div>
                <div className="bg-white border rounded-lg divide-y">
                    {types.map((type) => (
                        <div key={type.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                                <Wrench className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="font-medium">{type.name}</p>
                                    <p className="text-sm text-muted-foreground">{type.equipment_count || 0} {t('equipment')}</p>
                                </div>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {permissionsObj?.update && (
                                        <DropdownMenuItem onClick={() => handleEdit(type)}>
                                            <Edit className="h-4 w-4 mr-2" />{t('Edit')}
                                        </DropdownMenuItem>
                                    )}
                                    {permissionsObj?.delete && (type.equipment_count || 0) === 0 && (
                                        <DropdownMenuItem onClick={() => handleDelete(type)} className="text-destructive">
                                            <Trash2 className="h-4 w-4 mr-2" />{t('Delete')}
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ))}
                    {types.length === 0 && (
                        <div className="p-12 text-center text-muted-foreground">
                            <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>{t('No equipment types yet')}</p>
                            {permissionsObj?.create && (
                                <Button className="mt-4" onClick={() => setShowModal(true)}>
                                    <Plus className="h-4 w-4 mr-2" />{t('Add First Type')}
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={showModal} onOpenChange={(o) => { setShowModal(o); if (!o) { setEditingType(null); reset(); } }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingType ? t('Edit Type') : t('Create Type')}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">{t('Name')}</label>
                            <Input value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder={t('e.g. Air Conditioner')} required />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>{t('Cancel')}</Button>
                            <Button type="submit">{editingType ? t('Update') : t('Create')}</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <CrudDeleteModal isOpen={isDeleteModalOpen} onClose={() => { setIsDeleteModalOpen(false); setTypeToDelete(null); }} onConfirm={handleDeleteConfirm} itemName={typeToDelete?.name || ''} entityName={t('equipment type')} />
        </PageTemplate>
    );
}
