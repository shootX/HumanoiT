import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { PageTemplate } from '@/components/page-template';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InvoiceTaskMultiSelect } from '@/components/invoices/InvoiceTaskMultiSelect';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { formatCurrency } from '@/utils/currency';

interface InvoiceItem {
    type: 'service' | 'asset';
    description: string;
    quantity: number | string;
    rate: number | string;
    amount: number;
    tax_id: number | null;
    asset_id: number | null;
    asset_category_id: number | null;
    asset_name: string;
}

interface Props {
    invoice?: any;
    projects: any[];
    clients: any[];
    crmContacts?: any[];
    currencies: any[];
    taxes: any[];
    assetCategories?: any[];
    assets?: { id: number; name: string; asset_code?: string; quantity?: number }[];
}

const defaultVatTaxId = (taxes: any[]) => taxes?.find((x: any) => Math.abs(parseFloat(x.rate) - 18) < 0.01 && !!x.is_inclusive)?.id ?? null;

export default function InvoiceForm({ invoice, projects, clients, crmContacts = [], currencies, taxes, assetCategories: initialAssetCategories = [], assets = [] }: Props) {
    const { t } = useTranslation();
    const isEdit = !!invoice;
    const defaultTaxId = defaultVatTaxId(taxes || []);

    const [formData, setFormData] = useState({
        project_id: invoice?.project_id?.toString() || '',
        task_id: invoice?.task_id?.toString() || '',
        task_ids: invoice?.task_ids || (invoice?.task_id ? [invoice.task_id.toString()] : []),
        budget_category_id: invoice?.budget_category_id?.toString() || '',
        client_id: invoice?.client_id?.toString() || '',
        crm_contact_id: invoice?.crm_contact_id?.toString() || '',
        title: invoice?.title || '',
        description: invoice?.description || '',
        invoice_date: invoice?.invoice_date ? new Date(invoice.invoice_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        due_date: invoice?.due_date ? new Date(invoice.due_date).toISOString().split('T')[0] : '',

        currency: invoice?.currency || 'USD',
        notes: invoice?.notes || '',
        terms: invoice?.terms || '',
    });

    const mapItemType = (t: string) => (['asset', 'service'].includes(t) ? t : 'asset') as 'service' | 'asset';
    const [items, setItems] = useState<InvoiceItem[]>(
        invoice?.items?.map((item: any) => ({
            type: mapItemType(item.type),
            description: item.description || '',
            quantity: item.quantity || 1,
            rate: item.rate || 0,
            amount: (item.rate || 0) * (item.quantity || 1),
            tax_id: item.tax_id ?? null,
            asset_id: item.asset_id ?? null,
            asset_category_id: item.asset_category_id ?? null,
            asset_name: item.asset_name || '',
        })) || [{
            type: 'asset',
            description: '',
            quantity: 1,
            rate: 0,
            amount: 0,
            tax_id: defaultVatTaxId(taxes || []),
            asset_id: null,
            asset_category_id: null,
            asset_name: ''
        }]
    );

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [projectTasks, setProjectTasks] = useState([]);
    const [budgetCategories, setBudgetCategories] = useState<any[]>([]);
    const [assetCategories, setAssetCategories] = useState<any[]>(initialAssetCategories);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [projectClients, setProjectClients] = useState([]);
    const [availableClients, setAvailableClients] = useState([]);
    const [titleManuallyEdited, setTitleManuallyEdited] = useState(isEdit);

    const breadcrumbs = [
        { title: t('Dashboard'), href: route('dashboard') },
        { title: t('Invoices'), href: route('invoices.index') },
        { title: isEdit ? `${t('Edit')} ${invoice.invoice_number}` : t('Create Invoice') }
    ];

    useEffect(() => {
        if (formData.project_id) {
            loadProjectData(formData.project_id);
        }
        // Set initial available clients
        setAvailableClients(clients || []);
    }, []);

    const generateAutoTitle = (projectId: string, invoiceDate: string) => {
        const selectedProject = projects.find(p => p.id.toString() === projectId.toString());
        if (!selectedProject || !invoiceDate) return '';
        const date = new Date(invoiceDate);
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        return `${selectedProject.title} ${dd}.${mm}`;
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => {
            const updated = { ...prev, [field]: value };

            // Auto-fill title when project or invoice_date changes (only if not manually edited)
            if ((field === 'project_id' || field === 'invoice_date') && !titleManuallyEdited) {
                const pid = field === 'project_id' ? value : prev.project_id;
                const idate = field === 'invoice_date' ? value : prev.invoice_date;
                if (pid && idate) {
                    updated.title = generateAutoTitle(pid, idate);
                }
            }

            return updated;
        });
        
        if (field === 'project_id') {
            if (value) {
                loadProjectData(value);
                setFormData(prev => ({ ...prev, task_ids: [], task_id: '' }));
            } else {
                setProjectTasks([]);
                setFormData(prev => ({ ...prev, task_ids: [], task_id: '' }));
                setBudgetCategories([]);
                setAssetCategories([]);
                setProjectClients([]);
                setAvailableClients(clients || []);
            }
        }
    };
    
    const loadProjectData = async (projectId: string) => {
        try {
            const response = await fetch(route('api.projects.invoice-data', projectId), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin'
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setProjectTasks(data.tasks || []);
            setProjectClients(data.clients || []);
            setBudgetCategories(data.budget_categories || []);
            setAssetCategories(data.asset_categories || []);
            
            // Merge project clients with all clients, ensuring current client is included
            const mergedClients = [...(data.clients || [])];
            const allClientIds = mergedClients.map(c => c.id);
            
            // Add clients that aren't in project clients but are in workspace
            clients.forEach(client => {
                if (!allClientIds.includes(client.id)) {
                    mergedClients.push(client);
                }
            });
            
            setAvailableClients(mergedClients);
        } catch (error) {
            console.error('Failed to load project data:', error);
            setProjectTasks([]);
            setBudgetCategories([]);
            setAssetCategories([]);
            setProjectClients([]);
            setAvailableClients(clients || []);
        }
    };

    const parseItemNum = (v: any) => parseFloat(String(v).replace(',', '.')) || 0;
    const getItemTaxAmount = (item: InvoiceItem) => {
        const amount = (parseItemNum(item.quantity) || 1) * parseItemNum(item.rate);
        if (!item.tax_id) return 0;
        const tax = taxes?.find(t => t.id == item.tax_id);
        if (!tax) return 0;
        if (tax.is_inclusive) return amount - (amount / (1 + (tax.rate || 0) / 100));
        return (amount * (tax.rate || 0)) / 100;
    };

    const getItemTotal = (item: InvoiceItem) => {
        const amount = (parseItemNum(item.quantity) || 1) * parseItemNum(item.rate);
        if (!item.tax_id) return amount;
        const tax = taxes?.find(t => t.id == item.tax_id);
        if (!tax) return amount;
        if (tax.is_inclusive) return amount; // rate უკვე სრული თანხაა
        return amount + getItemTaxAmount(item);
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const updatedItems = [...items];
        const item = { ...updatedItems[index], [field]: value };
        if (field === 'type') {
            if (value === 'service') { item.asset_id = null; item.asset_category_id = null; item.asset_name = ''; }
        }
        if (field === 'asset_id' && value) {
            const a = assets.find((x: any) => x.id === parseInt(value, 10));
            if (a) item.description = a.name;
        }
        if (field === 'quantity' || field === 'rate') {
            const qty = field === 'quantity' ? parseItemNum(value) : parseItemNum(item.quantity);
            const rate = field === 'rate' ? parseItemNum(value) : parseItemNum(item.rate);
            item.amount = qty * rate;
        }
        updatedItems[index] = item;
        setItems(updatedItems);
    };

    const addItem = () => {
        setItems([...items, {
            type: 'asset',
            description: '',
            quantity: 1,
            rate: 0,
            amount: 0,
            tax_id: defaultTaxId,
            asset_id: null,
            asset_category_id: null,
            asset_name: ''
        }]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const getItemBase = (item: InvoiceItem) => {
        const amount = (parseItemNum(item.quantity) || 1) * parseItemNum(item.rate);
        if (!item.tax_id) return amount;
        const tax = taxes?.find(t => t.id == item.tax_id);
        if (!tax) return amount;
        if (tax.is_inclusive) return amount / (1 + (tax.rate || 0) / 100);
        return amount;
    };
    const calculateSubtotal = () => items.reduce((sum, item) => sum + getItemBase(item), 0);
    const calculateTotalTax = () => items.reduce((sum, item) => sum + getItemTaxAmount(item), 0);
    const calculateTotal = () => items.reduce((sum, item) => sum + getItemTotal(item), 0);

    const getTaxBreakdown = (): { id: number; name: string; rate: number; amount: number; is_inclusive: boolean }[] => {
        const byTax: Record<number, number> = {};
        items.forEach(item => {
            if (!item.tax_id) return;
            const amt = getItemTaxAmount(item);
            if (amt > 0) byTax[item.tax_id] = (byTax[item.tax_id] || 0) + amt;
        });
        return Object.entries(byTax).map(([id, amount]) => {
            const tax = taxes?.find(t => t.id == parseInt(id));
            return { id: parseInt(id), name: tax?.name || '', rate: tax?.rate || 0, amount, is_inclusive: tax?.is_inclusive || false };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const validItems = items.filter(item => !!item.description?.trim());
        const submitData = {
            ...formData,
            task_id: formData.task_ids?.[0] || (formData.task_id && formData.task_id !== 'none' ? formData.task_id : null),
            task_ids: formData.task_ids || [],
            client_id: formData.client_id === 'none' ? null : formData.client_id,
            crm_contact_id: formData.crm_contact_id && formData.crm_contact_id !== 'none' ? formData.crm_contact_id : null,
            budget_category_id: formData.budget_category_id && formData.budget_category_id !== 'none' ? formData.budget_category_id : null,
            items: validItems.map(item => ({
                type: item.type,
                task_id: formData.task_ids?.[0] ? parseInt(formData.task_ids[0]) : (formData.task_id && formData.task_id !== 'none' ? parseInt(formData.task_id) : null),
                asset_id: null,
                asset_category_id: item.type === 'asset' ? (item.asset_category_id ?? null) : null,
                asset_name: item.type === 'asset' ? item.description : null,
                tax_id: item.tax_id ?? null,
                description: item.description,
                quantity: parseItemNum(item.quantity) || 1,
                rate: parseItemNum(item.rate) || 0,
            }))
        };

        if (isEdit) {
            router.put(route('invoices.update', invoice.id), submitData, {
                onFinish: () => setIsSubmitting(false),
                onError: (errors) => {
setErrors(errors);
            }
        });
        } else {
            router.post(route('invoices.store'), submitData, {
                onFinish: () => setIsSubmitting(false),
                onError: (errors) => {
                    setErrors(errors);
                }
            });
        }
    };

    return (
        <PageTemplate 
            title={isEdit ? `${t('Edit Invoice')} ${invoice.invoice_number}` : t('Create Invoice')}
            url={isEdit ? `/invoices/${invoice.id}/edit` : "/invoices/create"}
            breadcrumbs={breadcrumbs}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="crm_contact_id">{t('Billing recipient')}</Label>
                        <Select
                            value={formData.crm_contact_id || 'none'}
                            onValueChange={(value) => handleInputChange('crm_contact_id', value === 'none' ? '' : value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t('Select contact')} />
                            </SelectTrigger>
                            <SelectContent className="z-[9999]">
                                <SelectItem value="none">{t('—')}</SelectItem>
                                {crmContacts?.map((contact: any) => (
                                    <SelectItem key={contact.id} value={contact.id.toString()}>
                                        {contact.brand_name || contact.company_name || contact.name || '—'}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="project_id">{t('Project')} <span className="text-red-500">*</span></Label>
                        <Select 
                            value={formData.project_id} 
                            onValueChange={(value) => handleInputChange('project_id', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t('Select project')} />
                            </SelectTrigger>
                            <SelectContent className="z-[9999]">
                                {projects?.map((project: any) => (
                                    <SelectItem key={project.id} value={project.id.toString()}>
                                        {project.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="task_ids">{t('Task')} <span className="text-muted-foreground text-xs">({t('optional')})</span></Label>
                        <InvoiceTaskMultiSelect
                            projectId={formData.project_id}
                            selected={formData.task_ids}
                            onChange={(ids) => setFormData(prev => ({ ...prev, task_ids: ids, task_id: ids[0] || '' }))}
                            placeholder={t('Select task')}
                            disabled={!formData.project_id}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="budget_category_id">{t('Budget Category')}</Label>
                        <Select
                            value={formData.budget_category_id || 'none'}
                            onValueChange={(value) => handleInputChange('budget_category_id', value === 'none' ? '' : value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t('Select category (optional)')} />
                            </SelectTrigger>
                            <SelectContent className="z-[9999]">
                                <SelectItem value="none">{t('No category')}</SelectItem>
                                {budgetCategories?.map((cat: any) => (
                                    <SelectItem key={cat.id} value={cat.id.toString()}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="client_id">{t('Client')}</Label>
                        <Select 
                            value={formData.client_id} 
                            onValueChange={(value) => handleInputChange('client_id', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t('Select client (optional)')} />
                            </SelectTrigger>
                            <SelectContent className="z-[9999]">
                                <SelectItem value="none">{t('No client')}</SelectItem>
                                {availableClients?.map((client: any) => (
                                    <SelectItem key={client.id} value={client.id.toString()}>
                                        {client.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="title">{t('Invoice Title')} <span className="text-red-500">*</span></Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => {
                                setTitleManuallyEdited(true);
                                handleInputChange('title', e.target.value);
                            }}
                            placeholder={t('Enter invoice title')}
                            className={errors.title ? 'border-red-500' : ''}
                        />
                        {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
                    </div>



                    <div className="space-y-2">
                        <Label htmlFor="invoice_date">{t('Invoice Date')} <span className="text-red-500">*</span></Label>
                        <Input
                            id="invoice_date"
                            type="date"
                            value={formData.invoice_date}
                            onChange={(e) => handleInputChange('invoice_date', e.target.value)}
                            className={errors.invoice_date ? 'border-red-500' : ''}
                        />
                        {errors.invoice_date && <p className="text-sm text-red-600 mt-1">{errors.invoice_date}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="due_date">{t('Due Date')}</Label>
                        <Input
                            id="due_date"
                            type="date"
                            value={formData.due_date}
                            onChange={(e) => handleInputChange('due_date', e.target.value)}
                            className={errors.due_date ? 'border-red-500' : ''}
                        />
                        {errors.due_date && <p className="text-sm text-red-600 mt-1">{errors.due_date}</p>}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">{t('Description')}</Label>
                    <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder={t('Enter invoice description')}
                        rows={3}
                    />
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>{t('Invoice Items')}</CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {t('Type')} · {t('Name')} · {t('Quantity')} · {t('Unit Price')} · {t('Tax Type')} · {t('Total')}
                                </p>
                            </div>
                            <Button type="button" onClick={addItem} size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                {t('Add Item')}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {items.map((item, index) => (
                                <div key={index} className="rounded-lg border p-4 space-y-3">
                                    <div className="grid grid-cols-2 md:grid-cols-12 gap-3 items-end">
                                        <div className="md:col-span-2">
                                            <Label>{t('Type')}</Label>
                                            <Select 
                                                value={item.type} 
                                                onValueChange={(value) => handleItemChange(index, 'type', value as 'service' | 'asset')}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="z-[9999]">
                                                    <SelectItem value="service">{t('Service')}</SelectItem>
                                                    <SelectItem value="asset">{t('Asset')}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="md:col-span-3">
                                            <Label>{t('Name')}</Label>
                                            <Input
                                                value={item.description}
                                                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                placeholder={t('Item name')}
                                            />
                                        </div>
                                        <div className="md:col-span-1">
                                            <Label>{t('Quantity')}</Label>
                                            <Input
                                                type="text"
                                                inputMode="decimal"
                                                value={item.quantity ?? ''}
                                                onChange={(e) => {
                                                    const v = e.target.value.replace(',', '.');
                                                    const valid = /^\d*\.?\d*$/.test(v) ? v : String(item.quantity ?? '');
                                                    handleItemChange(index, 'quantity', valid);
                                                }}
                                                placeholder="1"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <Label>{t('Unit Price')}</Label>
                                            <Input
                                                type="text"
                                                inputMode="decimal"
                                                value={item.rate ?? ''}
                                                onChange={(e) => {
                                                    const v = e.target.value.replace(',', '.');
                                                    const valid = /^\d*\.?\d*$/.test(v) ? v : String(item.rate ?? '');
                                                    handleItemChange(index, 'rate', valid);
                                                }}
                                                placeholder="0"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <Label>{t('Tax Type')}</Label>
                                            <Select 
                                                value={item.tax_id?.toString() || 'none'} 
                                                onValueChange={(value) => handleItemChange(index, 'tax_id', value && value !== 'none' ? parseInt(value) : null)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t('—')} />
                                                </SelectTrigger>
                                                <SelectContent className="z-[9999]">
                                                    <SelectItem value="none">{t('—')}</SelectItem>
                                                    {taxes?.map((tax: any) => (
                                                        <SelectItem key={tax.id} value={tax.id.toString()}>
                                                            {tax.name} ({tax.rate}%)
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="md:col-span-2">
                                            <Label>{t('Total')}</Label>
                                            <Input
                                                value={formatCurrency(getItemTotal(item))}
                                                readOnly
                                                className="bg-gray-50 font-semibold"
                                            />
                                        </div>
                                        <div className="md:col-span-1">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={() => removeItem(index)}
                                                disabled={items.length === 1}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('Totals')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                            <div className="flex justify-between text-gray-700">
                                <span>{t('Subtotal')}:</span>
                                <span>{formatCurrency(calculateSubtotal())}</span>
                            </div>
                            {getTaxBreakdown().length > 0 && (
                                <>
                                    <div className="text-sm font-medium text-gray-600 mt-2">{t('Taxes')}:</div>
                                    {getTaxBreakdown().map((tax) => (
                                        <div key={tax.id} className="flex justify-between text-gray-700 pl-2">
                                            <span>{tax.name} ({tax.rate}%){tax.is_inclusive ? ` ${t('included')}` : ''}:</span>
                                            <span>{formatCurrency(tax.amount)}</span>
                                        </div>
                                    ))}
                                </>
                            )}
                            <div className="border-t pt-3 flex justify-between font-bold text-xl text-blue-600">
                                <span>{t('Total')}:</span>
                                <span>{formatCurrency(calculateTotal())}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="notes">{t('Notes')}</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => handleInputChange('notes', e.target.value)}
                            placeholder={t('Internal notes')}
                            rows={3}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="terms">{t('Terms & Conditions')}</Label>
                        <Textarea
                            id="terms"
                            value={formData.terms}
                            onChange={(e) => handleInputChange('terms', e.target.value)}
                            placeholder={t('Payment terms and conditions')}
                            rows={3}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => router.visit(route('invoices.index'))}>
                        {t('Cancel')}
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (isEdit ? t('Updating...') : t('Creating...')) : (isEdit ? t('Update Invoice') : t('Create Invoice'))}
                    </Button>
                </div>
            </form>
        </PageTemplate>
    );
}