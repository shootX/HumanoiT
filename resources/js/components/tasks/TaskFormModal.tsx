import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { SimpleMultiSelect } from '@/components/simple-multi-select';
import { Save, Plus, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Task, Project, ProjectMilestone, User, Asset } from '@/types';
import { toast } from '@/components/custom-toast';
import { useTranslation } from 'react-i18next';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    task?: Task;
    projects: Project[];
    members: User[];
    assets?: Asset[];
    milestones?: ProjectMilestone[];
    googleCalendarEnabled?: boolean;
}

export default function TaskFormModal({ isOpen, onClose, task, projects, members, assets = [], milestones = [], googleCalendarEnabled = false }: Props) {
    const { t } = useTranslation();
    const isEditing = !!task;
    const getInitialAssignees = (t?: Task) => {
        if (!t) return [];
        if (t.members?.length) return t.members.map(m => String(m.id));
        const at = t.assigned_to;
        return at ? [String(typeof at === 'object' ? at.id : at)] : [];
    };
    const [formData, setFormData] = useState({
        project_id: task?.project_id?.toString() || '',
        milestone_id: task?.milestone_id?.toString() || 'none',
        asset_items: [] as { asset_id: string; quantity: string }[],
        title: task?.title || '',
        description: task?.description || '',
        priority: task?.priority || 'medium',
        start_date: task?.start_date || '',
        end_date: task?.end_date || '',
        assigned_user_ids: getInitialAssignees(task),
        is_googlecalendar_sync: task?.is_googlecalendar_sync || false
    });

    const [currentMilestones, setCurrentMilestones] = useState<ProjectMilestone[]>([]);
    const [currentMembers, setCurrentMembers] = useState<User[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getProjectTeamMembers = (project: any): User[] => {
        const memberUsers = (project?.members || []).filter((m: any) => m.user).map((m: any) => m.user);
        const clientUsers = project?.clients || [];
        return [...memberUsers, ...clientUsers].filter((u: any, i: number, arr: any[]) => 
            arr.findIndex((x: any) => x.id === u.id) === i
        );
    };

    // Reset form when task changes
    useEffect(() => {
        if (task) {
            // Editing mode - populate with task data
            const project = projects.find(p => p.id === task.project_id);
            setCurrentMilestones(project?.milestones || []);
            setCurrentMembers(getProjectTeamMembers(project));
            const assetItems = (task as any).assets?.map((a: any) => ({
                asset_id: String(a.id),
                quantity: String(a.pivot?.quantity ?? 1)
            })) ?? [];
            setFormData(prev => ({
                ...prev,
                project_id: task.project_id?.toString() || '',
                milestone_id: task.milestone_id?.toString() || 'none',
                asset_items: assetItems.length > 0 ? assetItems : (task.asset_id ? [{ asset_id: String(task.asset_id), quantity: '1' }] : []),
                title: task.title,
                description: task.description || '',
                priority: task.priority,
                start_date: task.start_date?.split('T')[0] || '',
                end_date: task.end_date?.split('T')[0] || '',
                assigned_user_ids: getInitialAssignees(task),
                is_googlecalendar_sync: task.is_googlecalendar_sync || false
            }));
        } else {
            // Create mode - reset to defaults
            setFormData({
                project_id: '',
                milestone_id: 'none',
                asset_items: assets.length > 0 ? [{ asset_id: '', quantity: '1' }] : [],
                title: '',
                description: '',
                priority: 'medium',
                start_date: '',
                end_date: '',
                assigned_user_ids: [],
                is_googlecalendar_sync: false
            });
            setCurrentMilestones([]);
            setCurrentMembers([]);
        }
    }, [task, projects, members]);

    const handleProjectChange = (projectId: string) => {
        setFormData(prev => ({
            ...prev, 
            project_id: projectId, 
            milestone_id: 'none', 
            assigned_user_ids: []
        }));
        
        const project = projects.find(p => p.id.toString() === projectId);
        setCurrentMilestones(project?.milestones || []);
        setCurrentMembers(getProjectTeamMembers(project) || []);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isSubmitting) return;
        
        setIsSubmitting(true);
        setErrors({});
        
        const submitData = {
            ...formData,
            milestone_id: formData.milestone_id === 'none' ? '' : formData.milestone_id,
            asset_items: formData.asset_items.filter(x => x.asset_id && parseInt(x.quantity, 10) > 0).map(x => ({
                asset_id: x.asset_id,
                quantity: parseInt(x.quantity, 10) || 1
            })),
            assigned_user_ids: formData.assigned_user_ids
        };
        
        if (isEditing) {
            router.put(route('tasks.update', task.id), submitData, {
                onSuccess: () => {
                    setIsSubmitting(false);
                    onClose();
                    router.reload();
                },
                onError: (errors) => {
                    setIsSubmitting(false);
                    setErrors(errors);
                }
            });
        } else {
            router.post(route('tasks.store'), submitData, {
                onSuccess: () => {
                    setIsSubmitting(false);
                    onClose();
                    router.reload();
                },
                onError: (errors) => {
                    setIsSubmitting(false);
                    setErrors(errors);
                }
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{isEditing ? t('Edit Task') : t('Create Task')}</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isEditing && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('Project')} <span className="text-red-500">*</span> <span className="text-xs text-gray-500">({t('Select to load milestones & team members')})</span>
                            </label>
                            <Select value={formData.project_id || ''} onValueChange={handleProjectChange}>
                                <SelectTrigger className={errors.project_id ? 'border-red-500' : ''}>
                                    <SelectValue placeholder={t('Select a project')} />
                                </SelectTrigger>
                                <SelectContent className="z-[9999]">
                                    {projects.map((project) => (
                                        <SelectItem key={project.id} value={project.id.toString()}>
                                            {project.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.project_id && <p className="text-sm text-red-600 mt-1">{errors.project_id}</p>}
                        </div>
                    )}

                    {formData.project_id && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('Milestone')}
                            </label>
                            <Select value={formData.milestone_id} onValueChange={(value) => setFormData({...formData, milestone_id: value})}>
                                <SelectTrigger>
                                    <SelectValue placeholder={currentMilestones.length > 0 ? t('Select a milestone (optional)') : t('No milestones available')} />
                                </SelectTrigger>
                                <SelectContent className="z-[9999]">
                                    <SelectItem value="none">{t('No milestone')}</SelectItem>
                                    {currentMilestones.map((milestone) => (
                                        <SelectItem key={milestone.id} value={milestone.id.toString()}>
                                            {milestone.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {(() => {
                        const getAvailable = (a: { id: number; quantity?: number } & Record<string, unknown>) => {
                            return Number(a.quantity ?? 1);
                        };
                        const assetsFromTask = ((task as any)?.assets ?? []).filter((a: any) => !assets.some((x: any) => x.id === a.id));
                        const availableAssets = [...assets, ...assetsFromTask];
                        return availableAssets.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('Used Assets')}
                            </label>
                            <p className="text-xs text-muted-foreground mb-2">{t('Select assets and quantity used for this task')}</p>
                            <div className="space-y-2">
                                {formData.asset_items.map((item, idx) => {
                                    const selectedAsset = availableAssets.find((a: any) => String(a.id) === item.asset_id);
                                    const maxQty = selectedAsset ? getAvailable(selectedAsset) - formData.asset_items.reduce((sum, itm, i) =>
                                        i !== idx && itm.asset_id === item.asset_id ? sum + (parseInt(itm.quantity, 10) || 0) : sum, 0) : 999;
                                    return (
                                    <div key={idx} className="flex gap-2 items-center">
                                        <select
                                            value={item.asset_id || ''}
                                            onChange={(e) => {
                                                const next = [...formData.asset_items];
                                                next[idx] = { ...next[idx], asset_id: e.target.value, quantity: '1' };
                                                setFormData({ ...formData, asset_items: next });
                                            }}
                                            className={cn(
                                                'flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
                                                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
                                            )}
                                        >
                                            <option value="">{t('Select asset')}</option>
                                            {availableAssets.map((asset: any) => {
                                                const avail = getAvailable(asset) - formData.asset_items.reduce((s, itm, i) =>
                                                    i !== idx && itm.asset_id === String(asset.id) ? s + (parseInt(itm.quantity, 10) || 0) : s, 0);
                                                return (
                                                    <option key={asset.id} value={asset.id}>
                                                        {asset.name}{asset.asset_code ? ` (${asset.asset_code})` : ''} — {t('Available')}: {Math.max(0, avail)}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                        <Input
                                            type="number"
                                            min={1}
                                            max={maxQty}
                                            className="w-20"
                                            placeholder="Qty"
                                            value={item.quantity}
                                            onChange={(e) => {
                                                const next = [...formData.asset_items];
                                                const v = Math.min(Math.max(1, parseInt(e.target.value, 10) || 1), maxQty);
                                                next[idx] = { ...next[idx], quantity: String(v) };
                                                setFormData({ ...formData, asset_items: next });
                                            }}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="shrink-0 text-red-500"
                                            onClick={() => setFormData({ ...formData, asset_items: formData.asset_items.filter((_, i) => i !== idx) })}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    );
                                })}
                                {availableAssets.length > 0 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setFormData({ ...formData, asset_items: [...formData.asset_items, { asset_id: '', quantity: '1' }] })}
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        {t('Add asset')}
                                    </Button>
                                )}
                            </div>
                        </div>
                        );
                    })()}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('Title')} <span className="text-red-500">*</span>
                        </label>
                        <Input
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            placeholder={t('Enter task title')}
                            className={errors.title ? 'border-red-500' : ''}
                        />
                        {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('Description')}
                        </label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            placeholder={t('Describe the task...')}
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('Priority')}
                            </label>
                            <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="z-[9999]">
                                    <SelectItem value="low">{t('Low')}</SelectItem>
                                    <SelectItem value="medium">{t('Medium')}</SelectItem>
                                    <SelectItem value="high">{t('High')}</SelectItem>
                                    <SelectItem value="critical">{t('Critical')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('Assign to')}
                            </label>
                            {!formData.project_id ? (
                                <p className="text-sm text-muted-foreground">{t('Select project first')}</p>
                            ) : (
                                <SimpleMultiSelect
                                    options={currentMembers.map(m => ({ value: String(m.id), label: m.name }))}
                                    selected={formData.assigned_user_ids}
                                    onChange={(ids) => setFormData({ ...formData, assigned_user_ids: ids })}
                                    placeholder={t('Select assignees')}
                                />
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('Start Date')}
                            </label>
                            <Input
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('Due Date')}
                            </label>
                            <Input
                                type="date"
                                value={formData.end_date}
                                onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                            />
                        </div>
                    </div>

                    {googleCalendarEnabled && !isEditing && (
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="google-calendar-sync"
                                checked={formData.is_googlecalendar_sync}
                                onCheckedChange={(checked) => setFormData({...formData, is_googlecalendar_sync: checked})}
                            />
                            <label htmlFor="google-calendar-sync" className="text-sm font-medium text-gray-700">
                                {t('Sync with Google Calendar')}
                            </label>
                        </div>
                    )}

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            {t('Cancel')}
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            <Save className="h-4 w-4 mr-2" />
                            {isSubmitting ? t('Saving...') : (isEditing ? t('Update Task') : t('Create Task'))}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}