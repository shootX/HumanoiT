import React, { useState, useEffect } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { toast } from '@/components/custom-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, CheckSquare, Filter, Search, LayoutGrid, List, Edit, Trash2, Columns3, User, GripVertical, MessageSquare, Paperclip } from 'lucide-react';
import { PageTemplate } from '@/components/page-template';
import TaskModal from './TaskModal';
import TaskFormModal from '@/components/tasks/TaskFormModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { hasPermission } from '@/utils/authorization';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { useTranslation } from 'react-i18next';

interface Task {
    id: number;
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    project: { id: number; title: string };
    task_stage: { id: number; name: string; color: string };
    assigned_to?: { id: number; name: string };
    created_at: string;
}

interface Props {
    tasks: { data: Task[]; total: number; from: number; to: number; links: any[] } | Task[];
    projects: any[];
    stages: Array<{ id: number; name: string; color: string }>;
    members: any[];
    googleCalendarEnabled?: boolean;
    filters: any;
    userWorkspaceRole: string;
    project_name?: string;
    permissions?: any;
}

export default function Index({ tasks, projects, stages, members, googleCalendarEnabled = false, filters, userWorkspaceRole, project_name, permissions }: Props) {
    const { t } = useTranslation();
    const { flash, permissions: pagePermissions } = usePage().props as any;
    const taskPermissions = permissions || pagePermissions;
    
    const formatText = (text: string) => {
        if (!text) return '';
        return text.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    };

    // State declarations first
    const [activeView, setActiveView] = useState(filters.view || 'kanban');
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedProject, setSelectedProject] = useState(filters.project_id || 'all');
    const [selectedStatus, setSelectedStatus] = useState(filters.stage_id || 'all');
    const [selectedPriority, setSelectedPriority] = useState(filters.priority || 'all');
    const [showFilters, setShowFilters] = useState(false);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showTaskFormModal, setShowTaskFormModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

    // Show flash messages
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const tasksData = Array.isArray(tasks) ? tasks : tasks.data;

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters();
    };
    
    const applyFilters = () => {
        const params: any = { page: 1 };
        
        if (searchTerm) params.search = searchTerm;
        if (selectedProject !== 'all') params.project_id = selectedProject;
        if (selectedStatus !== 'all') params.stage_id = selectedStatus;
        if (selectedPriority !== 'all') params.priority = selectedPriority;
        // Only include per_page for non-kanban views
        if (activeView !== 'kanban' && filters.per_page) params.per_page = filters.per_page;
        params.view = activeView;
        if (project_name) params.project_name = project_name;
        
        router.get(route('tasks.index'), params, { preserveState: false, preserveScroll: false });
    };
    
    // Apply filters when view changes
    useEffect(() => {
        if (activeView !== (filters.view || 'kanban')) {
            applyFilters();
        }
    }, [activeView]);
    
    const hasActiveFilters = () => {
        return selectedProject !== 'all' || selectedStatus !== 'all' || selectedPriority !== 'all' || searchTerm !== '';
    };
    
    const activeFilterCount = () => {
        return (selectedProject !== 'all' ? 1 : 0) + (selectedStatus !== 'all' ? 1 : 0) + (selectedPriority !== 'all' ? 1 : 0) + (searchTerm ? 1 : 0);
    };
    
    const handleResetFilters = () => {
        setSelectedProject('all');
        setSelectedStatus('all');
        setSelectedPriority('all');
        setSearchTerm('');
        setShowFilters(false);
        const params: any = { page: 1, view: activeView };
        // Only include per_page for non-kanban views
        if (activeView !== 'kanban' && filters.per_page) params.per_page = filters.per_page;
        if (project_name) params.project_name = project_name;
        router.get(route('tasks.index'), params, { preserveState: false, preserveScroll: false });
    };

    const getPriorityColor = (priority: string) => {
        const colors = {
            low: 'bg-blue-100 text-blue-800',
            medium: 'bg-yellow-100 text-yellow-800',
            high: 'bg-orange-100 text-orange-800',
            critical: 'bg-red-100 text-red-800'
        };
        return colors[priority as keyof typeof colors] || colors.medium;
    };

    const openTaskModal = (task?: Task) => {
        setSelectedTask(task || null);
        if (task) {
            setShowTaskModal(true);
        } else {
            setShowTaskFormModal(true);
        }
    };

    const handleDeleteTask = (task: Task) => {
        setTaskToDelete(task);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (taskToDelete) {
            toast.loading('Deleting task...');
            router.delete(route('tasks.destroy', taskToDelete.id), {
                onSuccess: () => {
                    toast.dismiss();
                    setIsDeleteModalOpen(false);
                    setTaskToDelete(null);
                },
                onError: () => {
                    toast.dismiss();
                    toast.error('Failed to delete task');
                    setIsDeleteModalOpen(false);
                    setTaskToDelete(null);
                }
            });
        }
    };

    const handleStageChange = (taskId: number, stageId: number) => {
        toast.loading('Updating task stage...');
        router.put(route('tasks.change-stage', taskId), {
            task_stage_id: stageId
        }, {
            onSuccess: () => toast.dismiss(),
            onError: () => {
                toast.dismiss();
                toast.error('Failed to update task stage');
            }
        });
    };

    const pageActions = [];
    
    if (taskPermissions?.create) {
        pageActions.push({
            label: t('Create Task'),
            icon: <Plus className="h-4 w-4 mr-2" />,
            variant: 'default' as const,
            onClick: () => openTaskModal()
        });
    }

    const breadcrumbs = project_name ? [
        { title: t('Dashboard'), href: route('dashboard') },
        { title: t('Projects'), href: route('projects.index') },
        { title: project_name },
        { title: t('Tasks') }
    ] : [
        { title: t('Dashboard'), href: route('dashboard') },
        { title: t('Tasks') }
    ];
    
    return (
        <PageTemplate 
            title={project_name ? `${project_name} - ${t('Tasks')}` : t('Tasks')} 
            description=""
            url="/tasks"
            actions={pageActions}
            breadcrumbs={breadcrumbs}
            noPadding
        >
            <Head title={t('Tasks')} />
            
            {/* Overview Cards */}
            <Card className="mb-4 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                    <div className="grid grid-cols-5 gap-4">
                        <div className="text-center">
                            <div className="text-xl font-bold text-blue-600">
                                {Array.isArray(tasks) ? tasks.length : tasks?.total || 0}
                            </div>
                            <div className="text-xs text-gray-600">{t('Total Tasks')}</div>
                        </div>
                        {stages.slice(0, 3).map((stage, index) => {
                            const colors = ['text-orange-600', 'text-blue-600', 'text-green-600'];
                            return (
                                <div key={stage.id} className="text-center">
                                    <div className={`text-xl font-bold ${colors[index] || 'text-gray-600'}`}>
                                        {tasksData?.filter((t: any) => t.task_stage?.id === stage.id).length || 0}
                                    </div>
                                    <div className="text-xs text-gray-600">{stage.name}</div>
                                </div>
                            );
                        })}
                        <div className="text-center">
                            <div className="text-xl font-bold text-red-600">
                                {tasksData?.filter((t: any) => t.priority === 'critical').length || 0}
                            </div>
                            <div className="text-xs text-gray-600">{t('Critical')}</div>
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
                                        placeholder={t('Search tasks...')}
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
                            <div className="border rounded-md p-0.5 mr-2">
                                <Button 
                                    size="sm" 
                                    variant={activeView === 'kanban' ? "default" : "ghost"}
                                    className="h-7 px-2"
                                    onClick={() => setActiveView('kanban')}
                                >
                                    <Columns3 className="h-4 w-4" />
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant={activeView === 'list' ? "default" : "ghost"}
                                    className="h-7 px-2"
                                    onClick={() => setActiveView('list')}
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant={activeView === 'grid' ? "default" : "ghost"}
                                    className="h-7 px-2"
                                    onClick={() => setActiveView('grid')}
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                </Button>
                            </div>
                            
                            {/* Hide per_page filter in Kanban view */}
                            {activeView !== 'kanban' && (
                                <>
                                    <Label className="text-xs text-muted-foreground">Per Page:</Label>
                                    <Select 
                                        value={filters.per_page?.toString() || "20"} 
                                        onValueChange={(value) => {
                                            const params: any = { page: 1, per_page: parseInt(value) };
                                            if (searchTerm) params.search = searchTerm;
                                            if (selectedProject !== 'all') params.project_id = selectedProject;
                                            if (selectedStatus !== 'all') params.stage_id = selectedStatus;
                                            if (selectedPriority !== 'all') params.priority = selectedPriority;
                                            if (selectedSeverity !== 'all') params.severity = selectedSeverity;
                                            params.view = activeView;
                                            if (project_name) params.project_name = project_name;
                                            router.get(route('tasks.index'), params, { preserveState: false, preserveScroll: false });
                                        }}
                                    >
                                        <SelectTrigger className="w-16 h-8">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="z-[9999]">
                                            <SelectItem value="20">20</SelectItem>
                                            <SelectItem value="50">50</SelectItem>
                                            <SelectItem value="100">100</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </>
                            )}
                        </div>
                    </div>
                    
                    {showFilters && (
                        <div className="w-full mt-3 p-4 bg-gray-50 border rounded-md">
                            <div className="flex flex-wrap gap-4 items-end">
                                <div className="space-y-2">
                                    <Label>Project</Label>
                                    <Select value={selectedProject} onValueChange={setSelectedProject}>
                                        <SelectTrigger className="w-40">
                                            <SelectValue placeholder="All Projects" />
                                        </SelectTrigger>
                                        <SelectContent className="z-[9999]">
                                            <SelectItem value="all">All Projects</SelectItem>
                                            {projects.map((project: any) => (
                                                <SelectItem key={project.id} value={project.id.toString()}>
                                                    {project.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                        <SelectTrigger className="w-32">
                                            <SelectValue placeholder="All Statuses" />
                                        </SelectTrigger>
                                        <SelectContent className="z-[9999]">
                                            <SelectItem value="all">All Stages</SelectItem>
                                            {stages.map((stage: any) => (
                                                <SelectItem key={stage.id} value={stage.id.toString()}>
                                                    {stage.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label>Priority</Label>
                                    <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                                        <SelectTrigger className="w-32">
                                            <SelectValue placeholder="All Priorities" />
                                        </SelectTrigger>
                                        <SelectContent className="z-[9999]">
                                            <SelectItem value="all">All Priorities</SelectItem>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="critical">Critical</SelectItem>
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

            {/* Task Content */}
            {activeView === 'kanban' ? (
                <div className="w-full">
                    <style>{`
                        .kanban-scroll::-webkit-scrollbar {
                            height: 8px;
                        }
                        .kanban-scroll::-webkit-scrollbar-track {
                            background: #f1f5f9;
                            border-radius: 4px;
                        }
                        .kanban-scroll::-webkit-scrollbar-thumb {
                            background: #cbd5e1;
                            border-radius: 4px;
                        }
                        .kanban-scroll::-webkit-scrollbar-thumb:hover {
                            background: #94a3b8;
                        }
                    `}</style>
                <div className="bg-gray-50 p-4 rounded-lg overflow-hidden">
                    <div className="flex gap-4 overflow-x-auto pb-4" style={{ height: 'calc(100vh - 280px)', width: '100%' }}>
                        {stages.map((stage) => {
                            const stageTasks = tasksData?.filter((t: any) => t.task_stage?.id === stage.id) || [];
                            return (
                                <div 
                                    key={stage.id} 
                                    className="flex-shrink-0"
                                    style={{ minWidth: 'calc(20% - 16px)', width: 'calc(20% - 16px)' }}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        e.currentTarget.classList.remove('bg-blue-50', 'border-blue-300');
                                        const taskId = e.dataTransfer.getData('taskId');
                                        const currentStageId = e.dataTransfer.getData('currentStageId');
                                        if (taskId && currentStageId !== stage.id.toString()) {
                                            handleStageChange(parseInt(taskId), stage.id);
                                        }
                                    }}
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        e.currentTarget.classList.add('bg-blue-50', 'border-blue-300');
                                    }}
                                    onDragLeave={(e) => {
                                        e.currentTarget.classList.remove('bg-blue-50', 'border-blue-300');
                                    }}
                                >
                                    <div className="bg-gray-100 rounded-lg h-full flex flex-col">
                                        <div className="p-3 border-b border-gray-200">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold text-sm text-gray-700">{stage.name}</h3>
                                                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                                                    {stageTasks.length}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-2 space-y-2 overflow-y-auto flex-1" style={{ maxHeight: 'calc(100vh - 350px)' }}>
                                            {stageTasks.map((task: any) => (
                                                <div
                                                    key={task.id}
                                                    draggable
                                                    onDragStart={(e) => {
                                                        e.dataTransfer.setData('taskId', task.id.toString());
                                                        e.dataTransfer.setData('currentStageId', stage.id.toString());
                                                        e.currentTarget.classList.add('opacity-50', 'scale-95');
                                                    }}
                                                    onDragEnd={(e) => {
                                                        e.currentTarget.classList.remove('opacity-50', 'scale-95');
                                                    }}
                                                    className="cursor-move transition-all duration-200"
                                                >
                                                    <Card className="hover:shadow-md transition-all duration-200 border-l-4" style={{ borderLeftColor: stage.color }}>
                                                        <CardContent className="p-3">
                                                            <div className="space-y-2">
                                                                <div className="flex items-start justify-between gap-2">
                                                                    <div className="flex items-start gap-2 flex-1 min-w-0">
                                                                        <GripVertical className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                                                        <div>
                                                                            <h4 
                                                                                className="font-medium text-sm hover:text-blue-600 transition-colors cursor-pointer break-words"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    openTaskModal(task);
                                                                                }}
                                                                                title={task.title}
                                                                            >
                                                                                {task.title}
                                                                            </h4>
                                                                            {task.description && (
                                                                                <p className="text-xs text-gray-500 mt-1 line-clamp-2" title={task.description}>
                                                                                    {task.description}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex gap-1 flex-shrink-0">

                                                                        <Button 
                                                                            variant="ghost" 
                                                                            size="icon" 
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                openTaskModal(task);
                                                                            }}
                                                                            className="h-6 w-6 text-amber-500 hover:text-amber-700"
                                                                        >
                                                                            <Edit className="h-3 w-3" />
                                                                        </Button>
                                                                        {taskPermissions?.delete && (
                                                                            <Button 
                                                                                variant="ghost" 
                                                                                size="icon" 
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleDeleteTask(task);
                                                                                }}
                                                                                className="h-6 w-6 text-red-500 hover:text-red-700"
                                                                            >
                                                                                <Trash2 className="h-3 w-3" />
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                
                                                                <div className="flex flex-wrap gap-1">
                                                                    <Badge className={getPriorityColor(task.priority)} variant="secondary" size="sm">
                                                                        {formatText(task.priority)}
                                                                    </Badge>
                                                                </div>
                                                                
                                                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                                                    <span className="font-medium">{task.project?.title}</span>
                                                                </div>
                                                                
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-2">
                                                                        {task.assigned_to ? (
                                                                            <div className="flex items-center gap-2">
                                                                                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                                                                                    <span className="text-blue-600 font-semibold text-xs">
                                                                                        {task.assigned_to.name.charAt(0).toUpperCase()}
                                                                                    </span>
                                                                                </div>
                                                                                <span className="text-xs text-gray-700">{task.assigned_to.name}</span>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="flex items-center gap-2">
                                                                                <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                                                                                    <User className="h-3 w-3 text-gray-400" />
                                                                                </div>
                                                                                <span className="text-xs text-gray-500">Unassigned</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                                        {task.comments_count > 0 && (
                                                                            <div className="flex items-center gap-1">
                                                                                <MessageSquare className="h-3 w-3" />
                                                                                <span>{task.comments_count}</span>
                                                                            </div>
                                                                        )}
                                                                        {task.attachments_count > 0 && (
                                                                            <div className="flex items-center gap-1">
                                                                                <Paperclip className="h-3 w-3" />
                                                                                <span>{task.attachments_count}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            ))}
                                            {stageTasks.length === 0 && (
                                                <div className="text-center py-8 text-gray-400">
                                                    <CheckSquare className="h-8 w-8 mx-auto mb-2" />
                                                    <p className="text-sm">{t('No tasks')}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                </div>
            ) : activeView === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {tasksData?.map((task: any) => (
                        <Card key={task.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-base cursor-pointer hover:text-red-600 transition-colors break-words" onClick={() => openTaskModal(task)} title={task.title}>
                                        {task.title}
                                    </CardTitle>
                                    <CheckSquare className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                </div>
                                {task.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2" title={task.description}>{task.description}</p>
                                )}
                            </CardHeader>
                            
                            <CardContent className="py-2">
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <Badge className={getPriorityColor(task.priority)} variant="secondary">
                                            {formatText(task.priority)}
                                        </Badge>
                                    </div>
                                    
                                    <div className="flex justify-between items-center text-xs">
                                        <Badge style={{ backgroundColor: task.task_stage?.color }} className="text-white">
                                            {formatText(task.task_stage?.name)}
                                        </Badge>
                                        <span className="text-muted-foreground">
                                            {task.project?.title}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        {task.assigned_to ? (
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarFallback className="text-xs">
                                                        {task.assigned_to.name?.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-xs text-gray-600">{task.assigned_to.name}</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-500">Unassigned</span>
                                        )}
                                        <div className="text-xs text-gray-500 text-right">
                                            <div>Created: {new Date(task.created_at).toLocaleDateString()}</div>
                                            <div>Updated: {new Date(task.updated_at || task.created_at).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            
                            <CardFooter className="flex justify-end gap-1 pt-0 pb-2">

                                {taskPermissions?.update && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon" onClick={() => openTaskModal(task)} className="text-amber-500 hover:text-amber-700 h-8 w-8">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Edit</TooltipContent>
                                    </Tooltip>
                                )}
                                {taskPermissions?.delete && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task)} className="text-red-500 hover:text-red-700 h-8 w-8">
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {tasksData?.map((task: any) => (
                                    <tr key={task.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <CheckSquare className="h-4 w-4 text-blue-500 mr-2" />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 cursor-pointer hover:text-red-600 transition-colors" onClick={() => openTaskModal(task)}>
                                                        {task.title}
                                                    </div>
                                                    <div className="text-sm text-gray-500 truncate max-w-xs">{task.description}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge style={{ backgroundColor: task.task_stage?.color }} className="text-white">
                                                {formatText(task.task_stage?.name)}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge className={getPriorityColor(task.priority)} variant="secondary">
                                                {formatText(task.priority)}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {task.project?.title}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {task.assigned_to ? (
                                                <div className="flex items-center">
                                                    <Avatar className="h-6 w-6 mr-2">
                                                        <AvatarFallback className="text-xs">
                                                            {task.assigned_to.name?.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm text-gray-900">{task.assigned_to.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-500">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex gap-1">

                                                {taskPermissions?.update && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="ghost" size="icon" onClick={() => openTaskModal(task)} className="text-amber-500 hover:text-amber-700 h-8 w-8">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Edit</TooltipContent>
                                                    </Tooltip>
                                                )}
                                                {taskPermissions?.delete && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task)} className="text-red-500 hover:text-red-700 h-8 w-8">
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

            {(!tasksData || tasksData.length === 0) && (
                <Card className="border-dashed border-2">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <CheckSquare className="w-12 h-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{t('No tasks found')}</h3>
                        <p className="text-gray-500 text-center mb-6">
                            {t('No tasks match your current filters. Try adjusting your search criteria.')}
                        </p>
                        {taskPermissions?.create && (
                            <Button onClick={() => openTaskModal()}>
                                <Plus className="w-4 h-4 mr-2" />
                                {t('Create First Task')}
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}
            
            {/* Pagination - Hidden in Kanban view */}
            {activeView !== 'kanban' && !Array.isArray(tasks) && tasks?.links && (
                <div className="mt-6 bg-white p-4 rounded-lg shadow flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing <span className="font-medium">{tasks?.from || 0}</span> to <span className="font-medium">{tasks?.to || 0}</span> of <span className="font-medium">{tasks?.total || 0}</span> tasks
                    </div>
                    
                    <div className="flex gap-1">
                        {tasks?.links?.map((link: any, i: number) => {
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

            {/* Task Modal - for view/edit */}
            {showTaskModal && selectedTask && (
                <TaskModal
                    task={selectedTask}
                    isOpen={showTaskModal}
                    onClose={() => setShowTaskModal(false)}
                    members={members}
                    stages={stages}
                    milestones={projects.flatMap((p: any) => p.milestones || [])}
                    permissions={taskPermissions}
                />
            )}

            {/* Task Form Modal - for create */}
            {showTaskFormModal && (
                <TaskFormModal
                    isOpen={showTaskFormModal}
                    onClose={() => setShowTaskFormModal(false)}
                    projects={projects}
                    members={members}
                    milestones={projects.flatMap((p: any) => p.milestones || [])}
                    googleCalendarEnabled={googleCalendarEnabled}
                />
            )}

            {/* Delete Modal */}
            <CrudDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setTaskToDelete(null);
                }}
                onConfirm={handleDeleteConfirm}
                itemName={taskToDelete?.title || ''}
                entityName="task"
            />
        </PageTemplate>
    );
}