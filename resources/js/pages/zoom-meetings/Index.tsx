import { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Eye, Edit, Trash2, Video, Calendar, Clock, Users, Copy } from 'lucide-react';
import { PageTemplate } from '@/components/page-template';
import { EnhancedDeleteModal } from '@/components/EnhancedDeleteModal';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';
import { toast } from '@/components/custom-toast';
import { hasPermission } from '@/utils/authorization';
import { useTranslation } from 'react-i18next';
import ZoomMeetingModal from './ZoomMeetingModal';
import { formatDateTime } from '@/lib/utils';

export default function ZoomMeetingIndex() {
    const { t } = useTranslation();
    const { auth, meetings, projects, members, hasZoomConfig, filters: pageFilters = {}, permissions, flash, googleCalendarEnabled } = usePage().props as any;
    
    const formatText = (text: string) => {
        return text.replace(/_/g, ' ').split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
    };
    
    const [searchTerm, setSearchTerm] = useState(pageFilters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(pageFilters.status || 'all');
    const [selectedProject, setSelectedProject] = useState(pageFilters.project_id || 'all');
    const [showFilters, setShowFilters] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentMeeting, setCurrentMeeting] = useState<any>(null);

    // Handle flash messages
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
        if (selectedProject !== 'all') params.project_id = selectedProject;
        
        router.get(route('zoom-meetings.index'), params, { preserveState: false, preserveScroll: false });
    };

    const handleJoinMeeting = (meeting: any) => {
        if (meeting.join_url) {
            window.open(meeting.join_url, '_blank');
        }
    };

    const handleStartMeeting = (meeting: any) => {
        if (meeting.start_url) {
            window.open(meeting.start_url, '_blank');
        }
    };

    const handleEditMeeting = (meeting: any) => {
        setCurrentMeeting(meeting);
        setIsEditModalOpen(true);
    };

    const handleDeleteMeeting = (meeting: any) => {
        setCurrentMeeting(meeting);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = () => {
        toast.loading('Deleting meeting...');
        router.delete(route('zoom-meetings.destroy', currentMeeting.id), {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                toast.dismiss();
                if (flash?.success) {
                    toast.success(flash.success);
                }
            },
            onError: (errors) => {
                toast.dismiss();
                if (flash?.error) {
                    toast.error(flash.error);
                } else {
                    toast.error(t('Failed to delete meeting'));
                }
            }
        });
    };

    const getStatusColor = (status: string) => {
        const colors = {
            scheduled: 'bg-blue-100 text-blue-800',
            started: 'bg-green-100 text-green-800',
            ended: 'bg-gray-100 text-gray-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return colors[status as keyof typeof colors] || colors.scheduled;
    };

    const hasActiveFilters = () => {
        return selectedStatus !== 'all' || selectedProject !== 'all' || searchTerm !== '';
    };

    const activeFilterCount = () => {
        return (selectedStatus !== 'all' ? 1 : 0) + (selectedProject !== 'all' ? 1 : 0) + (searchTerm ? 1 : 0);
    };

    const handleResetFilters = () => {
        setSelectedStatus('all');
        setSelectedProject('all');
        setSearchTerm('');
        setShowFilters(false);
        router.get(route('zoom-meetings.index'), { page: 1 }, { preserveState: false, preserveScroll: false });
    };

    // Show configuration message when Zoom is not configured
    if (!hasZoomConfig) {
        const userRoles = auth?.user?.roles?.map(role => role.name) || [];
        const canConfigureZoom = userRoles.includes('company') || userRoles.includes('owner');
        
        return (
            <PageTemplate title={t('Zoom Meetings')} url="/zoom-meetings">
                <Card>
                    <CardContent className="p-6 text-center">
                        <Video className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {t('Zoom Integration Not Configured')}
                        </h3>
                        <p className="text-gray-500 mb-4">
                            {canConfigureZoom 
                                ? t('Please configure your Zoom API credentials in settings to use this feature.')
                                : t('Zoom integration has not been configured for this workspace. Please contact your administrator to set up Zoom credentials.')
                            }
                        </p>
                        {canConfigureZoom && (
                            <Button onClick={() => router.get(route('settings'))}>
                                {t('Configure Zoom Settings')}
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </PageTemplate>
        );
    }

    const pageActions = [];
    
    if (hasPermission(auth?.permissions, 'zoom_meeting_create')) {
        pageActions.push({
            label: t('Create Meeting'),
            icon: <Plus className="h-4 w-4 mr-2" />,
            variant: 'default',
            onClick: () => {
                console.log('Create Meeting button clicked');
                setIsCreateModalOpen(true);
            }
        });
    }
    
    const breadcrumbs = [
        { title: t('Dashboard'), href: route('dashboard') },
        { title: t('Zoom Meetings') }
    ];

    return (
        <PageTemplate 
            title={t('Zoom Meetings')} 
            url="/zoom-meetings"
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
                                {meetings?.total || 0}
                            </div>
                            <div className="text-xs text-gray-600">{t('Total Meetings')}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold text-green-600">
                                {meetings?.data?.filter((meeting: any) => meeting.status === 'scheduled').length || 0}
                            </div>
                            <div className="text-xs text-gray-600">{t('Scheduled')}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold text-orange-600">
                                {meetings?.data?.filter((meeting: any) => new Date(meeting.start_time) > new Date()).length || 0}
                            </div>
                            <div className="text-xs text-gray-600">{t('Upcoming')}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold text-gray-600">
                                {meetings?.data?.filter((meeting: any) => meeting.status === 'ended').length || 0}
                            </div>
                            <div className="text-xs text-gray-600">{t('Completed')}</div>
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
                                { value: 'scheduled', label: 'Scheduled' },
                                { value: 'started', label: 'Started' },
                                { value: 'ended', label: 'Ended' },
                                { value: 'cancelled', label: 'Cancelled' }
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
                                ...(projects?.map((project: any) => ({ value: project.id.toString(), label: project.title })) || [])
                            ]
                        }
                    ]}
                    showFilters={showFilters}
                    setShowFilters={setShowFilters}
                    hasActiveFilters={hasActiveFilters}
                    activeFilterCount={activeFilterCount}
                    onResetFilters={handleResetFilters}
                    currentPerPage={pageFilters.per_page?.toString() || new URLSearchParams(window.location.search).get('per_page') || "12"}
                    onPerPageChange={(value) => {
                        const params: any = { page: 1, per_page: parseInt(value) };
                        if (searchTerm) params.search = searchTerm;
                        if (selectedStatus !== 'all') params.status = selectedStatus;
                        if (selectedProject !== 'all') params.project_id = selectedProject;
                        router.get(route('zoom-meetings.index'), params, { preserveState: false, preserveScroll: true });
                    }}
                    perPageOptions={[12, 24, 48, 100]}
                />
            </div>

            {/* Meetings List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Meeting')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Status')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Date & Time')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Duration')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Project')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Meeting URLs')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {meetings?.data?.length > 0 ? meetings.data.map((meeting: any) => (
                                <tr key={meeting.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {meeting.title}
                                            </div>
                                            {meeting.description && (
                                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                                    {meeting.description}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Badge className={getStatusColor(meeting.status)} variant="secondary">
                                            {formatText(meeting.status)}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="flex items-center">
                                            <Clock className="h-4 w-4 mr-1" />
                                            {meeting.start_time ? meeting.start_time.substring(0, 16).replace('T', ' ') : ''}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {meeting.duration} {t('minutes')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {meeting.project?.title || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex gap-1">
                                            {meeting.join_url && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(meeting.join_url);
                                                        toast.success(t('Join URL copied to clipboard'));
                                                    }}
                                                    className="text-blue-600 border-blue-200 hover:bg-blue-50 h-7 px-2 text-xs"
                                                >
                                                    <Copy className="h-3 w-3 mr-1" />
                                                    {t('Join URL')}
                                                </Button>
                                            )}
                                            {meeting.start_url && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(meeting.start_url);
                                                        toast.success(t('Start URL copied to clipboard'));
                                                    }}
                                                    className="text-green-600 border-green-200 hover:bg-green-50 h-7 px-2 text-xs"
                                                >
                                                    <Copy className="h-3 w-3 mr-1" />
                                                    {t('Start URL')}
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex gap-1">
                                            {hasPermission(auth?.permissions, 'zoom_meeting_view') && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => router.get(route('zoom-meetings.show', meeting.id))}
                                                    className="text-blue-500 hover:text-blue-700 h-8 w-8"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            )}
                                            {hasPermission(auth?.permissions, 'zoom_meeting_update') && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEditMeeting(meeting)}
                                                    className="text-amber-500 hover:text-amber-700 h-8 w-8"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            )}
                                            {hasPermission(auth?.permissions, 'zoom_meeting_delete') && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteMeeting(meeting)}
                                                    className="text-red-500 hover:text-red-700 h-8 w-8"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <Video className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            {t('No meetings found')}
                                        </h3>
                                        <p className="text-gray-500 mb-4">
                                            {t('Get started by creating your first Zoom meeting.')}
                                        </p>
                                        {hasPermission(auth?.permissions, 'zoom_meeting_create') && (
                                            <Button onClick={() => setIsCreateModalOpen(true)}>
                                                <Plus className="h-4 w-4 mr-2" />
                                                {t('Create Meeting')}
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* Pagination */}
            {meetings?.links && meetings.data.length > 0 && (
                <div className="mt-6 bg-white p-4 rounded-lg shadow flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-muted-foreground">
                            {t('Showing')} <span className="font-medium">{meetings?.from || 0}</span> {t('to')} <span className="font-medium">{meetings?.to || 0}</span> {t('of')} <span className="font-medium">{meetings?.total || 0}</span> {t('meetings')}
                        </div>

                    </div>
                    
                    <div className="flex gap-1">
                        {meetings?.links?.map((link: any, i: number) => {
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

            {/* Create Modal */}
            <ZoomMeetingModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                projects={projects || []}
                members={members || []}
                googleCalendarEnabled={googleCalendarEnabled}
            />

            {/* Edit Modal */}
            <ZoomMeetingModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                meeting={currentMeeting}
                projects={projects || []}
                members={members || []}
                googleCalendarEnabled={googleCalendarEnabled}
            />

            {/* Delete Modal */}
            <EnhancedDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                itemName={currentMeeting?.title || ''}
                entityName={t('meeting')}
                warningMessage={t('This meeting will be permanently deleted from Zoom as well.')}
            />
        </PageTemplate>
    );
}