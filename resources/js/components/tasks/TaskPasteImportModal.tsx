import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Project } from '@/types';
import { useTranslation } from 'react-i18next';
import { ClipboardPaste } from 'lucide-react';
import { toast } from '@/components/custom-toast';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    projects: Project[];
    defaultProjectId?: string;
}

export default function TaskPasteImportModal({ isOpen, onClose, projects, defaultProjectId = '' }: Props) {
    const { t } = useTranslation();
    const [text, setText] = useState('');
    const [projectId, setProjectId] = useState('');
    const [priority, setPriority] = useState('medium');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setText('');
            const pid = defaultProjectId && projects.some((p) => String(p.id) === defaultProjectId) ? defaultProjectId : '';
            setProjectId(pid);
            setPriority('medium');
        }
    }, [isOpen, defaultProjectId, projects]);

    const submitImport = () => {
        const body = text.trim();
        if (!projectId) {
            toast.error(t('Paste import select project'));
            return;
        }
        if (!body) {
            toast.error(t('Paste import need tasks'));
            return;
        }
        let postUrl: string;
        try {
            postUrl = route('tasks.paste-import');
        } catch {
            toast.error(t('Import failed'));
            return;
        }
        setIsSubmitting(true);
        router.post(
            postUrl,
            {
                text: body,
                project_id: Number(projectId),
                priority,
            },
            {
                preserveScroll: true,
                onFinish: () => setIsSubmitting(false),
                onSuccess: () => {
                    onClose();
                    router.reload({ preserveScroll: true });
                },
                onError: (errors) => {
                    const msgs = Object.values(errors).flat();
                    const first = msgs.find((m) => typeof m === 'string');
                    toast.error(typeof first === 'string' ? first : t('Import failed'));
                },
            }
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ClipboardPaste className="h-5 w-5" />
                        {t('Import tasks from text')}
                    </DialogTitle>
                </DialogHeader>
                <form
                    noValidate
                    onSubmit={(e) => {
                        e.preventDefault();
                        submitImport();
                    }}
                    className="space-y-4"
                >
                    <div className="space-y-2">
                        <Label>{t('Project')}</Label>
                        <Select value={projectId || undefined} onValueChange={setProjectId}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('Select project')} />
                            </SelectTrigger>
                            <SelectContent>
                                {projects.map((p) => (
                                    <SelectItem key={p.id} value={String(p.id)}>
                                        {p.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>{t('Priority')}</Label>
                        <Select value={priority} onValueChange={setPriority}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">{t('Low')}</SelectItem>
                                <SelectItem value="medium">{t('Medium')}</SelectItem>
                                <SelectItem value="high">{t('High')}</SelectItem>
                                <SelectItem value="critical">{t('Critical')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>{t('Paste task list')}</Label>
                        <Textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder={t('Paste format hint')}
                            rows={10}
                            className="font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground">{t('First line is branch name; then numbered items like 1. Task')}</p>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                            {t('Cancel')}
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {t('Import')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
