import React, { useState, useEffect } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { toast } from '@/components/custom-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Package, Trash2, GripVertical, MoreHorizontal, Edit } from 'lucide-react';
import { PageTemplate } from '@/components/page-template';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useTranslation } from 'react-i18next';

interface AssetCategory {
    id: number;
    name: string;
    color: string;
    order: number;
    assets_count: number;
}

interface Props {
    categories: AssetCategory[];
    permissions?: Record<string, boolean>;
}

export default function Index({ categories, permissions }: Props) {
    const { t } = useTranslation();
    const { flash } = usePage().props as any;
    const permissionsObj = permissions || {};
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<AssetCategory | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<AssetCategory | null>(null);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        color: '#3B82F6'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCategory) {
            put(route('asset-categories.update', editingCategory.id), {
                onSuccess: () => {
                    setShowModal(false);
                    setEditingCategory(null);
                    reset();
                },
                onError: () => toast.error(t('Failed to update category'))
            });
        } else {
            post(route('asset-categories.store'), {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
                onError: () => toast.error(t('Failed to create category'))
            });
        }
    };

    const handleEdit = (category: AssetCategory) => {
        setEditingCategory(category);
        setData({ name: category.name, color: category.color });
        setShowModal(true);
    };

    const handleDelete = (category: AssetCategory) => {
        setCategoryToDelete(category);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (categoryToDelete) {
            destroy(route('asset-categories.destroy', categoryToDelete.id), {
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setCategoryToDelete(null);
                }
            });
        }
    };

    const handleDragStart = (e: React.DragEvent, category: AssetCategory) => {
        e.dataTransfer.setData('text/plain', category.id.toString());
        e.dataTransfer.effectAllowed = 'move';
        (e.target as HTMLElement).style.opacity = '0.5';
    };

    const handleDragEnd = (e: React.DragEvent) => {
        (e.target as HTMLElement).style.opacity = '1';
        document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        (e.currentTarget as HTMLElement).classList.add('drag-over');
    };

    const handleDragLeave = (e: React.DragEvent) => {
        (e.currentTarget as HTMLElement).classList.remove('drag-over');
    };

    const handleDrop = (e: React.DragEvent, targetCategory: AssetCategory) => {
        e.preventDefault();
        (e.currentTarget as HTMLElement).classList.remove('drag-over');
        const draggedId = e.dataTransfer.getData('text/plain');
        if (draggedId && draggedId !== targetCategory.id.toString()) {
            const dragged = categories.find(c => c.id.toString() === draggedId);
            if (dragged) {
                const reordered = [...categories];
                const draggedIdx = reordered.findIndex(c => c.id === dragged.id);
                const targetIdx = reordered.findIndex(c => c.id === targetCategory.id);
                if (draggedIdx !== -1 && targetIdx !== -1) {
                    reordered.splice(draggedIdx, 1);
                    reordered.splice(targetIdx, 0, dragged);
                    router.post(route('asset-categories.reorder'), {
                        categories: reordered.map((c, i) => ({ id: c.id, order: i + 1 }))
                    }, { preserveState: true });
                }
            }
        }
    };

    const openCreateModal = () => {
        setEditingCategory(null);
        reset();
        setShowModal(true);
    };

    const pageActions = permissionsObj?.create ? [{
        label: t('Add Category'),
        icon: <Plus className="h-4 w-4 mr-2" />,
        variant: 'default' as const,
        onClick: openCreateModal
    }] : [];

    const breadcrumbs = [
        { title: t('Dashboard'), href: route('dashboard') },
        { title: t('Assets'), href: route('assets.index') },
        { title: t('Asset Categories') }
    ];

    return (
        <PageTemplate title={t('Asset Categories')} url="/asset-categories" actions={pageActions} breadcrumbs={breadcrumbs}>
            <Head title={t('Asset Categories')} />
            <style>{`
                .drag-over { border-color: #3b82f6 !important; background-color: #eff6ff !important; transform: scale(1.02); }
            `}</style>

            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white border rounded-lg p-6 shadow-sm">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Package className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">{t('Total Categories')}</p>
                                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border rounded-lg p-6 shadow-sm">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Package className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">{t('Total Assets')}</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {categories.reduce((sum, c) => sum + (c.assets_count || 0), 0)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="flex items-center mb-4">
                        <h2 className="text-xl font-semibold">{t('Asset Categories')}</h2>
                        <span className="ml-2 text-sm text-muted-foreground">({t('Drag to reorder')})</span>
                    </div>
                    <div className="space-y-3">
                        {categories.map((category) => (
                            <div
                                key={category.id}
                                className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                                draggable
                                onDragStart={(e) => handleDragStart(e, category)}
                                onDragEnd={handleDragEnd}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, category)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="cursor-move p-1 hover:bg-gray-100 rounded">
                                            <GripVertical className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <div
                                            className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                                            style={{ backgroundColor: category.color }}
                                        />
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{category.name}</h3>
                                            <p className="text-sm text-gray-500">{t('Order')}: {category.order}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="text-right">
                                            <p className="text-lg font-semibold text-gray-900">{category.assets_count || 0}</p>
                                            <p className="text-sm text-gray-500">{t('assets')}</p>
                                        </div>
                                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">{category.color}</code>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {permissionsObj?.update && (
                                                    <DropdownMenuItem onClick={() => handleEdit(category)}>
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        {t('Edit')}
                                                    </DropdownMenuItem>
                                                )}
                                                {permissionsObj?.delete && category.assets_count === 0 && (
                                                    <DropdownMenuItem onClick={() => handleDelete(category)} className="text-red-600">
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        {t('Delete')}
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {categories.length === 0 && (
                            <div className="text-center py-12">
                                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('No categories yet')}</h3>
                                <p className="text-gray-500 mb-4">{t('Create your first asset category to get started')}</p>
                                {permissionsObj?.create && (
                                    <Button onClick={openCreateModal}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        {t('Add Your First Category')}
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Dialog open={showModal} onOpenChange={(open) => {
                setShowModal(open);
                if (!open) { setEditingCategory(null); reset(); }
            }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingCategory ? t('Edit Category') : t('Create Category')}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('Name')}</label>
                            <Input
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder={t('Category name')}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('Color')}</label>
                            <div className="flex items-center space-x-3">
                                <input
                                    type="color"
                                    value={data.color}
                                    onChange={(e) => setData('color', e.target.value)}
                                    className="w-12 h-10 rounded-md border border-gray-300 cursor-pointer"
                                />
                                <Input
                                    value={data.color}
                                    onChange={(e) => setData('color', e.target.value)}
                                    placeholder="#3B82F6"
                                    className="flex-1"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => { setShowModal(false); setEditingCategory(null); reset(); }}>
                                {t('Cancel')}
                            </Button>
                            <Button type="submit">{editingCategory ? t('Update') : t('Create')}</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <CrudDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => { setIsDeleteModalOpen(false); setCategoryToDelete(null); }}
                onConfirm={handleDeleteConfirm}
                itemName={categoryToDelete?.name || ''}
                entityName={t('asset category')}
            />
        </PageTemplate>
    );
}
