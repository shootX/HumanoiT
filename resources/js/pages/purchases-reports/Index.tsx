import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { route } from 'ziggy-js';
import { Search, Filter, FileSpreadsheet } from 'lucide-react';
import { PageTemplate } from '@/components/page-template';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
    projects: Array<{ id: number; title: string }>;
    stats: { total_items: number; total_amount: number };
    items: { data: any[]; total: number };
    filters?: Record<string, string>;
}


export default function PurchasesReportsIndex({ projects, stats, items: initialItems, filters: pageFilters = {} }: Props) {
    const { t } = useTranslation();
    const [items, setItems] = useState<any[]>(initialItems?.data || []);
    const [pagination, setPagination] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState(pageFilters.search || '');
    const [selectedProject, setSelectedProject] = useState(pageFilters.project_id || 'all');
    const [startDate, setStartDate] = useState(pageFilters.start_date || '');
    const [endDate, setEndDate] = useState(pageFilters.end_date || '');
    const [showFilters, setShowFilters] = useState(false);
    const [perPage, setPerPage] = useState(parseInt(pageFilters.per_page || '15'));
    const isFirstMount = useRef(true);

    const fetchItems = async (page = 1) => {
        try {
            setLoading(true);
            const params: Record<string, string | number> = {
                search: searchTerm || '',
                project_id: selectedProject,
                start_date: startDate || '',
                end_date: endDate || '',
                per_page: perPage,
                page,
            };
            const response = await fetch(route('purchases-reports.data'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(params),
            });
            if (!response.ok) throw new Error('Failed to load');
            const data = await response.json();
            setItems(data.data || []);
            setPagination(data.pagination || null);
        } catch {
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isFirstMount.current) {
            isFirstMount.current = false;
            return;
        }
        fetchItems(1);
    }, [selectedProject, perPage, startDate, endDate]);

    const searchFirstMount = useRef(true);
    useEffect(() => {
        if (searchFirstMount.current) {
            searchFirstMount.current = false;
            return;
        }
        const timer = setTimeout(() => fetchItems(1), 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleExportExcel = () => {
        const params = new URLSearchParams({ format: 'xlsx' });
        if (searchTerm) params.set('search', searchTerm);
        if (selectedProject !== 'all') params.set('project_id', selectedProject);
        if (startDate) params.set('start_date', startDate);
        if (endDate) params.set('end_date', endDate);
        window.open(route('purchases-reports.export') + '?' + params.toString(), '_blank');
    };

    const formatAmount = (n: number) => (n != null ? Number(n).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-');

    const breadcrumbs = [
        { title: t('Dashboard'), href: route('dashboard') },
        { title: t('Purchases Report') }
    ];

    const pageActions = [
        { label: t('Export Excel'), icon: <FileSpreadsheet className="h-4 w-4 mr-2" />, variant: 'outline' as const, onClick: handleExportExcel }
    ];

    const hasActiveFilters = selectedProject !== 'all' || !!searchTerm || !!startDate || !!endDate;
    const activeFilterCount = [selectedProject !== 'all', !!searchTerm, !!startDate, !!endDate].filter(Boolean).length;

    const handleResetFilters = () => {
        setSearchTerm('');
        setSelectedProject('all');
        setStartDate('');
        setEndDate('');
        setShowFilters(false);
    };

    return (
        <PageTemplate title={t('Purchases Report')} description={t('Purchases Report')} url="/purchases-reports" actions={pageActions} breadcrumbs={breadcrumbs} noPadding>
            <div className="grid grid-cols-2 gap-4 mb-6">
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-blue-600">{stats?.total_items ?? 0}</div>
                        <div className="text-sm text-muted-foreground">{t('Total Items')}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-green-600">{formatAmount(stats?.total_amount ?? 0)}</div>
                        <div className="text-sm text-muted-foreground">{t('Total Amount')}</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="mb-6">
                <CardContent className="p-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <form onSubmit={(e) => { e.preventDefault(); fetchItems(1); }} className="flex gap-2">
                            <div className="relative w-56">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder={t('Search items...')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
                            </div>
                            <Button type="submit" size="sm">{t('Search')}</Button>
                        </form>
                        <Button variant={hasActiveFilters ? 'default' : 'outline'} size="sm" onClick={() => setShowFilters(!showFilters)}>
                            <Filter className="h-4 w-4 mr-1.5" />
                            {t('Filters')}
                            {hasActiveFilters && <span className="ml-1 bg-primary-foreground text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs">{activeFilterCount}</span>}
                        </Button>
                        {hasActiveFilters && <Button variant="ghost" size="sm" onClick={handleResetFilters}>{t('Reset')}</Button>}
                        <div className="ml-auto flex items-center gap-2">
                            <Label className="text-xs">{t('Per Page')}:</Label>
                            <Select value={perPage.toString()} onValueChange={(v) => setPerPage(parseInt(v))}>
                                <SelectTrigger className="w-16 h-8">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="15">15</SelectItem>
                                    <SelectItem value="25">25</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    {showFilters && (
                        <div className="mt-4 pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <Label>{t('Project')}</Label>
                                <Select value={selectedProject} onValueChange={setSelectedProject}>
                                    <SelectTrigger><SelectValue placeholder={t('All')} /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('All Projects')}</SelectItem>
                                        {projects?.map((p) => <SelectItem key={p.id} value={p.id.toString()}>{p.title}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>{t('Start Date')}</Label>
                                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                            </div>
                            <div>
                                <Label>{t('End Date')}</Label>
                                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('Item Name')}</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('Quantity')}</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('Unit Price')}</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('Total Price')}</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('Task')}</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('Project')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">{t('Loading...')}</td></tr>
                            ) : items?.length === 0 ? (
                                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">{t('No items found.')}</td></tr>
                            ) : (
                                items?.map((item: any) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900">{item.description || '-'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{item.quantity ?? '-'}</td>
                                        <td className="px-4 py-3 text-sm">{formatAmount(item.rate)}</td>
                                        <td className="px-4 py-3 text-sm font-medium">{formatAmount(item.amount)}</td>
                                        <td className="px-4 py-3 text-sm">{item.task?.title ?? '-'}</td>
                                        <td className="px-4 py-3 text-sm">{item.project?.title ?? '-'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {pagination && pagination.last_page > 1 && (
                    <div className="px-4 py-3 border-t flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                            {t('Showing')} {pagination.from}-{pagination.to} {t('of')} {pagination.total}
                        </span>
                        <div className="flex gap-1">
                            <Button variant="outline" size="sm" disabled={pagination.current_page <= 1} onClick={() => fetchItems(pagination.current_page - 1)}>{t('Previous')}</Button>
                            <Button variant="outline" size="sm" disabled={pagination.current_page >= pagination.last_page} onClick={() => fetchItems(pagination.current_page + 1)}>{t('Next')}</Button>
                        </div>
                    </div>
                )}
            </Card>
        </PageTemplate>
    );
}
