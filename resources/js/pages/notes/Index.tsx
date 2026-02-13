import React, { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { toast } from '@/components/custom-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, Search, Filter, Eye, Edit, Trash2, StickyNote, Users, User, LayoutGrid, List } from 'lucide-react';
import { PageTemplate } from '@/components/page-template';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';
import { useTranslation } from 'react-i18next';
import NoteFormModal from '@/components/notes/NoteFormModal';

interface Note {
    id: number;
    title: string;
    text: string;
    color: string;
    type: 'personal' | 'shared';
    assign_to: string | null;
    workspace: number;
    created_by: number;
    created_at: string;
    creator: {
        id: number;
        name: string;
        email: string;
    };
    assigned_users?: Array<{
        id: number;
        name: string;
        email: string;
    }>;
}

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

export default function NotesIndex() {
    const { t } = useTranslation();
    const { personal_notes, shared_notes, users, auth, flash, permissions: pagePermissions } = usePage().props as any;
    const notePermissions = pagePermissions;

    // Show flash messages
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
        if (flash?.info) {
            toast.info(flash.info);
        }
    }, [flash]);

    const [activeView, setActiveView] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [perPage, setPerPage] = useState(new URLSearchParams(window.location.search).get('per_page') || '10');
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentNote, setCurrentNote] = useState<Note | null>(null);
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');

    const hasActiveFilters = () => {
        return searchTerm !== '' || selectedType !== 'all';
    };

    const activeFilterCount = () => {
        return (searchTerm ? 1 : 0) + (selectedType !== 'all' ? 1 : 0);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Search is handled by filtering in real-time
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setSelectedType('all');
        setShowFilters(false);
    };

    const handleAction = (action: string, note: Note) => {
        setCurrentNote(note);
        switch (action) {
            case 'view':
                setModalMode('view');
                setIsFormModalOpen(true);
                break;
            case 'edit':
                setModalMode('edit');
                setIsFormModalOpen(true);
                break;
            case 'delete':
                setIsDeleteModalOpen(true);
                break;
        }
    };

    const handleAddNew = () => {
        setCurrentNote(null);
        setModalMode('create');
        setIsFormModalOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (currentNote) {
            toast.loading(t('Deleting note...'));
            router.delete(route('notes.destroy', currentNote.id), {
                onSuccess: () => {
                    toast.dismiss();
                    setIsDeleteModalOpen(false);
                },
                onError: () => {
                    toast.dismiss();
                    toast.error(t('Failed to delete note'));
                    setIsDeleteModalOpen(false);
                }
            });
        }
    };

    const getColorClasses = (color: string) => {
        const colorMap: { [key: string]: string } = {
            'bg-primary': 'bg-blue-100 border-blue-200',
            'bg-secondary': 'bg-gray-100 border-gray-200',
            'bg-success': 'bg-green-100 border-green-200',
            'bg-danger': 'bg-red-100 border-red-200',
            'bg-warning': 'bg-yellow-100 border-yellow-200',
            'bg-info': 'bg-cyan-100 border-cyan-200',
            'bg-purple': 'bg-purple-100 border-purple-200',
            'bg-pink': 'bg-pink-100 border-pink-200'
        };
        return colorMap[color] || 'bg-gray-100 border-gray-200';
    };

    const filteredPersonalNotes = personal_notes?.filter((note: Note) => {
        const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.creator.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedType === 'all' || selectedType === 'personal';
        return matchesSearch && matchesType;
    }) || [];
    
    const filteredSharedNotes = shared_notes?.filter((note: Note) => {
        const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.creator.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedType === 'all' || selectedType === 'shared';
        return matchesSearch && matchesType;
    }) || [];

    const renderNoteCard = (note: Note) => (
        <Card key={note.id} className={`overflow-hidden hover:shadow-md transition-shadow ${getColorClasses(note.color)}`}>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-base line-clamp-1 flex items-center gap-2">
                        <div 
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: note.color }}
                        />
                        {note.title}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        {note.type === 'shared' ? (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Users className="h-4 w-4 text-blue-500" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    {note.assigned_users ? note.assigned_users.map((user: any) => user.name).join(', ') : note.creator.name}
                                </TooltipContent>
                            </Tooltip>
                        ) : (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <User className="h-4 w-4 text-gray-500" />
                                </TooltipTrigger>
                                <TooltipContent>{note.creator.name}</TooltipContent>
                            </Tooltip>
                        )}
                    </div>
                </div>
                <div className="text-xs text-muted-foreground">
                    {t('By')} {note.creator.name} • {new Date(note.created_at).toLocaleDateString()}
                </div>
            </CardHeader>

            <CardContent className="py-2">
                <div 
                    className="text-sm text-gray-500 line-clamp-2 break-words overflow-hidden"
                    dangerouslySetInnerHTML={{ __html: note.text }}
                />
            </CardContent>

            <CardFooter className="flex justify-end gap-1 pt-0 pb-2">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleAction('view', note)}
                            className="text-blue-500 hover:text-blue-700 h-8 w-8"
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>View</TooltipContent>
                </Tooltip>
                {notePermissions?.update && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleAction('edit', note)}
                                className="text-amber-500 hover:text-amber-700 h-8 w-8"
                            >
                                <Edit className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit</TooltipContent>
                    </Tooltip>
                )}
                {notePermissions?.delete && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-700 h-8 w-8"
                                onClick={() => handleAction('delete', note)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete</TooltipContent>
                    </Tooltip>
                )}
            </CardFooter>
        </Card>
    );

    const pageActions = [];

    if (notePermissions?.create) {
        pageActions.push({
            label: t('Create Note'),
            icon: <Plus className="h-4 w-4 mr-2" />,
            variant: 'default',
            onClick: handleAddNew
        });
    }

    const breadcrumbs = [
        { title: t('Dashboard'), href: route('dashboard') },
        { title: t('Notes') }
    ];

    return (
        <PageTemplate
            title={t('Notes')}
            url="/notes"
            actions={pageActions}
            breadcrumbs={breadcrumbs}
            noPadding
        >
            {/* Overview Row */}
            <Card className="mb-4 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="text-xl font-bold text-blue-600">
                                {(filteredPersonalNotes.length + filteredSharedNotes.length) || 0}
                            </div>
                            <div className="text-xs text-gray-600">{t('Total Notes')}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold text-gray-600">
                                {filteredPersonalNotes.length || 0}
                            </div>
                            <div className="text-xs text-gray-600">{t('Personal')}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold text-blue-600">
                                {filteredSharedNotes.length || 0}
                            </div>
                            <div className="text-xs text-gray-600">{t('Shared')}</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Search and filters */}
            <div className="bg-white rounded-lg shadow mb-4 p-4">
                <SearchAndFilterBar
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onSearch={handleSearch}
                    filters={[
                        {
                            name: 'type',
                            label: t('Type'),
                            type: 'select',
                            value: selectedType,
                            onChange: setSelectedType,
                            options: [
                                { value: 'all', label: t('All Types') },
                                { value: 'personal', label: t('Personal') },
                                { value: 'shared', label: t('Shared') }
                            ]
                        }
                    ]}
                    showFilters={showFilters}
                    setShowFilters={setShowFilters}
                    hasActiveFilters={hasActiveFilters}
                    activeFilterCount={activeFilterCount}
                    onResetFilters={handleResetFilters}
                    showViewToggle={true}
                    activeView={activeView}
                    onViewChange={setActiveView}
                    viewOptions={[
                        { value: 'grid', label: 'Grid View', icon: 'Grid3X3' },
                        { value: 'list', label: 'List View', icon: 'List' }
                    ]}
                    currentPerPage={perPage}
                    onPerPageChange={(value) => {
                        setPerPage(value);
                        const url = new URL(window.location.href);
                        url.searchParams.set('per_page', value);
                        window.history.pushState({}, '', url.toString());
                    }}
                    perPageOptions={[10, 25, 50]}
                />
            </div>

            {/* Notes Content */}
            {(activeView === 'grid' || !activeView) ? (
                <>
                    {/* Personal Notes Section */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <User className="h-5 w-5 text-gray-600" />
                            <h2 className="text-lg font-semibold text-gray-900">{t('Personal Notes')}</h2>
                            <Badge variant="secondary" className="ml-2">
                                {filteredPersonalNotes.length}
                            </Badge>
                        </div>

                        {filteredPersonalNotes.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filteredPersonalNotes.map((note: Note) => renderNoteCard(note))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow p-8 text-center">
                                <StickyNote className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                <p className="text-gray-500 mb-4">{searchTerm ? t('No personal notes found matching your search') : t('No personal notes found')}</p>
                                {notePermissions?.create && (
                                    <Button onClick={handleAddNew}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        {t('Create your first personal note')}
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Shared Notes Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Users className="h-5 w-5 text-blue-600" />
                            <h2 className="text-lg font-semibold text-gray-900">{t('Shared Notes')}</h2>
                            <Badge variant="secondary" className="ml-2">
                                {filteredSharedNotes.length}
                            </Badge>
                        </div>

                        {filteredSharedNotes.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filteredSharedNotes.map((note: Note) => renderNoteCard(note))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow p-8 text-center">
                                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                <p className="text-gray-500 mb-4">{searchTerm ? t('No shared notes found matching your search') : t('No shared notes found')}</p>
                                {notePermissions?.create && (
                                    <Button onClick={handleAddNew}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        {t('Create your first shared note')}
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Title')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Description')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Type')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {[...filteredPersonalNotes, ...filteredSharedNotes].map((note: Note) => (
                                    <tr key={note.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div 
                                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                                    style={{ backgroundColor: note.color }}
                                                />
                                                <div className="text-sm font-medium text-gray-900">{note.title}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div 
                                                className="text-sm text-gray-500 max-w-xs line-clamp-2 break-words overflow-hidden"
                                                dangerouslySetInnerHTML={{ __html: note.text }}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge variant="default">
                                                {note.type === 'shared' ? t('Shared') : t('Personal')}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex gap-1">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleAction('view', note)}
                                                            className="text-blue-500 hover:text-blue-700 h-8 w-8"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>View</TooltipContent>
                                                </Tooltip>
                                                {notePermissions?.update && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleAction('edit', note)}
                                                                className="text-amber-500 hover:text-amber-700 h-8 w-8"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Edit</TooltipContent>
                                                    </Tooltip>
                                                )}
                                                {notePermissions?.delete && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-red-500 hover:text-red-700 h-8 w-8"
                                                                onClick={() => handleAction('delete', note)}
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

            {/* Modals */}
            <NoteFormModal
                isOpen={isFormModalOpen}
                onClose={() => {
                    setIsFormModalOpen(false);
                    setCurrentNote(null);
                }}
                note={currentNote}
                mode={modalMode}
                users={users}
            />

            <CrudDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                itemName={currentNote?.title || ''}
                entityName="note"
            />
        </PageTemplate>
    );
}