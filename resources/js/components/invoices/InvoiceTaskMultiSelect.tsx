import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

type TaskOption = {
  id: number;
  title: string;
  task_stage?: { name: string } | null;
  project_id?: number;
  project_title?: string;
};

type Props = {
  projectId?: string;
  projectIds?: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

export function InvoiceTaskMultiSelect({
  projectId,
  projectIds = [],
  selected,
  onChange,
  placeholder = 'Select task',
  className,
  disabled = false,
}: Props) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tasks, setTasks] = useState<TaskOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<TaskOption[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const effectiveProjectIds = projectIds?.length > 0 ? projectIds : (projectId ? [projectId] : []);

  const fetchTasks = useCallback(
    async (search: string, forceIncludeIds: string[] = []) => {
      if (effectiveProjectIds.length === 0) return;
      setLoading(true);
      try {
        let url: string;
        if (effectiveProjectIds.length > 1) {
          url = route('api.invoices.projects-tasks');
          const u = new URL(url, window.location.origin);
          effectiveProjectIds.forEach((id) => u.searchParams.append('project_ids[]', id));
          if (search.trim()) u.searchParams.set('search', search.trim());
          forceIncludeIds.forEach((id) => u.searchParams.append('task_ids[]', id));
          url = u.toString();
        } else {
          url = route('api.projects.invoice-data', effectiveProjectIds[0]).toString();
          const u = new URL(url);
          if (search.trim()) u.searchParams.set('search', search.trim());
          forceIncludeIds.forEach((id) => u.searchParams.append('task_ids[]', id));
          url = u.toString();
        }
        const response = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            'X-Requested-With': 'XMLHttpRequest',
          },
          credentials: 'same-origin',
        });
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        const list = (data.tasks || []) as TaskOption[];
        setTasks(list);
        const matched = forceIncludeIds
          .map((id) => list.find((t) => t.id.toString() === id))
          .filter(Boolean) as TaskOption[];
        const extra = forceIncludeIds
          .filter((id) => !list.some((t) => t.id.toString() === id))
          .map((id) => ({ id: parseInt(id, 10), title: `#${id}`, task_stage: null }));
        setSelectedTasks([...matched, ...extra]);
      } catch {
        setTasks([]);
        setSelectedTasks(selected.map((id) => ({ id: parseInt(id, 10), title: `#${id}`, task_stage: null })));
      } finally {
        setLoading(false);
      }
    },
    [effectiveProjectIds.join(',')]
  );

  useEffect(() => {
    if (isOpen && effectiveProjectIds.length > 0) {
      fetchTasks(searchTerm, selected);
    }
  }, [isOpen, effectiveProjectIds.length, searchTerm, selected, fetchTasks]);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!isOpen || effectiveProjectIds.length === 0) return;
    searchTimeoutRef.current = setTimeout(() => fetchTasks(searchTerm, selected), 200);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchTerm, isOpen, effectiveProjectIds.length, selected, fetchTasks]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (task: TaskOption) => {
    const id = task.id.toString();
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onChange(selected.filter((s) => s !== id));
  };

  const displayOptions = [...tasks];
  selected.forEach((id) => {
    if (!displayOptions.some((t) => t.id.toString() === id)) {
      const st = selectedTasks.find((t) => t.id.toString() === id);
      if (st) displayOptions.unshift(st);
      else displayOptions.unshift({ id: parseInt(id, 10), title: `#${id}`, task_stage: null });
    }
  });

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div
        className={`flex flex-wrap gap-1.5 p-2 border rounded-md min-h-[40px] bg-background ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={() => !disabled && effectiveProjectIds.length > 0 && setIsOpen(!isOpen)}
      >
        {selected.length === 0 ? (
          <span className="text-muted-foreground text-sm py-1">{placeholder}</span>
        ) : (
          selected.map((id) => {
            const task = selectedTasks.find((t) => t.id.toString() === id) || tasks.find((t) => t.id.toString() === id) || { id: parseInt(id, 10), title: `#${id}` };
            return (
              <Badge key={id} variant="secondary" className="rounded-md pl-1.5 pr-1 gap-0.5 font-normal">
                {task.title}
                <button
                  type="button"
                  className="rounded p-0.5 hover:bg-muted"
                  onClick={(e) => handleRemove(e, id)}
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })
        )}
      </div>

      {isOpen && effectiveProjectIds.length > 0 && (
        <div className="absolute z-[9999] w-full mt-1 bg-popover border rounded-md shadow-lg max-h-[280px] overflow-hidden flex flex-col">
          <input
            type="text"
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            placeholder={t('Search tasks...')}
            className="w-full px-3 py-2 border-b text-sm outline-none"
          />
          <div className="overflow-y-auto py-1 max-h-[220px]">
            {loading ? (
              <div className="px-3 py-4 text-sm text-muted-foreground text-center">{t('Loading...')}</div>
            ) : displayOptions.length === 0 ? (
              <div className="px-3 py-4 text-sm text-muted-foreground text-center">{t('No tasks found')}</div>
            ) : (
              displayOptions.map((task) => {
                const id = task.id.toString();
                const isSelected = selected.includes(id);
                return (
                  <div
                    key={task.id}
                    role="button"
                    tabIndex={0}
                    className={`flex items-center gap-2 px-3 py-2 cursor-pointer text-sm hover:bg-accent ${isSelected ? 'bg-accent/50' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleOption(task);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleOption(task);
                      }
                    }}
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${isSelected ? 'bg-primary border-primary text-primary-foreground' : 'border-input'}`}
                    >
                      {isSelected ? <Check className="h-2.5 w-2.5" /> : null}
                    </span>
                    <span className="flex-1 truncate">{task.title}</span>
                    {task.task_stage?.name && /done|completed|finished/i.test(task.task_stage.name) && (
                      <span className="text-xs text-muted-foreground">({task.task_stage.name})</span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
