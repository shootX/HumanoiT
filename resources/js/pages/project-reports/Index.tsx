import { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Search, Filter, Eye, Edit } from 'lucide-react';
import { PageTemplate } from '@/components/page-template';
import { CrudFormModal } from '@/components/CrudFormModal';
import { hasPermission } from '@/utils/authorization';
import { useTranslation } from 'react-i18next';

export default function ProjectReportsIndex() {
    const { t } = useTranslation();
    const { auth, projects, users, filters: pageFilters = {} } = usePage().props as any;
    const permissions = auth?.permissions || [];
    
    const formatText = (text: string) => {
        return text.replace(/_/g, ' ').split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
    };
    
    const [searchTerm, setSearchTerm] = useState(pageFilters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(pageFilters.status || 'all');
    const [selectedUser, setSelectedUser] = useState(pageFilters.user_id || 'all');
    const [showFilters, setShowFilters] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentProject, setCurrentProject] = useState<any>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters();
    };
    
    const applyFilters = () => {
        const params: any = { page: 1 };
        
        if (searchTerm) params.search = searchTerm;
        if (selectedStatus !== 'all') params.status = selectedStatus;
        if (selectedUser !== 'all') params.user_id = selectedUser;
        if (pageFilters.per_page) params.per_page = pageFilters.per_page;
        
        router.get(route('project-reports.index'), params, { preserveState: false, preserveScroll: false });
    };
    
    const handleStatusFilter = (value: string) => {
        setSelectedStatus(value);
        const params: any = { page: 1 };
        if (searchTerm) params.search = searchTerm;
        if (value !== 'all') params.status = value;
        if (selectedUser !== 'all') params.user_id = selectedUser;
        if (pageFilters.per_page) params.per_page = pageFilters.per_page;
        router.get(route('project-reports.index'), params, { preserveState: false, preserveScroll: false });
    };
    
    const handleUserFilter = (value: string) => {
        setSelectedUser(value);
        const params: any = { page: 1 };
        if (searchTerm) params.search = searchTerm;
        if (selectedStatus !== 'all') params.status = selectedStatus;
        if (value !== 'all') params.user_id = value;
        if (pageFilters.per_page) params.per_page = pageFilters.per_page;
        router.get(route('project-reports.index'), params, { preserveState: false, preserveScroll: false });
    };
    
    const hasActiveFilters = () => {
        return selectedStatus !== 'all' || selectedUser !== 'all' || searchTerm !== '';
    };
    
    const activeFilterCount = () => {
        return (selectedStatus !== 'all' ? 1 : 0) + (selectedUser !== 'all' ? 1 : 0) + (searchTerm ? 1 : 0);
    };
    
    const handleResetFilters = () => {
        setSelectedStatus('all');
        setSelectedUser('all');
        setSearchTerm('');
        setShowFilters(false);
        router.get(route('project-reports.index'), { page: 1, per_page: pageFilters.per_page }, { preserveState: false, preserveScroll: false });
    };
    
    const handleEditProject = (project: any) => {
        setCurrentProject(project);
        setIsEditModalOpen(true);
    };
    
    const handleFormSubmit = (formData: any) => {
        router.put(route('projects.update', currentProject.id), formData, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                router.reload();
            }
        });
    };

    const getStatusColor = (status: string) => {
        const colors = {
            'active': 'bg-green-100 text-green-800',
            'planning': 'bg-blue-100 text-blue-800',
            'on_hold': 'bg-yellow-100 text-yellow-800',
            'completed': 'bg-gray-100 text-gray-800',
            'cancelled': 'bg-red-100 text-red-800'
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? '-' : date.toLocaleDateString();
    };
    
    const getRoleColor = (role: string) => {
        const colors = {
            'owner': 'bg-purple-500',
            'manager': 'bg-blue-500', 
            'member': 'bg-green-500',
            'client': 'bg-orange-500'
        };
        return colors[role as keyof typeof colors] || 'bg-gray-500';
    };
    
    const breadcrumbs = [
        { title: t('Dashboard'), href: route('dashboard') },
        { title: t('Project Reports') }
    ];

    return (
        <PageTemplate 
            title={t('Project Reports')} 
            url="/project-reports"
            actions={[]}
            breadcrumbs={breadcrumbs}
            noPadding
        >
            {/* Overview Row */}
            <Card className="mb-4 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                    <div className="grid grid-cols-5 gap-4">
                        <div className="text-center">
                            <div className="text-xl font-bold text-blue-600">
                                {projects?.total || 0}
                            </div>
                            <div className="text-xs text-gray-600">{t('Total Projects')}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold text-green-600">
                                {projects?.data?.filter((project: any) => project.status === 'active').length || 0}
                            </div>
                            <div className="text-xs text-gray-600">{t('Active')}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold text-blue-600">
                                {projects?.data?.filter((project: any) => project.status === 'completed').length || 0}
                            </div>
                            <div className="text-xs text-gray-600">{t('Completed')}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold text-yellow-600">
                                {projects?.data?.filter((project: any) => project.status === 'on_hold').length || 0}
                            </div>
                            <div className="text-xs text-gray-600">{t('On Hold')}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold text-orange-600">
                                {projects?.data?.filter((project: any) => project.priority === 'high' || project.priority === 'urgent').length || 0}
                            </div>
                            <div className="text-xs text-gray-600">{t('High Priority')}</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Search and filters section */}
            <div className="bg-white rounded-lg shadow mb-4">
                <div className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <form onSubmit={handleSearch} className="flex gap-2">
                                <div className="relative w-64">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder={t('Search projects...')}
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
                            
                            <div className="ml-2">
                                <Button 
                                    variant={hasActiveFilters() ? "default" : "outline"}
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
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <Label className="text-xs text-muted-foreground">{t('Per Page')}:</Label>
                            <Select 
                                value={pageFilters.per_page?.toString() || "10"} 
                                onValueChange={(value) => {
                                    const params: any = { page: 1, per_page: parseInt(value) };
                                    if (searchTerm) params.search = searchTerm;
                                    if (selectedStatus !== 'all') params.status = selectedStatus;
                                    if (selectedUser !== 'all') params.user_id = selectedUser;
                                    router.get(route('project-reports.index'), params, { preserveState: false, preserveScroll: false });
                                }}
                            >
                                <SelectTrigger className="w-16 h-8">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="24">20</SelectItem>
                                    <SelectItem value="48">30</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    
                    {showFilters && (
                        <div className="w-full mt-3 p-4 bg-gray-50 border rounded-md">
                            <div className="flex flex-wrap gap-4 items-end">
                                <div className="space-y-2">
                                    <Label>{t('Status')}</Label>
                                    <Select value={selectedStatus} onValueChange={handleStatusFilter}>
                                        <SelectTrigger className="w-40">
                                            <SelectValue placeholder={t('All Status')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">{t('All Status')}</SelectItem>
                                            <SelectItem value="planning">{t('Planning')}</SelectItem>
                                            <SelectItem value="active">{t('Active')}</SelectItem>
                                            <SelectItem value="on_hold">{t('On Hold')}</SelectItem>
                                            <SelectItem value="completed">{t('Completed')}</SelectItem>
                                            <SelectItem value="cancelled">{t('Cancelled')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label>{t('User')}</Label>
                                    <Select value={selectedUser} onValueChange={handleUserFilter}>
                                        <SelectTrigger className="w-40">
                                            <SelectValue placeholder={t('All Users')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">{t('All Users')}</SelectItem>
                                            {users?.map((user: any) => (
                                                <SelectItem key={user.id} value={user.id.toString()}>
                                                    {user.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="h-9"
                                    onClick={handleResetFilters}
                                    disabled={!hasActiveFilters()}
                                >
                                    {t('Reset Filters')}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Projects Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Project')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Start Date')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Due Date')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Members')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Progress')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Status')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {projects?.data?.map((project: any) => (
                                <tr key={project.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {project.title || project.name}
                                            </div>
                                            <div className="text-sm text-gray-500 truncate max-w-xs">{project.description}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(project.start_date)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(project.deadline || project.end_date)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {[...project.members || [], ...project.clients || []].length > 0 ? (
                                            <div className="flex -space-x-1">
                                                {[...project.members || [], ...project.clients || []].slice(0, 3).map((member: any, index: number) => {
                                                    const isClient = project.clients?.some((c: any) => c.id === member.id || c.user?.id === member.id);
                                                    const role = isClient ? 'client' : (member.role || 'member');
                                                    return (
                                                        <Tooltip key={index}>
                                                            <TooltipTrigger asChild>
                                                                <div className={`h-6 w-6 rounded-full border-2 border-white cursor-pointer ${getRoleColor(role)} flex items-center justify-center`}>
                                                                    <span className="text-xs text-white font-medium">
                                                                        {(member.user?.name || member.name)?.charAt(0)?.toUpperCase() || '?'}
                                                                    </span>
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <div className="text-center">
                                                                    <div>{member.user?.name || member.name}</div>
                                                                </div>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    );
                                                })}
                                                {[...project.members || [], ...project.clients || []].length > 3 && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs cursor-pointer">
                                                                +{[...project.members || [], ...project.clients || []].length - 3}
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            {[...project.members || [], ...project.clients || []].slice(3).map((m: any) => m.user?.name || m.name).join(', ')}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-500">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                                <div className="bg-blue-600 h-2 rounded-full" style={{width: `${project.progress || project.progress_percentage || 0}%`}}></div>
                                            </div>
                                            <span className="text-sm text-gray-900">{project.progress || project.progress_percentage || 0}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Badge className={getStatusColor(project.status)} variant="secondary">
                                            {formatText(project.status)}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex gap-1">
                                            {hasPermission(permissions, 'project_report_view') && (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            onClick={() => router.get(route('project-reports.show', project.id))}
                                                            className="text-blue-500 hover:text-blue-700 h-8 w-8"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>{t('View Report')}</TooltipContent>
                                                </Tooltip>
                                            )}
                                            {hasPermission(permissions, 'project_update') && (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            onClick={() => handleEditProject(project)}
                                                            className="text-amber-500 hover:text-amber-700 h-8 w-8"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>{t('Edit Project')}</TooltipContent>
                                                </Tooltip>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {(!projects?.data || projects.data.length === 0) && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">
                            {t('No projects found matching your criteria.')}
                        </p>
                    </div>
                )}
            </div>
            
            {/* Pagination */}
            {projects?.links && (
                <div className="mt-6 bg-white p-4 rounded-lg shadow flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        {t('Showing')} <span className="font-medium">{projects?.from || 0}</span> {t('to')} <span className="font-medium">{projects?.to || 0}</span> {t('of')} <span className="font-medium">{projects?.total || 0}</span> {t('projects')}
                    </div>
                    
                    <div className="flex gap-1">
                        {projects?.links?.map((link: any, i: number) => {
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
            
            {/* Edit Project Modal */}
            <CrudFormModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={handleFormSubmit}
                formConfig={{
                    fields: [
                        { name: 'title', label: t('Project Title'), type: 'text', required: true },
                        { name: 'description', label: t('Description'), type: 'textarea' },
                        { 
                            name: 'status', 
                            label: t('Status'), 
                            type: 'select',
                            options: [
                                { value: 'planning', label: 'Planning' },
                                { value: 'active', label: 'Active' },
                                { value: 'on_hold', label: 'On Hold' },
                                { value: 'completed', label: 'Completed' },
                                { value: 'cancelled', label: 'Cancelled' }
                            ],
                            required: true
                        },
                        { 
                            name: 'priority', 
                            label: t('Priority'), 
                            type: 'select',
                            options: [
                                { value: 'low', label: 'Low' },
                                { value: 'medium', label: 'Medium' },
                                { value: 'high', label: 'High' },
                                { value: 'urgent', label: 'Urgent' }
                            ],
                            required: true
                        },
                        { name: 'start_date', label: t('Start Date'), type: 'date' },
                        { name: 'deadline', label: t('Deadline'), type: 'date' },
                        { name: 'estimated_hours', label: t('Estimated Hours'), type: 'number', min: 0 },
                        { name: 'is_public', label: t('Make project public'), type: 'checkbox' }
                    ],
                    modalSize: 'xl'
                }}
                initialData={currentProject}
                title={t('Edit Project')}
                mode="edit"
            />
        </PageTemplate>
    );
}