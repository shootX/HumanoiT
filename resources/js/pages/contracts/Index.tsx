import { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, Search, Filter, Eye, Edit, Trash2, LayoutGrid, List, Copy, Send, Download } from 'lucide-react';
import { PageTemplate } from '@/components/page-template';
import { CrudFormModal } from '@/components/CrudFormModal';
import { EnhancedDeleteModal } from '@/components/EnhancedDeleteModal';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';
import { toast } from '@/components/custom-toast';
import { hasPermission } from '@/utils/authorization';
import { useTranslation } from 'react-i18next';

interface Contract {
    id: number;
    contract_id: string;
    subject: string;
    contract_value: number;
    currency: string;
    start_date: string;
    end_date: string;
    status: string;
    contract_type: {
        id: number;
        name: string;
        color: string;
    };
    client: {
        id: number;
        name: string;
        email: string;
    };
    creator: {
        id: number;
        name: string;
    };
    notes_count: number;
    comments_count: number;
    attachments_count: number;
    created_at: string;
}

const statusOptions = [
    { value: 'pending', label: 'Pending', color: '#ffc107' },
    { value: 'sent', label: 'Sent', color: '#007bff' },
    { value: 'accept', label: 'Accept', color: '#28a745' },
    { value: 'decline', label: 'Decline', color: '#dc3545' },
    { value: 'expired', label: 'Expired', color: '#fd7e14' },
];

