import { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, Search, Filter, Eye, Edit, Trash2, LayoutGrid, List, CheckCircle, XCircle } from 'lucide-react';
import { PageTemplate } from '@/components/page-template';
import { CrudFormModal } from '@/components/CrudFormModal';
import { EnhancedDeleteModal } from '@/components/EnhancedDeleteModal';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';
import { toast } from '@/components/custom-toast';
import { hasPermission } from '@/utils/authorization';
import { useTranslation } from 'react-i18next';

interface ContractType {
    id: number;
    name: string;
    description: string;
    color: string;
    is_active: boolean;
    sort_order: number;
    contracts_count: number;
    creator: {
        id: number;
        name: string;
    };
    created_at: string;
}

export default function ContractTypesIndex() {
    const { t } = useTranslation();
    const { auth, contractTypes, filters: pageFilters = {}, errors, flash } = usePage().props as any;
    const permissions = auth?.permissions || [];
    
    const [activeView, setActiveView] = useState(pageFilters.view || 'grid');
    const [searchTerm, setSearchTerm] = useState(pageFilters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(pageFilters.status || 'all');
    const [showFilters, setShowFilters] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<any>(null);
    const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters();
    };
    
    const applyFilters = () => {
        const params: any = { page: 1 };
        
        if (searchTerm) params.search = searchTerm;
        if (selectedStatus !== 'all') params.status = selectedStatus;
        if (pageFilters.per_page) params.per_page = pageFilters.per_page;
        params.view = activeView;
        
        router.get(route('contract-types.index'), params, { preserveState: false, preserveScroll: false });
    };
    
    const handleResetFilters = () => {
        setSearchTerm('');
        setSelectedStatus('all');
        setShowFilters(false);
        router.get(route('contract-types.index'), { page: 1, per_page: pageFilters.per_page, view: activeView }, { preserveState: false, preserveScroll: false });
    };

    const handleAction = (action: string, item: any) => {
        setCurrentItem(item);
        switch (action) {
            case 'edit':
                setFormMode('edit');
                setIsFormModalOpen(true);
                break;
            case 'view':
                setFormMode('view');
                setIsFormModalOpen(true);
                break;
            case 'delete':
                if (item.contracts_count > 0) {
                    toast.error(t('Cannot delete contract type that has contracts associated with it.'));
                    return;
                }
                setIsDeleteModalOpen(true);
                break;
            case 'toggle':
                router.put(route('contract-types.toggle-status', item.id));
                break;
        }
    };
    
    const handleAddNew = () => {
        setCurrentItem(null);
        setFormMode('create');
        setIsFormModalOpen(true);
    };
    
    const handleFormSubmit = (formData: any) => {
        if (formMode === 'create') {
            toast.loading(t('Creating contract type...'));
            router.post(route('contract-types.store'), formData, {
                onSuccess: () => {
                    setIsFormModalOpen(false);
                    toast.dismiss();
                },
                onError: (errors) => {
                    toast.dismiss();
                    toast.error(t('Failed to create contract type'));
                }
            });
        } else if (formMode === 'edit') {
            toast.loading(t('Updating contract type...'));
            router.put(route('contract-types.update', currentItem.id), formData, {
                onSuccess: () => {
                    setIsFormModalOpen(false);
                    toast.dismiss();
                },
                onError: (errors) => {
                    toast.dismiss();
                    toast.error(t('Failed to update contract type'));
                }
            });
        }
    };
    
    const handleDeleteConfirm = () => {
        toast.loading(t('Deleting contract type...'));
        router.delete(route('contract-types.destroy', currentItem.id), {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                toast.dismiss();
            },
            onError: (errors) => {
                toast.dismiss();
                toast.error(t('Failed to delete contract type'));
            }
        });
    };
    
    const hasActiveFilters = () => {
        return selectedStatus !== 'all' || searchTerm !== '';
    };
    
    const activeFilterCount = () => {
        return (selectedStatus !== 'all' ? 1 : 0) + (searchTerm ? 1 : 0);
    };

    const pageActions = [];
    
    if (hasPermission(permissions, 'contract_type_create')) {
        pageActions.push({
            label: t('Add Contract Type'),
            icon: <Plus className="h-4 w-4 mr-2" />,
            variant: 'default',
            onClick: handleAddNew
        });
    }
    
    const breadcrumbs = [
        { title: t('Dashboard'), href: route('dashboard') },
        { title: t('Contracts'), href: route('contracts.index') },
        { title: t('Contract Types') }
    ];
    
    return (
        <PageTemplate 
            title={t('Contract Types')} 
            url="/contract-types"
            actions={pageActions}
            breadcrumbs={breadcrumbs}
            noPadding
        >
            {/* Overview Row */}
            <Card className="mb-4 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                    <div className="grid grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-xl font-bold text-blue-600">
                                {contractTypes?.total || 0}
                            </div>
                            <div className="text-xs text-gray-600">{t('Total Types')}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold text-green-600">
                                {contractTypes?.data?.filter((type: any) => type.is_active).length || 0}
                            </div>
                            <div className="text-xs text-gray-600">{t('Active')}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold text-gray-600">
                                {contractTypes?.data?.filter((type: any) => !type.is_active).length || 0}
                            </div>
                            <div className="text-xs text-gray-600">{t('Inactive')}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold text-purple-600">
                                {contractTypes?.data?.reduce((sum: number, type: any) => sum + type.contracts_count, 0) || 0}
                            </div>
                            <div className="text-xs text-gray-600">{t('Total Contracts')}</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Search and filters section */}
            <div className="bg-white rounded-lg shadow mb-4 p-4">
                <SearchAndFilterBar
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onSearch={handleSearch}
                    filters={[
                        {
                            name: 'status',
                            label: t('Status'),
                            type: 'select',
                            value: selectedStatus,
                            onChange: setSelectedStatus,
                            options: [
                                { value: 'all', label: t('All Status') },
                                { value: 'active', label: t('Active') },
                                { value: 'inactive', label: t('Inactive') }
                            ]
                        }
                    ]}
                    showFilters={showFilters}
                    setShowFilters={setShowFilters}
                    hasActiveFilters={hasActiveFilters}
                    activeFilterCount={activeFilterCount}
                    onResetFilters={handleResetFilters}
                    showViewToggle={true}
                    activeView={activeView}
                    onViewChange={setActiveView}
                    viewOptions={[
                        { value: 'grid', label: 'Grid View', icon: 'Grid3X3' },
                        { value: 'list', label: 'List View', icon: 'List' }
                    ]}
                    currentPerPage={pageFilters.per_page?.toString() || new URLSearchParams(window.location.search).get('per_page') || "15"}
                    onPerPageChange={(value) => {
                        const params: any = { page: 1, per_page: parseInt(value) };
                        if (searchTerm) params.search = searchTerm;
                        if (selectedStatus !== 'all') params.status = selectedStatus;
                        router.get(route('contract-types.index'), params, { preserveState: false, preserveScroll: false });
                    }}
                    perPageOptions={[15, 25, 50]}
                />
            </div>


            {/* Contract Types Content */}
            {(activeView === 'grid' || !activeView) ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {contractTypes?.data?.map((type: any) => (
                    <Card key={type.id} className="overflow-hidden hover:shadow-md transition-shadow h-48 flex flex-col">
                        <CardHeader className="pb-2 flex-1">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-base line-clamp-1 flex items-center gap-2">
                                    <div 
                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: type.color }}
                                    />
                                    {type.name}
                                </CardTitle>
                                <div className="flex gap-1">
                                    <Badge variant={type.is_active ? 'default' : 'destructive'}>
                                        {type.is_active ? t('Active') : t('Inactive')}
                                    </Badge>
                                </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {t('By')} {type.creator?.name} • {new Date(type.created_at).toLocaleDateString()}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{type.description}</p>
                        </CardHeader>
                        
                        <CardFooter className="flex justify-end gap-1 pt-0 pb-2 mt-auto">
                            {hasPermission(permissions, 'contract_type_update') && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => handleAction('toggle', type)}
                                            className={type.is_active ? "text-red-500 hover:text-red-700 h-8 w-8" : "text-green-500 hover:text-green-700 h-8 w-8"}
                                        >
                                            {type.is_active ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>{type.is_active ? t('Deactivate') : t('Activate')}</TooltipContent>
                                </Tooltip>
                            )}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => handleAction('view', type)}
                                        className="text-blue-500 hover:text-blue-700 h-8 w-8"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>View</TooltipContent>
                            </Tooltip>
                            {hasPermission(permissions, 'contract_type_update') && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => handleAction('edit', type)}
                                            className="text-amber-500 hover:text-amber-700 h-8 w-8"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Edit</TooltipContent>
                                </Tooltip>
                            )}
                            {hasPermission(permissions, 'contract_type_delete') && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button 
                                            variant="ghost" 
                                            size="icon"
                                            className="text-red-500 hover:text-red-700 h-8 w-8"
                                            onClick={() => handleAction('delete', type)}
                                            disabled={type.contracts_count > 0}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {type.contracts_count > 0 ? t('Cannot delete - has contracts') : t('Delete')}
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </CardFooter>
                    </Card>
                ))}
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Name')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Description')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Color')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Status')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {contractTypes?.data?.map((type: any) => (
                                    <tr key={type.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{type.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500 max-w-xs truncate">{type.description}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-4 h-4 rounded-full border"
                                                    style={{ backgroundColor: type.color }}
                                                />
                                                <span className="text-sm text-gray-500">{type.color}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge variant={type.is_active ? 'default' : 'destructive'}>
                                                {type.is_active ? t('Active') : t('Inactive')}
                                            </Badge>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex gap-1">
                                                {hasPermission(permissions, 'contract_type_update') && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                onClick={() => handleAction('toggle', type)}
                                                                className={type.is_active ? "text-red-500 hover:text-red-700 h-8 w-8" : "text-green-500 hover:text-green-700 h-8 w-8"}
                                                            >
                                                                {type.is_active ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>{type.is_active ? t('Deactivate') : t('Activate')}</TooltipContent>
                                                    </Tooltip>
                                                )}
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            onClick={() => handleAction('view', type)}
                                                            className="text-blue-500 hover:text-blue-700 h-8 w-8"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>View</TooltipContent>
                                                </Tooltip>
                                                {hasPermission(permissions, 'contract_type_update') && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                onClick={() => handleAction('edit', type)}
                                                                className="text-amber-500 hover:text-amber-700 h-8 w-8"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Edit</TooltipContent>
                                                    </Tooltip>
                                                )}
                                                {hasPermission(permissions, 'contract_type_delete') && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon"
                                                                className="text-red-500 hover:text-red-700 h-8 w-8"
                                                                onClick={() => handleAction('delete', type)}
                                                                disabled={type.contracts_count > 0}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            {type.contracts_count > 0 ? t('Cannot delete - has contracts') : t('Delete')}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            {/* Form Modal */}
            <CrudFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSubmit={handleFormSubmit}
                formConfig={{
                    fields: [
                        { name: 'name', label: t('Name'), type: 'text', required: true },
                        { name: 'description', label: t('Description'), type: 'textarea' },
                        { 
                            name: 'color', 
                            label: t('Color'), 
                            type: 'custom',
                            render: (field: any, formData: any, handleChange: any) => {
                                const value = formData[field.name] || '#007bff';
                                return (
                                    <div className="space-y-2">
                                        <Label>{t('Color')}</Label>
                                        <div className="flex gap-2 items-center">
                                            <div 
                                                className="w-8 h-8 rounded border-2 border-gray-300"
                                                style={{ backgroundColor: value }}
                                            />
                                            <input
                                                type="color"
                                                value={value}
                                                onChange={(e) => handleChange(field.name, e.target.value)}
                                                className="w-12 h-8 rounded border cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                );
                            },
                            required: true
                        },
                        { name: 'is_active', label: t('Active'), type: 'checkbox' }
                    ],
                    modalSize: 'lg'
                }}
                initialData={currentItem || {
                    color: '#007bff',
                    is_active: true
                }}
                title={
                    formMode === 'create' 
                        ? t('Add New Contract Type') 
                        : formMode === 'view'
                        ? t('View Contract Type')
                        : t('Edit Contract Type')
                }
                mode={formMode}
            />

            {/* Delete Modal */}
            <EnhancedDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                itemName={currentItem?.name || ''}
                entityName={t('contract type')}
                warningMessage={t('This contract type will be permanently deleted.')}
                additionalInfo={[
                    t('This action cannot be undone'),
                    t('Make sure no contracts are using this type')
                ]}
            />
        </PageTemplate>
    );
}