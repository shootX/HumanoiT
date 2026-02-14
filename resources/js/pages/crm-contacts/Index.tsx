import { useState, useEffect } from 'react';
import { PageTemplate } from '@/components/page-template';
import { usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, Search, Plus, Edit, Trash2, Download, Eye, Upload } from 'lucide-react';
import { toast } from '@/components/custom-toast';
import { useTranslation } from 'react-i18next';
import { CrudFormModal } from '@/components/CrudFormModal';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { ImportModal } from '@/components/ImportModal';
import { hasPermission } from '@/utils/authorization';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export default function CrmContactsIndex() {
  const { t } = useTranslation();
  const { auth, contacts, filters: pageFilters = {}, flash } = usePage().props as any;

  const [searchTerm, setSearchTerm] = useState(pageFilters.search || '');
  const [selectedType, setSelectedType] = useState(pageFilters.type || 'all');
  const [showFilters, setShowFilters] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [currentContact, setCurrentContact] = useState<any>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);

  const hasActiveFilters = () => selectedType !== 'all' || searchTerm !== '';
  const activeFilterCount = () => (selectedType !== 'all' ? 1 : 0) + (searchTerm ? 1 : 0);

  const applyFilters = () => {
    const params: any = { page: 1 };
    if (searchTerm) params.search = searchTerm;
    if (selectedType !== 'all') params.type = selectedType;
    if (pageFilters.per_page) params.per_page = pageFilters.per_page;
    router.get(route('crm-contacts.index'), params, { preserveState: true, preserveScroll: true });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const handleTypeFilter = (value: string) => {
    setSelectedType(value);
    const params: any = { page: 1 };
    if (searchTerm) params.search = searchTerm;
    if (value !== 'all') params.type = value;
    if (pageFilters.per_page) params.per_page = pageFilters.per_page;
    router.get(route('crm-contacts.index'), params, { preserveState: true, preserveScroll: true });
  };

  const handleSort = (field: string) => {
    const direction = pageFilters.sort_field === field && pageFilters.sort_direction === 'asc' ? 'desc' : 'asc';
    const params: any = { sort_field: field, sort_direction: direction, page: 1 };
    if (searchTerm) params.search = searchTerm;
    if (selectedType !== 'all') params.type = selectedType;
    if (pageFilters.per_page) params.per_page = pageFilters.per_page;
    router.get(route('crm-contacts.index'), params, { preserveState: true, preserveScroll: true });
  };

  const handleAddNew = () => {
    setCurrentContact(null);
    setFormMode('create');
    setIsFormModalOpen(true);
  };

  const handleEdit = (contact: any) => {
    setCurrentContact(contact);
    setFormMode('edit');
    setIsFormModalOpen(true);
  };

  const handleView = (contact: any) => {
    setCurrentContact(contact);
    setFormMode('view');
    setIsFormModalOpen(true);
  };

  const handleDelete = (contact: any) => {
    setCurrentContact(contact);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = (formData: any) => {
    if (formMode === 'create') {
      toast.loading(t('Creating contact...'));
      router.post(route('crm-contacts.store'), formData, {
        onSuccess: () => {
          setIsFormModalOpen(false);
          toast.dismiss();
        },
        onError: () => {
          toast.dismiss();
          toast.error(t('Failed to create contact'));
        },
      });
    } else if (formMode === 'edit') {
      toast.loading(t('Updating contact...'));
      router.put(route('crm-contacts.update', currentContact.id), formData, {
        onSuccess: () => {
          setIsFormModalOpen(false);
          toast.dismiss();
        },
        onError: () => {
          toast.dismiss();
          toast.error(t('Failed to update contact'));
        },
      });
    }
  };

  const handleDeleteConfirm = () => {
    toast.loading(t('Deleting contact...'));
    router.delete(route('crm-contacts.destroy', currentContact.id), {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        toast.dismiss();
      },
      onError: () => {
        toast.dismiss();
        toast.error(t('Failed to delete contact'));
      },
    });
  };

  const handleResetFilters = () => {
    setSelectedType('all');
    setSearchTerm('');
    setShowFilters(false);
    router.get(route('crm-contacts.index'), { page: 1, per_page: pageFilters.per_page }, { preserveState: true, preserveScroll: true });
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (selectedType !== 'all') params.append('type', selectedType);
    window.open(route('crm-contacts.export') + '?' + params.toString());
  };

  const getTypeDisplay = (type: string) => type === 'legal' ? t('Legal Entity') : t('Physical Person');
  const getDisplayName = (contact: any) => {
    if (contact.type === 'legal') return contact.company_name || contact.brand_name || contact.name;
    return contact.name;
  };

  const permissions = auth?.permissions || [];
  const pageActions = [
    { label: t('Export'), icon: <Download className="h-4 w-4 mr-2" />, variant: 'outline' as const, onClick: handleExport },
    ...(hasPermission(permissions, 'crm_contact_create') ? [{ label: t('Import'), icon: <Upload className="h-4 w-4 mr-2" />, variant: 'outline' as const, onClick: () => setIsImportModalOpen(true) }] : []),
    { label: t('Add Contact'), icon: <Plus className="h-4 w-4 mr-2" />, variant: 'default' as const, onClick: handleAddNew },
  ];

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Contacts') },
  ];

  const formFields = [
    {
      name: 'type',
      label: t('Type'),
      type: 'select' as const,
      required: true,
      options: [
        { value: 'individual', label: t('Physical Person') },
        { value: 'legal', label: t('Legal Entity') },
      ],
      readOnly: formMode === 'view',
    },
    { name: 'name', label: t('Name'), type: 'text' as const, required: true, placeholder: t('Contact person name') },
    {
      name: 'company_name',
      label: t('Company Name (LLC)'),
      type: 'text' as const,
      conditional: (_: string, formData: any) => formData?.type === 'legal',
    },
    {
      name: 'brand_name',
      label: t('Brand Name'),
      type: 'text' as const,
      conditional: (_: string, formData: any) => formData?.type === 'legal',
    },
    {
      name: 'identification_code',
      label: t('Identification Code'),
      type: 'text' as const,
      conditional: (_: string, formData: any) => formData?.type === 'legal',
    },
    { name: 'email', label: t('Email'), type: 'email' as const },
    { name: 'phone', label: t('Phone'), type: 'text' as const },
    { name: 'address', label: t('Address'), type: 'textarea' as const },
    { name: 'notes', label: t('Notes'), type: 'textarea' as const },
  ];

  const columns = [
    {
      key: 'type',
      label: t('Type'),
      sortable: true,
      render: (value: string) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {getTypeDisplay(value)}
        </span>
      ),
    },
    {
      key: 'name',
      label: t('Name'),
      sortable: true,
      render: (_: string, row: any) => (
        <div>
          <div className="font-medium">{getDisplayName(row)}</div>
          {row.type === 'legal' && row.name && row.name !== (row.company_name || row.brand_name) && (
            <div className="text-sm text-muted-foreground">{row.name}</div>
          )}
        </div>
      ),
    },
    {
      key: 'email',
      label: t('Email'),
      sortable: true,
      render: (value: string) => value || '-',
    },
    {
      key: 'phone',
      label: t('Phone'),
      sortable: true,
      render: (value: string) => value || '-',
    },
    {
      key: 'identification_code',
      label: t('Identification Code'),
      sortable: true,
      render: (_: string, row: any) => (row.type === 'legal' ? (row.identification_code || '-') : '-'),
    },
    {
      key: 'created_at',
      label: t('Created At'),
      sortable: true,
      render: (value: string) => window.appSettings?.formatDateTime?.(value, false) || new Date(value).toLocaleDateString(),
    },
  ];

  return (
    <PageTemplate
      title={t('Contacts')}
      url="/crm-contacts"
      actions={pageActions}
      breadcrumbs={breadcrumbs}
      noPadding
    >
      <div className="bg-white rounded-lg shadow mb-4">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('Search contacts...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9"
                  />
                </div>
                <Button type="submit" size="sm">
                  <Search className="h-4 w-4 mr-1.5" />
                  {t('Search')}
                </Button>
              </form>
              <Button
                variant={hasActiveFilters() ? 'default' : 'outline'}
                size="sm"
                className="h-8 px-2 py-1"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-3.5 w-3.5 mr-1.5" />
                {showFilters ? t('Hide Filters') : t('Filters')}
                {hasActiveFilters() && (
                  <span className="ml-1 bg-primary-foreground text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {activeFilterCount()}
                  </span>
                )}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground">{t('Per Page:')}</Label>
              <Select
                value={pageFilters.per_page?.toString() || '15'}
                onValueChange={(value) => {
                  const params: any = { page: 1, per_page: parseInt(value) };
                  if (searchTerm) params.search = searchTerm;
                  if (selectedType !== 'all') params.type = selectedType;
                  router.get(route('crm-contacts.index'), params, { preserveState: true, preserveScroll: true });
                }}
              >
                <SelectTrigger className="w-16 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {showFilters && (
            <div className="w-full mt-3 p-4 bg-gray-50 border rounded-md">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="space-y-2">
                  <Label>{t('Type')}</Label>
                  <Select value={selectedType} onValueChange={handleTypeFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder={t('All Types')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('All Types')}</SelectItem>
                      <SelectItem value="individual">{t('Physical Person')}</SelectItem>
                      <SelectItem value="legal">{t('Legal Entity')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button variant="default" size="sm" className="h-9" onClick={applyFilters}>
                    {t('Apply Filters')}
                  </Button>
                  <Button variant="outline" size="sm" className="h-9" onClick={handleResetFilters} disabled={!hasActiveFilters()}>
                    {t('Reset Filters')}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-3 text-left font-medium text-gray-500 cursor-pointer hover:bg-gray-100"
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <div className="flex items-center">
                      {col.label}
                      {col.sortable && (
                        <span className="ml-1">
                          {pageFilters.sort_field === col.key ? (pageFilters.sort_direction === 'asc' ? '↑' : '↓') : ''}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 text-right font-medium text-gray-500">{t('Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {contacts?.data?.map((contact: any) => (
                <tr key={contact.id} className="border-b hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800">
                  {columns.map((col) => (
                    <td key={`${contact.id}-${col.key}`} className="px-4 py-3">
                      {col.render ? col.render(contact[col.key], contact) : contact[col.key]}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => handleView(contact)} className="text-blue-500 hover:text-blue-700">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t('View')}</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(contact)} className="text-amber-500 hover:text-amber-700">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t('Edit')}</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(contact)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t('Delete')}</TooltipContent>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              ))}
              {(!contacts?.data || contacts.data.length === 0) && (
                <tr>
                  <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-gray-500">
                    {t('No contacts found')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {t('Showing')} <span className="font-medium">{contacts?.from || 0}</span> {t('to')} <span className="font-medium">{contacts?.to || 0}</span> {t('of')} <span className="font-medium">{contacts?.total || 0}</span> {t('contacts')}
          </div>
          <div className="flex gap-1">
            {contacts?.links?.map((link: any, i: number) => {
              const isTextLink = link.label === '&laquo; Previous' || link.label === 'Next &raquo;';
              const label = link.label.replace('&laquo; ', '').replace(' &raquo;', '');
              return (
                <Button
                  key={i}
                  variant={link.active ? 'default' : 'outline'}
                  size={isTextLink ? 'sm' : 'icon'}
                  className={isTextLink ? 'px-3' : 'h-8 w-8'}
                  disabled={!link.url}
                  onClick={() => link.url && router.get(link.url)}
                >
                  {isTextLink ? label : <span dangerouslySetInnerHTML={{ __html: link.label }} />}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      <CrudFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        formConfig={{
          fields: formFields,
          modalSize: 'lg',
        }}
        initialData={currentContact || { type: 'individual' }}
        title={formMode === 'create' ? t('Add Contact') : formMode === 'view' ? t('View Contact Details') : t('Edit Contact')}
        mode={formMode}
      />

      <CrudDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={currentContact ? getDisplayName(currentContact) : ''}
        entityName="contact"
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        type="crm-contacts"
        title="Contacts"
      />
    </PageTemplate>
  );
}