export default function ContractsIndex() {
    const { t } = useTranslation();
    const { auth, contracts, contractTypes, clients, projects, filters: pageFilters = {}, errors, flash } = usePage().props as any;
    const permissions = auth?.permissions || [];
    
    const [activeView, setActiveView] = useState(pageFilters.view || 'grid');
    const [searchTerm, setSearchTerm] = useState(pageFilters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(pageFilters.status || 'all');
    const [selectedType, setSelectedType] = useState(pageFilters.contract_type_id || 'all');
    const [selectedClient, setSelectedClient] = useState(pageFilters.client_id || 'all');
    const [selectedProject, setSelectedProject] = useState(pageFilters.project_id || 'all');
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<any>(null);
    const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
    const [formClientId, setFormClientId] = useState<string | null>(null);
    const [formProjects, setFormProjects] = useState([]);
    const [modalKey, setModalKey] = useState(0);

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    useEffect(() => {
        if (selectedClient !== 'all') {
            const clientProjects = projects?.filter((project: any) => {
                if (!project.clients || !Array.isArray(project.clients) || project.clients.length === 0) {
                    return false;
                }
                return project.clients.some((client: any) => client.id?.toString() === selectedClient);
            }) || [];
            setFilteredProjects(clientProjects);
            if (selectedProject !== 'all' && !clientProjects.find((p: any) => p.id.toString() === selectedProject)) {
                setSelectedProject('all');
            }
        } else {
            setFilteredProjects([]);
        }
    }, [selectedClient, projects]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params: any = { page: 1 };
        
        if (searchTerm) params.search = searchTerm;
        if (selectedStatus !== 'all') params.status = selectedStatus;
        if (selectedType !== 'all') params.contract_type_id = selectedType;
        if (selectedClient !== 'all') params.client_id = selectedClient;
        if (selectedProject !== 'all') params.project_id = selectedProject;
        if (pageFilters.per_page) params.per_page = pageFilters.per_page;
        params.view = activeView;
        
        router.get(route('contracts.index'), params, { preserveState: false, preserveScroll: false });
    };
    
    const applyFilters = () => {
        const params: any = { page: 1 };
        
        if (searchTerm) params.search = searchTerm;
        if (selectedStatus !== 'all') params.status = selectedStatus;
        if (selectedType !== 'all') params.contract_type_id = selectedType;
        if (selectedClient !== 'all') params.client_id = selectedClient;
        if (selectedProject !== 'all') params.project_id = selectedProject;
        if (pageFilters.per_page) params.per_page = pageFilters.per_page;
        params.view = activeView;
        
        router.get(route('contracts.index'), params, { preserveState: false, preserveScroll: false });
    };
    
    const handleStatusFilter = (value: string) => {
        setSelectedStatus(value);
        const params: any = { page: 1 };
        if (searchTerm) params.search = searchTerm;
        if (value !== 'all') params.status = value;
        if (selectedType !== 'all') params.contract_type_id = selectedType;
        if (selectedClient !== 'all') params.client_id = selectedClient;
        if (selectedProject !== 'all') params.project_id = selectedProject;
        if (pageFilters.per_page) params.per_page = pageFilters.per_page;
        params.view = activeView;
        router.get(route('contracts.index'), params, { preserveState: false, preserveScroll: false });
    };
    
    const clearFilters = () => {
        setSearchTerm('');
        setSelectedStatus('all');
        setSelectedType('all');
        setSelectedClient('all');
        setSelectedProject('all');
        setShowFilters(false);
        router.get(route('contracts.index'), { page: 1, per_page: pageFilters.per_page, view: activeView }, { preserveState: false, preserveScroll: false });
    };

    const handleAction = (action: string, item: any) => {
        setCurrentItem(item);
        switch (action) {
            case 'view':
                router.get(route('contracts.show', item.id));
                break;
            case 'edit':
                setFormMode('edit');
                const clientId = item.client_id?.toString() || null;
                setFormClientId(clientId);
                if (clientId) {
                    const clientProjects = projects?.filter((project: any) => 
                        project.clients?.some((client: any) => client.id?.toString() === clientId)
                    ) || [];
                    setFormProjects(clientProjects);
                } else {
                    setFormProjects([]);
                }
                setModalKey(prev => prev + 1);
                setIsFormModalOpen(true);
                break;
            case 'delete':
                setIsDeleteModalOpen(true);
                break;
            case 'duplicate':
                toast.loading(t('Duplicating contract...'));
                router.post(route('contracts.duplicate', item.id), {}, {
                    onSuccess: () => {
                        toast.dismiss();
                        router.reload();
                    },
                    onError: () => {
                        toast.dismiss();
                        toast.error(t('Failed to duplicate contract'));
                    }
                });
                break;
            case 'send':
                router.post(route('contracts.send-contract-email', item.id));
                break;
        }
    };
    
    const handleAddNew = () => {
        setCurrentItem(null);
        setFormMode('create');
        setFormClientId(null);
        setFormProjects([]);
        setModalKey(prev => prev + 1);
        setIsFormModalOpen(true);
    };
    
    const handleFormSubmit = (formData: any) => {
        if (formMode === 'create') {
            toast.loading(t('Creating contract...'));
            router.post(route('contracts.store'), formData, {
                onSuccess: () => {
                    setIsFormModalOpen(false);
                    toast.dismiss();
                },
                onError: (errors) => {
                    toast.dismiss();
                    toast.error(t('Failed to create contract'));
                }
            });
        } else if (formMode === 'edit') {
            toast.loading(t('Updating contract...'));
            router.put(route('contracts.update', currentItem.id), formData, {
                onSuccess: () => {
                    setIsFormModalOpen(false);
                    toast.dismiss();
                },
                onError: (errors) => {
                    toast.dismiss();
                    toast.error(t('Failed to update contract'));
                }
            });
        }
    };
    
    const handleDeleteConfirm = () => {
        toast.loading(t('Deleting contract...'));
        router.delete(route('contracts.destroy', currentItem.id), {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                toast.dismiss();
            },
            onError: (errors) => {
                toast.dismiss();
                toast.error(t('Failed to delete contract'));
            }
        });
    };
    
    const hasActiveFilters = () => {
        return selectedStatus !== 'all' || selectedType !== 'all' || selectedClient !== 'all' || selectedProject !== 'all' || searchTerm !== '';
    };
    
    const activeFilterCount = () => {
        return (selectedStatus !== 'all' ? 1 : 0) + (selectedType !== 'all' ? 1 : 0) + (selectedClient !== 'all' ? 1 : 0) + (selectedProject !== 'all' ? 1 : 0) + (searchTerm ? 1 : 0);
    };

    const getStatusBadge = (status: string) => {
        const statusOption = statusOptions.find(s => s.value === status);
        const label = statusOption?.label || status.charAt(0).toUpperCase() + status.slice(1);
        return (
            <Badge 
                variant="secondary" 
                style={{ backgroundColor: statusOption?.color + '20', color: statusOption?.color }}
            >
                {label}
            </Badge>
        );
    };

    const pageActions = [];
    
    if (hasPermission(permissions, 'contract_create')) {
        pageActions.push({
            label: t('Add Contract'),
            icon: <Plus className="h-4 w-4 mr-2" />,
            variant: 'default',
            onClick: handleAddNew
        });
    }
    
    const breadcrumbs = [
        { title: t('Dashboard'), href: route('dashboard') },
        { title: t('Contracts') }
    ];
    
    return (
        <PageTemplate 
            title={t('Contracts')} 
            url="/contracts"
            actions={pageActions}
            breadcrumbs={breadcrumbs}
            noPadding
        >
            {/* Overview Row */}
            <Card className="mb-4 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                    <div className="grid grid-cols-5 gap-4">
                        <div className="text-center">
                            <div className="text-xl font-bold text-blue-600">
                                {contracts?.total || 0}
                            </div>
                            <div className="text-xs text-gray-600">{t('Total Contracts')}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold text-green-600">
                                {contracts?.data?.filter((contract: any) => contract.status === 'signed').length || 0}
                            </div>
                            <div className="text-xs text-gray-600">{t('Signed')}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold text-blue-600">
                                {contracts?.data?.filter((contract: any) => contract.status === 'sent').length || 0}
                            </div>
                            <div className="text-xs text-gray-600">{t('Sent')}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold text-yellow-600">
                                {contracts?.data?.filter((contract: any) => contract.status === 'pending').length || 0}
                            </div>
                            <div className="text-xs text-gray-600">{t('Pending')}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold text-red-600">
                                {contracts?.data?.filter((contract: any) => contract.status === 'expired').length || 0}
                            </div>
                            <div className="text-xs text-gray-600">{t('Expired')}</div>
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
                            onChange: handleStatusFilter,
                            options: [
                                { value: 'all', label: t('All Status') },
                                ...statusOptions.map(status => ({ value: status.value, label: status.label }))
                            ]
                        },
                        {
                            name: 'type',
                            label: t('Type'),
                            type: 'select',
                            value: selectedType,
                            onChange: setSelectedType,
                            options: [
                                { value: 'all', label: t('All Types') },
                                ...(contractTypes?.map((type: any) => ({ value: type.id.toString(), label: type.name })) || [])
                            ]
                        },
                        {
                            name: 'client',
                            label: t('Client'),
                            type: 'select',
                            value: selectedClient,
                            onChange: setSelectedClient,
                            options: [
                                { value: 'all', label: t('All Clients') },
                                ...(clients?.map((client: any) => ({ value: client.id.toString(), label: client.name })) || [])
                            ]
                        },
                        {
                            name: 'project',
                            label: t('Project'),
                            type: 'select',
                            value: selectedProject,
                            onChange: setSelectedProject,
                            options: [
                                { value: 'all', label: t('All Projects') },
                                ...(filteredProjects?.map((project: any) => ({ value: project.id.toString(), label: project.title })) || [])
                            ]
                        }
                    ]}
                    showFilters={showFilters}
                    setShowFilters={setShowFilters}
                    hasActiveFilters={hasActiveFilters}
                    activeFilterCount={activeFilterCount}
                    onResetFilters={clearFilters}
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
                        if (selectedType !== 'all') params.contract_type_id = selectedType;
                        if (selectedClient !== 'all') params.client_id = selectedClient;
                        router.get(route('contracts.index'), params, { preserveState: false, preserveScroll: false });
                    }}
                    perPageOptions={[15, 25, 50]}
                />
            </div>

            {/* Contracts Content */}
            {(activeView === 'grid' || !activeView) ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {contracts?.data?.map((contract: any) => (
                    <Card key={contract.id} className="overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                        <CardHeader className="pb-1">
                            <div className="flex justify-between items-start gap-2">
                                <CardTitle 
                                    className="text-base line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors flex items-center gap-2 flex-1 font-bold"
                                    onClick={() => router.get(route('contracts.show', contract.id))}
                                >
                                    <div 
                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: contract.contract_type?.color }}
                                    />
                                    <span>{contract.subject}</span>
                                </CardTitle>
                                <div className="flex-shrink-0">
                                    {getStatusBadge(contract.status)}
                                </div>
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                                By {contract.creator?.name} • {new Date(contract.created_at).toLocaleDateString()}
                            </div>
                        </CardHeader>
                        
                        <CardContent className="py-2 flex-grow">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Badge 
                                        variant="secondary" 
                                        style={{ backgroundColor: '#007bff20', color: '#007bff' }}
                                    >
                                        {contract.contract_type?.name}
                                    </Badge>
                                    <span className="text-muted-foreground text-xs">
                                        {new Date(contract.end_date).toLocaleDateString()}
                                    </span>
                                </div>
                                
                                <div>
                                    <span className="font-bold text-green-600 text-base">
                                        ${contract.contract_value?.toLocaleString()}
                                    </span>
                                </div>
                                
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <span>{contract.notes_count} {t('notes')}</span>
                                    <span>{contract.comments_count} {t('comments')}</span>
                                    <span>{contract.attachments_count} {t('files')}</span>
                                </div>
                            </div>
                        </CardContent>
                        
                        <CardFooter className="flex justify-end gap-1 pt-1 pb-1 mt-auto">
                            {hasPermission(permissions, 'contract_create') && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => handleAction('duplicate', contract)}
                                            className="text-green-500 hover:text-green-700 h-8 w-8"
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Duplicate</TooltipContent>
                                </Tooltip>
                            )}
                            {hasPermission(permissions, 'contract_view') && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => handleAction('view', contract)}
                                            className="text-blue-500 hover:text-blue-700 h-8 w-8"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>View</TooltipContent>
                                </Tooltip>
                            )}
                            {hasPermission(permissions, 'contract_update') && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => handleAction('edit', contract)}
                                            className="text-amber-500 hover:text-amber-700 h-8 w-8"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Edit</TooltipContent>
                                </Tooltip>
                            )}
                            {hasPermission(permissions, 'contract_delete') && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button 
                                            variant="ghost" 
                                            size="icon"
                                            className="text-red-500 hover:text-red-700 h-8 w-8"
                                            onClick={() => handleAction('delete', contract)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Delete</TooltipContent>
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Contract')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Client')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Type')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Price')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('End Date')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {contracts?.data?.map((contract: any) => (
                                    <tr key={contract.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div 
                                                    className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                                                    onClick={() => router.get(route('contracts.show', contract.id))}
                                                >
                                                    {contract.subject}
                                                </div>
                                                <div className="text-sm text-gray-500">{contract.contract_id}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{contract.client?.name}</div>
                                                <div className="text-sm text-gray-500">{contract.client?.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge 
                                                variant="secondary" 
                                                style={{ backgroundColor: '#007bff20', color: '#007bff' }}
                                            >
                                                {contract.contract_type?.name}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            ${contract.contract_value?.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(contract.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(contract.end_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex gap-1">
                                                {hasPermission(permissions, 'contract_create') && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                onClick={() => handleAction('duplicate', contract)}
                                                                className="text-green-500 hover:text-green-700 h-8 w-8"
                                                            >
                                                                <Copy className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Duplicate</TooltipContent>
                                                    </Tooltip>
                                                )}
                                                {hasPermission(permissions, 'contract_view') && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                onClick={() => handleAction('view', contract)}
                                                                className="text-blue-500 hover:text-blue-700 h-8 w-8"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>View</TooltipContent>
                                                    </Tooltip>
                                                )}
                                                {hasPermission(permissions, 'contract_update') && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                onClick={() => handleAction('edit', contract)}
                                                                className="text-amber-500 hover:text-amber-700 h-8 w-8"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Edit</TooltipContent>
                                                    </Tooltip>
                                                )}
                                                {hasPermission(permissions, 'contract_delete') && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon"
                                                                className="text-red-500 hover:text-red-700 h-8 w-8"
                                                                onClick={() => handleAction('delete', contract)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Delete</TooltipContent>
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
            
            {/* Pagination */}
            {contracts?.links && (
                <div className="mt-6 bg-white p-4 rounded-lg shadow flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        {t('Showing')} <span className="font-medium">{contracts?.from || 0}</span> {t('to')} <span className="font-medium">{contracts?.to || 0}</span> {t('of')} <span className="font-medium">{contracts?.total || 0}</span> {t('contracts')}
                    </div>
                    
                    <div className="flex gap-1">
                        {contracts?.links?.map((link: any, i: number) => {
                            const isTextLink = link.label === "&laquo; Previous" || link.label === "Next &raquo;";
                            const label = link.label.replace("&laquo; ", "").replace(" &raquo;", "");
                            
                            return (
                                <Button
                                    key={i}
                                    variant={link.active ? 'default' : 'outline'}
                                    size={isTextLink ? "sm" : "icon"}
                                    className={isTextLink ? "px-3" : "h-8 w-8"}
                                    disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url)}
                                >
                                    {isTextLink ? label : <span dangerouslySetInnerHTML={{ __html: link.label }} />}
                                </Button>
                            );
                        })}
                    </div>
                </div>
            )}
            
            {/* Form Modal */}
            <CrudFormModal
                key={modalKey}
                isOpen={isFormModalOpen}
                onClose={() => {
                    setIsFormModalOpen(false);
                    setFormClientId(null);
                    setFormProjects([]);
                }}
                onSubmit={handleFormSubmit}
                formConfig={{
                    fields: [
                        { name: 'subject', label: t('Subject'), type: 'text', required: true },
                        { name: 'description', label: t('Description'), type: 'textarea' },
                        { 
                            name: 'contract_type_id', 
                            label: t('Contract Type'), 
                            type: 'select',
                            options: contractTypes?.map((type: any) => ({ value: type.id, label: type.name })) || [],
                            required: true
                        },
                        { name: 'contract_value', label: t('Contract Value'), type: 'number', min: 0, required: true },
                        { name: 'start_date', label: t('Start Date'), type: 'date', required: true },
                        { name: 'end_date', label: t('End Date'), type: 'date', required: true },
                        { 
                            name: 'client_id', 
                            label: t('Client'), 
                            type: 'select',
                            options: clients?.map((client: any) => ({ value: client.id, label: client.name })) || [],
                            required: true
                        },
                        { 
                            name: 'project_id', 
                            label: t('Project'), 
                            type: 'select',
                            options: [],
                            placeholder: t('Select project'),
                            conditional: (mode: string, formData: any) => {
                                if (formData.client_id) {
                                    return true;
                                }
                                return false;
                            },
                            render: (field: any, formData: any, handleChange: any) => {
                                const clientId = formData.client_id;
                                const filteredProjects = clientId ? projects?.filter((project: any) => 
                                    project.clients?.some((client: any) => client.id?.toString() === clientId.toString())
                                ) || [] : [];
                                
                                const projectOptions = filteredProjects.map((project: any) => ({ 
                                    value: project.id, 
                                    label: project.title 
                                }));
                                
                                return (
                                    <Select
                                        value={formData[field.name] ? String(formData[field.name]) : ''}
                                        onValueChange={(value) => handleChange(field.name, value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('Select project')} />
                                        </SelectTrigger>
                                        <SelectContent className="z-[60000]">
                                            {projectOptions.map((option: any) => (
                                                <SelectItem key={option.value} value={String(option.value)}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                );
                            }
                        }
                    ],
                    modalSize: 'xl'
                }}
                initialData={currentItem || {
                    status: 'pending'
                }}
                title={
                    formMode === 'create' 
                        ? t('Add New Contract') 
                        : formMode === 'edit' 
                            ? t('Edit Contract') 
                            : t('View Contract')
                }
                mode={formMode}
            />

            {/* Delete Modal */}
            <EnhancedDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                itemName={currentItem?.subject || ''}
                entityName={t('contract')}
                warningMessage={t('All contract data including notes, comments, and attachments will be permanently lost.')}
                additionalInfo={[
                    t('Contract notes and comments'),
                    t('File attachments'),
                    t('Contract history'),
                    t('Related activities')
                ]}
            />
        </PageTemplate>
    );
}