import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { PageTemplate } from '@/components/page-template';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';

interface InvoiceItem {
    type: 'task';
    description: string;
    quantity: number;
    rate: number;
    amount: number;
    task_id: number | null;
}

interface Props {
    invoice?: any;
    projects: any[];
    clients: any[];
    currencies: any[];
    taxes: any[];
}

export default function InvoiceForm({ invoice, projects, clients, currencies, taxes }: Props) {
    const { t } = useTranslation();
    const isEdit = !!invoice;
    
    const [formData, setFormData] = useState({
        project_id: invoice?.project_id?.toString() || '',
        budget_category_id: invoice?.budget_category_id?.toString() || '',
        client_id: invoice?.client_id?.toString() || '',
        title: invoice?.title || '',
        description: invoice?.description || '',
        invoice_date: invoice?.invoice_date ? new Date(invoice.invoice_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        due_date: invoice?.due_date ? new Date(invoice.due_date).toISOString().split('T')[0] : '',

        selected_taxes: invoice?.selected_taxes || [],

        currency: invoice?.currency || 'USD',
        notes: invoice?.notes || '',
        terms: invoice?.terms || '',
    });

    const [items, setItems] = useState<InvoiceItem[]>(
        invoice?.items?.map((item: any) => ({
            type: 'task',
            description: item.description || '',
            quantity: item.quantity || 1,
            rate: item.rate || 0,
            amount: item.amount || 0,
            task_id: item.task_id,
        })) || [{
            type: 'task',
            description: '',
            quantity: 1,
            rate: 0,
            amount: 0,
            task_id: null
        }]
    );

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [projectTasks, setProjectTasks] = useState([]);
    const [budgetCategories, setBudgetCategories] = useState<any[]>([]);
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
        
        if (field === 'project_id' && value) {
            loadProjectData(value);
        } else if (field === 'project_id' && !value) {
            setProjectTasks([]);
            setBudgetCategories([]);
            setProjectClients([]);
            setAvailableClients(clients || []);
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
            setProjectClients([]);
            setAvailableClients(clients || []);
        }
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const updatedItems = [...items];
        updatedItems[index] = {
            ...updatedItems[index],
            [field]: value
        };
        // Auto-calculate amount = quantity × rate
        if (field === 'quantity' || field === 'rate') {
            const qty = field === 'quantity' ? (parseInt(value) || 0) : (updatedItems[index].quantity || 1);
            const rate = field === 'rate' ? (parseFloat(value) || 0) : (updatedItems[index].rate || 0);
            updatedItems[index].amount = qty * rate;
        }
        setItems(updatedItems);
    };

    const addItem = () => {
        setItems([...items, {
            type: 'task',
            description: '',
            quantity: 1,
            rate: 0,
            amount: 0,
            task_id: null
        }]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const calculateSubtotal = () => {
        return items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    };

    const calculateTaxAmount = (subtotal: number, tax: any) => {
        const rate = tax?.rate || 0;
        if (tax?.is_inclusive) {
            return subtotal - (subtotal / (1 + rate / 100));
        }
        return (subtotal * rate) / 100;
    };

    const calculateTax = () => {
        if (!formData.selected_taxes || !formData.selected_taxes.length) return 0;
        const subtotal = calculateSubtotal();
        return formData.selected_taxes.reduce((total: number, taxId: number) => {
            const tax = taxes?.find(t => t.id == taxId); // Use == for loose comparison
            if (!tax) return total;
            if (tax.is_inclusive) return total;
            return total + calculateTaxAmount(subtotal, tax);
        }, 0);
    };

    const calculateTotal = () => {
        return calculateSubtotal() + calculateTax();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const submitData = {
            ...formData,
            client_id: formData.client_id === 'none' ? null : formData.client_id,
            budget_category_id: formData.budget_category_id && formData.budget_category_id !== 'none' ? formData.budget_category_id : null,
            items: items.filter(item => item.task_id !== null && item.task_id !== 'no-tasks').map(item => ({
                type: item.type,
                task_id: item.task_id,
                description: item.description,
                quantity: item.quantity || 1,
                rate: item.rate || 0,
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
                            <CardTitle>{t('Invoice Items')}</CardTitle>
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
                                    <div className="grid grid-cols-12 gap-2 items-end">
                                        <div className="col-span-11">
                                            <Label>{t('Task')}</Label>
                                            <Select 
                                                value={item.task_id?.toString() || ''} 
                                                onValueChange={(value) => handleItemChange(index, 'task_id', value ? parseInt(value) : null)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t('Select task')} />
                                                </SelectTrigger>
                                                <SelectContent className="z-[9999]">
                                                    {projectTasks.map((task: any) => (
                                                        <SelectItem key={task.id} value={task.id.toString()}>
                                                            {task.title}
                                                        </SelectItem>
                                                    ))}
                                                    {projectTasks.length === 0 && (
                                                        <SelectItem value="no-tasks" disabled>
                                                            {formData.project_id ? t('No tasks found') : t('Select project first')}
                                                        </SelectItem>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="col-span-1">
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
                                    <div className="grid grid-cols-12 gap-2 items-end">
                                        <div className="col-span-5">
                                            <Label>{t('Description')}</Label>
                                            <Input
                                                value={item.description}
                                                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                placeholder={t('Item description')}
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <Label>{t('Quantity')}</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                step="1"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <Label>{t('Unit Price')}</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={item.rate}
                                                onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                                            />
                                        </div>
                                        <div className="col-span-3">
                                            <Label>{t('Amount')}</Label>
                                            <Input
                                                type="number"
                                                value={item.amount.toFixed(2)}
                                                readOnly
                                                className="bg-gray-50 font-semibold"
                                            />
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
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Label>{t('Taxes')}</Label>
                                <Select 
                                    value="" 
                                    onValueChange={(value) => {
                                        const taxId = parseInt(value);
                                        if (!formData.selected_taxes.includes(taxId)) {
                                            handleInputChange('selected_taxes', [...formData.selected_taxes, taxId]);
                                        }
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('Select taxes')} />
                                    </SelectTrigger>
                                    <SelectContent className="z-[9999]">
                                        {taxes?.filter(tax => !formData.selected_taxes.some((selectedId: number) => selectedId == tax.id)).map((tax: any) => (
                                            <SelectItem key={tax.id} value={tax.id.toString()}>
                                                {tax.name} ({tax.rate}%){tax.is_inclusive ? ' included' : ''}
                                            </SelectItem>
                                        ))}
                                        {taxes?.filter(tax => !formData.selected_taxes.some((selectedId: number) => selectedId == tax.id)).length === 0 && (
                                            <SelectItem value="no-taxes" disabled>
                                                {taxes?.length === 0 ? t('No taxes configured') : t('All taxes selected')}
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                                
                                {/* Selected Taxes Display */}
                                {formData.selected_taxes && formData.selected_taxes.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {formData.selected_taxes.map((taxId: number) => {
                                            const tax = taxes?.find(t => t.id == taxId); // Use == for loose comparison
                                            return tax ? (
                                                <div key={taxId} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                                                    <span>{tax.name} ({tax.rate}%){tax.is_inclusive ? ' included' : ''}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            handleInputChange('selected_taxes', formData.selected_taxes.filter((id: number) => id != taxId));
                                                        }}
                                                        className="ml-1 text-blue-600 hover:text-blue-800"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ) : (
                                                <div key={taxId} className="flex items-center gap-1 bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                                                    <span>Tax ID: {taxId} (Not Found)</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            handleInputChange('selected_taxes', formData.selected_taxes.filter((id: number) => id != taxId));
                                                        }}
                                                        className="ml-1 text-red-600 hover:text-red-800"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                        </div>
                        
                        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                                <span className="mr-2">$</span>
                                {t('Total Calculation')}
                            </h3>
                            
                            <div className="space-y-3">
                                <div className="flex justify-between text-gray-700">
                                    <span>{t('Subtotal')}:</span>
                                    <span>{formatCurrency(calculateSubtotal())}</span>
                                </div>
                                
                                    {formData.selected_taxes && formData.selected_taxes.map((taxId: number) => {
                                    const tax = taxes?.find(t => t.id == taxId); // Use == for loose comparison
                                    if (!tax) return null;
                                    const taxAmount = calculateTaxAmount(calculateSubtotal(), tax);
                                    const labelSuffix = tax.is_inclusive ? ' (included)' : '';
                                    return (
                                        <div key={taxId} className="flex justify-between text-gray-700">
                                            <span>{tax.name} ({tax.rate}%){labelSuffix}:</span>
                                            <span>{formatCurrency(taxAmount)}</span>
                                        </div>
                                    );
                                })}
                                
                                <div className="border-t pt-3">
                                    <div className="flex justify-between font-bold text-xl text-blue-600">
                                        <span>{t('Total')}:</span>
                                        <span>{formatCurrency(calculateTotal())}</span>
                                    </div>
                                </div>
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