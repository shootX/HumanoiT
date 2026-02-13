import React, { useState, useEffect, useMemo, useRef } from 'react';
import { router } from '@inertiajs/react';
import { toast } from '@/components/custom-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Users, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
}

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface NoteFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    note: Note | null;
    mode: 'create' | 'edit' | 'view';
    users: User[];
}

export default function NoteFormModal({ isOpen, onClose, note, mode, users }: NoteFormModalProps) {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        title: '',
        text: '',
        color: '#3B82F6',
        type: 'personal' as 'personal' | 'shared',
        assign_to: [] as number[]
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [userSearch, setUserSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    
    const filteredUsers = useMemo(() => {
        if (!userSearch) return users.slice(0, 50);
        return users.filter(user => 
            user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
            user.email.toLowerCase().includes(userSearch.toLowerCase())
        ).slice(0, 50);
    }, [users, userSearch]);
    
    // Handle click outside to close dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (isOpen) {
            if ((mode === 'edit' || mode === 'view') && note) {
                const assignedUsers = note.assign_to ? note.assign_to.split(',').map(id => parseInt(id)) : [];
                setFormData({
                    title: note.title,
                    text: note.text,
                    color: note.color,
                    type: note.type,
                    assign_to: assignedUsers
                });
            } else {
                setFormData({
                    title: '',
                    text: '',
                    color: '#3B82F6',
                    type: 'personal',
                    assign_to: []
                });
            }
            setErrors({});
        }
    }, [isOpen, mode, note]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        const submitData = {
            ...formData,
            assign_to: formData.type === 'shared' ? formData.assign_to : []
        };

        const url = mode === 'edit' && note 
            ? route('notes.update', note.id)
            : route('notes.store');

        const method = mode === 'edit' ? 'put' : 'post';

        router[method](url, submitData, {
            onSuccess: () => {
                onClose();
                setIsSubmitting(false);
            },
            onError: (errors) => {
                setErrors(errors);
                setIsSubmitting(false);
                toast.error('Please check the form for errors');
            }
        });
    };

    const handleUserToggle = (userId: number) => {
        setFormData(prev => ({
            ...prev,
            assign_to: prev.assign_to.includes(userId)
                ? prev.assign_to.filter(id => id !== userId)
                : [...prev.assign_to, userId]
        }));
    };

    const handleTypeChange = (type: 'personal' | 'shared') => {
        setFormData(prev => ({
            ...prev,
            type,
            assign_to: type === 'personal' ? [] : prev.assign_to
        }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'view' ? t('View Note') : mode === 'edit' ? t('Edit Note') : t('Create Note')}
                    </DialogTitle>
                </DialogHeader>

                {mode === 'view' ? (
                    <form className="space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">{t('Title')} <span className="text-red-500">*</span></Label>
                        <Input
                            id="title"
                            value={formData.title}
                            className="bg-gray-50"
                        />
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                        <Label htmlFor="text">{t('Content')} <span className="text-red-500">*</span></Label>
                        <div 
                            className="min-h-[200px] p-3 border rounded-md bg-gray-50 text-sm prose max-w-none"
                            dangerouslySetInnerHTML={{ __html: formData.text }}
                        />
                    </div>

                    {/* Color Selection */}
                    <div className="space-y-2">
                        <Label>{t('Color')}</Label>
                        <div className="flex gap-2 items-center">
                            <div 
                                className="w-8 h-8 rounded border-2 border-gray-300"
                                style={{ backgroundColor: formData.color }}
                            />
                            <input
                                type="color"
                                value={formData.color}
                                disabled
                                className="w-12 h-8 rounded border cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {/* Note Type */}
                    <div className="space-y-3">
                        <Label>{t('Note Type')}</Label>
                        <RadioGroup
                            value={formData.type}
                            disabled
                            className="flex gap-6"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="personal" id="personal" disabled />
                                <Label htmlFor="personal" className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    {t('Personal')}
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="shared" id="shared" disabled />
                                <Label htmlFor="shared" className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    {t('Shared')}
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* User Selection for Shared Notes */}
                    {formData.type === 'shared' && (
                        <div className="space-y-3">
                            <Label>{t('Select users to share with')} <span className="text-red-500">*</span></Label>
                            <div className="flex flex-wrap gap-1 p-2 border rounded-md min-h-[38px] bg-gray-50">
                                {formData.assign_to.map(userId => {
                                    const user = users.find(u => u.id === userId);
                                    return user ? (
                                        <Badge key={userId} variant="secondary" className="rounded-sm px-2 py-1 font-normal bg-gray-100 text-gray-700">
                                            {user.name}
                                        </Badge>
                                    ) : null;
                                })}
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            {t('Cancel')}
                        </Button>
                    </DialogFooter>
                </form>
                ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">{t('Title')} <span className="text-red-500">*</span></Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            placeholder={t('Enter note title')}
                            className={errors.title ? 'border-red-500' : ''}
                        />
                        {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                        <Label htmlFor="text">{t('Content')} <span className="text-red-500">*</span></Label>
                        <RichTextEditor
                            content={formData.text}
                            onChange={(content) => setFormData(prev => ({ ...prev, text: content }))}
                            placeholder={t('Enter note content')}
                            className={errors.text ? 'border-red-500' : ''}
                        />
                        {errors.text && <p className="text-sm text-red-500">{errors.text}</p>}
                    </div>

                    {/* Color Selection */}
                    <div className="space-y-2">
                        <Label>{t('Color')}</Label>
                        <div className="flex gap-2 items-center">
                            <div 
                                className="w-8 h-8 rounded border-2 border-gray-300"
                                style={{ backgroundColor: formData.color }}
                            />
                            <input
                                type="color"
                                value={formData.color}
                                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                                className="w-12 h-8 rounded border cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Note Type */}
                    <div className="space-y-3">
                        <Label>{t('Note Type')}</Label>
                        <RadioGroup
                            value={formData.type}
                            onValueChange={(value) => handleTypeChange(value as 'personal' | 'shared')}
                            className="flex gap-6"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="personal" id="personal" />
                                <Label htmlFor="personal" className="flex items-center gap-2 cursor-pointer">
                                    <User className="h-4 w-4" />
                                    {t('Personal')}
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="shared" id="shared" />
                                <Label htmlFor="shared" className="flex items-center gap-2 cursor-pointer">
                                    <Users className="h-4 w-4" />
                                    {t('Shared')}
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* User Selection for Shared Notes */}
                    {formData.type === 'shared' && (
                        <div className="space-y-3">
                            <Label>{t('Select users to share with')} <span className="text-red-500">*</span></Label>
                            <div className="relative" ref={containerRef}>
                                <div 
                                    className="flex flex-wrap gap-1 p-2 border rounded-md min-h-[38px] cursor-text"
                                    onClick={() => setIsDropdownOpen(true)}
                                >
                                    {formData.assign_to.map(userId => {
                                        const user = users.find(u => u.id === userId);
                                        return user ? (
                                            <Badge key={userId} variant="secondary" className="rounded-sm px-2 py-1 font-normal bg-gray-100 text-gray-700">
                                                {user.name}
                                                <button
                                                    type="button"
                                                    className="ml-1 rounded-sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleUserToggle(userId);
                                                    }}
                                                >
                                                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                                </button>
                                            </Badge>
                                        ) : null;
                                    })}
                                    <input
                                        type="text"
                                        value={userSearch}
                                        onChange={(e) => setUserSearch(e.target.value)}
                                        onFocus={() => setIsDropdownOpen(true)}
                                        placeholder={formData.assign_to.length === 0 ? t('Select users') : ''}
                                        className="flex-1 outline-none bg-transparent min-w-[50px]"
                                    />
                                </div>
                                
                                {isDropdownOpen && filteredUsers && filteredUsers.length > 0 && (
                                    <div className="absolute z-[60] w-full mt-1 bg-white border rounded-md shadow-lg max-h-[200px] overflow-y-auto">
                                        {filteredUsers.map((user) => (
                                            <div
                                                key={user.id}
                                                className="px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center justify-between"
                                                onClick={() => {
                                                    handleUserToggle(user.id);
                                                    setUserSearch('');
                                                    setIsDropdownOpen(true);
                                                }}
                                            >
                                                <div>
                                                    <div className="font-medium text-sm">{user.name}</div>
                                                    <div className="text-xs text-muted-foreground">{user.email}</div>
                                                </div>
                                                <Badge variant="outline" className="capitalize text-xs">
                                                    {user.role}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            {t('Cancel')}
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? t('Saving...') : (mode === 'edit' ? t('Update Note') : t('Create Note'))}
                        </Button>
                    </DialogFooter>
                </form>
                )}
            </DialogContent>
        </Dialog>
    );
}