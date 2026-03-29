import React, { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { route } from 'ziggy-js';
import { PageTemplate } from '@/components/page-template';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileSpreadsheet, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from '@/components/custom-toast';

interface Props {
    projects: Array<{ id: number; title: string }>;
}

interface PreviewItem {
    description: string;
    quantity: number;
    rate: number;
    amount: number;
    unit_label?: string | null;
}

interface PreviewData {
    items: PreviewItem[];
    seller: { identification_code?: string; company_name?: string; raw: string };
    invoice_date: string;
    total_amount: number;
}

export default function ImportFromPurchase({ projects }: Props) {
    const { t } = useTranslation();
    const { flash } = usePage().props as any;

    const [file, setFile] = useState<File | null>(null);
    const [projectId, setProjectId] = useState<string>('__placeholder__');
    const [taskId, setTaskId] = useState<string>('__none__');
    const [tasks, setTasks] = useState<Array<{ id: number; title: string; project_title?: string }>>([]);
    const [preview, setPreview] = useState<PreviewData | null>(null);
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [importing, setImporting] = useState(false);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    useEffect(() => {
        if (!projectId || projectId === '__placeholder__') {
            setTasks([]);
            setTaskId('__none__');
            return;
        }
        const params = new URLSearchParams();
        params.set('project_ids[]', projectId);
        fetch(route('api.invoices.projects-tasks') + '?' + params.toString(), {
            headers: { Accept: 'application/json' },
        })
            .then((r) => r.json())
            .then((data) => setTasks(data.tasks || []))
            .catch(() => setTasks([]));
    }, [projectId]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        setFile(f || null);
        setPreview(null);
    };

    const handlePreview = async () => {
        if (!file) {
            toast.error(t('Please select a file'));
            return;
        }
        setLoadingPreview(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('_token', document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '');
            const res = await fetch(route('invoices.import-from-purchase.preview'), {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    Accept: 'application/json',
                },
            });
            const data = await res.json();
            if (data.items?.length > 0) {
                setPreview(data);
            } else {
                toast.error(t('No valid items found in file.'));
            }
        } catch {
            toast.error(t('Failed to parse file'));
        } finally {
            setLoadingPreview(false);
        }
    };

    const handleImport = async () => {
        if (!file || !projectId || projectId === '__placeholder__') {
            toast.error(t('Select file and project'));
            return;
        }
        if (!preview?.items?.length) {
            toast.error(t('Load preview first'));
            return;
        }
        setImporting(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('project_id', projectId);
            if (taskId && taskId !== '__none__') formData.append('task_id', taskId);
            formData.append('_token', document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '');
            const res = await fetch(route('invoices.import-from-purchase.import'), {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    Accept: 'application/json',
                },
            });
            const data = await res.json();
            if (data.success && data.invoice_id) {
                toast.success(data.message || t('Invoice created successfully!'));
                router.visit(route('invoices.edit', data.invoice_id));
            } else {
                toast.error(data.error || t('Import failed'));
            }
        } catch {
            toast.error(t('Import failed'));
        } finally {
            setImporting(false);
        }
    };

    const formatAmount = (n: number) =>
        n != null ? Number(n).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-';

    const breadcrumbs = [
        { title: t('Dashboard'), href: route('dashboard') },
        { title: t('Invoices'), href: route('invoices.index') },
        { title: t('Import from purchase report') },
    ];

    return (
        <PageTemplate
            title={t('Import from purchase report')}
            description={`${t('Import invoice from XLS purchase report')}. ${t('Purchase report XLS column C is unit optional')}`}
            url="/invoices/import-from-purchase"
            breadcrumbs={breadcrumbs}
        >
            <div className="max-w-4xl space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileSpreadsheet className="h-5 w-5" />
                            {t('Import from purchase report')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>{t('Project')} *</Label>
                                <Select value={projectId} onValueChange={setProjectId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('Select project')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__placeholder__">{t('Select project')}</SelectItem>
                                        {projects?.map((p) => (
                                            <SelectItem key={p.id} value={p.id.toString()}>
                                                {p.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>{t('Task')} ({t('optional')})</Label>
                                <Select value={taskId} onValueChange={setTaskId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('Select task')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__none__">{t('None')}</SelectItem>
                                        {tasks?.map((task) => (
                                            <SelectItem key={task.id} value={task.id.toString()}>
                                                {task.title}
                                                {task.project_title ? ` (${task.project_title})` : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label>{t('XLS file')} (.xls, .xlsx)</Label>
                            <div className="flex gap-2 mt-1">
                                <input
                                    type="file"
                                    accept=".xls,.xlsx"
                                    onChange={handleFileChange}
                                    className="flex-1 text-sm file:mr-2 file:py-2 file:px-4 file:rounded file:border-0 file:bg-muted file:text-sm"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handlePreview}
                                    disabled={!file || loadingPreview}
                                >
                                    {loadingPreview ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Upload className="h-4 w-4 mr-2" />
                                    )}
                                    {t('Preview')}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {preview && (
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('Preview')}</CardTitle>
                            <div className="text-sm text-muted-foreground">
                                {t('Seller')}: {preview.seller?.company_name || preview.seller?.raw || '-'}
                                {preview.seller?.identification_code && (
                                    <span className="ml-2">({preview.seller.identification_code})</span>
                                )}
                                <span className="ml-4">
                                    {t('Date')}: {preview.invoice_date}
                                </span>
                                <span className="ml-4 font-medium">
                                    {t('Total')}: {formatAmount(preview.total_amount)} ₾
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto max-h-64 border rounded-lg">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-muted sticky top-0">
                                        <tr>
                                            <th className="px-4 py-2 text-left">{t('Description')}</th>
                                            <th className="px-4 py-2 text-right">{t('Quantity')}</th>
                                            <th className="px-4 py-2 text-left">{t('Unit')}</th>
                                            <th className="px-4 py-2 text-right">{t('Unit Price')}</th>
                                            <th className="px-4 py-2 text-right">{t('Amount')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {preview.items.map((item, i) => (
                                            <tr key={i} className="border-t">
                                                <td className="px-4 py-2">{item.description}</td>
                                                <td className="px-4 py-2 text-right">{item.quantity}</td>
                                                <td className="px-4 py-2 text-muted-foreground">{item.unit_label || '—'}</td>
                                                <td className="px-4 py-2 text-right">{formatAmount(item.rate)}</td>
                                                <td className="px-4 py-2 text-right">{formatAmount(item.amount)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-4 flex justify-end">
                                <Button
                                    onClick={handleImport}
                                    disabled={importing || !projectId || projectId === '__placeholder__'}
                                >
                                    {importing ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                    )}
                                    {t('Create Invoice')}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </PageTemplate>
    );
}
