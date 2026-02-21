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
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
    projects: Array<{ id: number; title: string }>;
    users: Array<{ id: number; name: string }>;
    stages: Array<{ id: number; name: string; color: string }>;
    stats: {
        total_tasks: number;
        completed_tasks: number;
        completion_percentage: number;
        total_logged_hours: number;
        priority_stats: Record<string, number>;
    };
    tasks: { data: any[]; total: number };
    filters?: Record<string, string>;
}

export default function TaskReportsIndex({ projects, users, stages, stats, tasks: initialTasks, filters: pageFilters = {} }: Props) {
    const { t } = useTranslation();
    const [tasks, setTasks] = useState<any[]>(initialTasks?.data || []);
    const [pagination, setPagination] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState(pageFilters.search || '');
    const [selectedProject, setSelectedProject] = useState(pageFilters.project_id || 'all');
    const [selectedUser, setSelectedUser] = useState(pageFilters.user_id || 'all');
    const [selectedStatus, setSelectedStatus] = useState(pageFilters.status || 'all');
    const [selectedPriority, setSelectedPriority] = useState(pageFilters.priority || 'all');
    const [showFilters, setShowFilters] = useState(false);
    const [perPage, setPerPage] = useState(parseInt(pageFilters.per_page || '15'));
    const [currentPage, setCurrentPage] = useState(1);
    const isFirstMount = useRef(true);

    const fetchTasks = async (page = 1) => {
        try {
            setLoading(true);
            const params: Record<string, string | number> = {
                search: searchTerm || '',
                project_id: selectedProject,
                user_id: selectedUser,
                status: selectedStatus,
                priority: selectedPriority,
                per_page: perPage,
                page,
            };
            const response = await fetch(route('task-reports.tasks'), {
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
            setTasks(data.data || []);
            setPagination(data.pagination || null);
        } catch {
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isFirstMount.current) {
            isFirstMount.current = false;
            return;
        }
        fetchTasks(1);
    }, [selectedProject, selectedUser, selectedStatus, selectedPriority, perPage]);

    const searchFirstMount = useRef(true);
    useEffect(() => {
        if (searchFirstMount.current) {
            searchFirstMount.current = false;
            return;
        }
        const timer = setTimeout(() => fetchTasks(1), 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleExportExcel = () => {
        const params = new URLSearchParams({ format: 'xlsx' });
        if (searchTerm) params.set('search', searchTerm);
        if (selectedProject !== 'all') params.set('project_id', selectedProject);
        if (selectedUser !== 'all') params.set('user_id', selectedUser);
        if (selectedStatus !== 'all') params.set('status', selectedStatus);
        if (selectedPriority !== 'all') params.set('priority', selectedPriority);
        window.open(route('task-reports.export') + '?' + params.toString(), '_blank');
    };

    const formatDate = (d: string) => (d ? new Date(d).toLocaleDateString() : '-');
    const formatText = (text: string) => text?.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') || '';
    const getStatusColor = (s: string) => {
        const c: Record<string, string> = { 'to do': 'bg-gray-100 text-gray-800', 'in progress': 'bg-blue-100 text-blue-800', 'done': 'bg-green-100 text-green-800', 'review': 'bg-purple-100 text-purple-800', 'blocked': 'bg-red-100 text-red-800' };
        return c[(s || '').toLowerCase()] || 'bg-gray-100 text-gray-800';
    };
    const getPriorityColor = (p: string) => ({ low: '#10B77F', medium: '#f59e0b', high: '#f97316', critical: '#ef4444' }[p || 'medium'] || '#6b7280');

    const priorityOrder = ['critical', 'high', 'medium', 'low'];
    const priorityData = priorityOrder.map(p => ({ name: p, value: stats?.priority_stats?.[p] || 0, fill: getPriorityColor(p) }));

    const breadcrumbs = [
        { title: t('Dashboard'), href: route('dashboard') },
        { title: t('Task Report') }
    ];

    const pageActions = [
        { label: t('Export Excel'), icon: <FileSpreadsheet className="h-4 w-4 mr-2" />, variant: 'outline' as const, onClick: handleExportExcel }
    ];

    const hasActiveFilters = selectedProject !== 'all' || selectedUser !== 'all' || selectedStatus !== 'all' || selectedPriority !== 'all' || !!searchTerm;
    const activeFilterCount = [selectedProject !== 'all', selectedUser !== 'all', selectedStatus !== 'all', selectedPriority !== 'all', !!searchTerm].filter(Boolean).length;

    const handleResetFilters = () => {
        setSearchTerm('');
        setSelectedProject('all');
        setSelectedUser('all');
        setSelectedStatus('all');
        setSelectedPriority('all');
        setShowFilters(false);
        setCurrentPage(1);
    };

    return (
        <PageTemplate title={t('Task Report')} description={t('Task Report')} url="/task-reports" actions={pageActions} breadcrumbs={breadcrumbs} noPadding>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-blue-600">{stats?.total_tasks || 0}</div>
                        <div className="text-sm text-muted-foreground">{t('Total Tasks')}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-green-600">{stats?.completed_tasks || 0}</div>
                        <div className="text-sm text-muted-foreground">{t('Completed')}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold">{stats?.completion_percentage || 0}%</div>
                        <div className="text-sm text-muted-foreground">{t('Progress')}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-amber-600">{stats?.total_logged_hours || 0}h</div>
                        <div className="text-sm text-muted-foreground">{t('Logged Hours')}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <ResponsiveContainer width="100%" height={60}>
                            <BarChart data={priorityData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="name" width={50} tick={{ fontSize: 10 }} />
                                <Bar dataKey="value" radius={[0, 2, 2, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                        <div className="text-sm text-muted-foreground">{t('By Priority')}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <CardContent className="p-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <form onSubmit={(e) => { e.preventDefault(); fetchTasks(1); }} className="flex gap-2">
                            <div className="relative w-56">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder={t('Search tasks...')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
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
                                <Label>{t('User')}</Label>
                                <Select value={selectedUser} onValueChange={setSelectedUser}>
                                    <SelectTrigger><SelectValue placeholder={t('All')} /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('All Users')}</SelectItem>
                                        {users?.map((u) => <SelectItem key={u.id} value={u.id.toString()}>{u.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>{t('Status')}</Label>
                                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                    <SelectTrigger><SelectValue placeholder={t('All')} /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('All Status')}</SelectItem>
                                        {stages?.map((s) => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>{t('Priority')}</Label>
                                <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                                    <SelectTrigger><SelectValue placeholder={t('All')} /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('All')}</SelectItem>
                                        <SelectItem value="critical">Critical</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="low">Low</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Tasks Table */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('Task')}</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('Project')}</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('Start')}</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('Due')}</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('Assigned')}</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('Hours')}</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('Priority')}</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('Status')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">{t('Loading...')}</td></tr>
                            ) : tasks?.length === 0 ? (
                                <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">{t('No tasks found.')}</td></tr>
                            ) : (
                                tasks?.map((task) => (
                                    <tr key={task.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-gray-900">{task.title}</div>
                                            {task.description && <div className="text-xs text-gray-500 truncate max-w-xs">{task.description}</div>}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{task.project?.title || '-'}</td>
                                        <td className="px-4 py-3 text-sm">{formatDate(task.start_date)}</td>
                                        <td className="px-4 py-3 text-sm">{formatDate(task.due_date)}</td>
                                        <td className="px-4 py-3 text-sm">{task.assignees || '-'}</td>
                                        <td className="px-4 py-3 text-sm">{task.logged_hours}h</td>
                                        <td className="px-4 py-3">
                                            <Badge variant="secondary" className="text-xs" style={{ backgroundColor: getPriorityColor(task.priority) + '20', color: getPriorityColor(task.priority) }}>
                                                {formatText(task.priority)}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge className={getStatusColor(task.status)} variant="secondary">{task.status || 'To Do'}</Badge>
                                        </td>
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
                            <Button variant="outline" size="sm" disabled={pagination.current_page <= 1} onClick={() => fetchTasks(pagination.current_page - 1)}>{t('Previous')}</Button>
                            <Button variant="outline" size="sm" disabled={pagination.current_page >= pagination.last_page} onClick={() => fetchTasks(pagination.current_page + 1)}>{t('Next')}</Button>
                        </div>
                    </div>
                )}
            </Card>
        </PageTemplate>
    );
}
