import React, { useState, useRef, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

type Props = {
    projects: { id: number; title: string }[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
};

export function InvoiceProjectMultiSelect({
    projects,
    selected,
    onChange,
    placeholder = 'Select projects',
    className,
    disabled = false,
}: Props) {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOption = (id: string) => {
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

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <div
                className={`flex flex-wrap gap-1.5 p-2 border rounded-md min-h-[40px] bg-background ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                {selected.length === 0 ? (
                    <span className="text-muted-foreground text-sm py-1">{placeholder}</span>
                ) : (
                    selected.map((id) => {
                        const proj = projects?.find((p) => p.id.toString() === id);
                        return (
                            <Badge key={id} variant="secondary" className="rounded-md pl-1.5 pr-1 gap-0.5 font-normal">
                                {proj?.title || `#${id}`}
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

            {isOpen && (
                <div className="absolute z-[9999] w-full mt-1 bg-popover border rounded-md shadow-lg max-h-[280px] overflow-y-auto">
                    {projects?.map((proj) => {
                        const id = proj.id.toString();
                        const isSelected = selected.includes(id);
                        return (
                            <div
                                key={proj.id}
                                role="button"
                                tabIndex={0}
                                className={`flex items-center gap-2 px-3 py-2 cursor-pointer text-sm hover:bg-accent ${isSelected ? 'bg-accent/50' : ''}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleOption(id);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        toggleOption(id);
                                    }
                                }}
                            >
                                <span
                                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${isSelected ? 'bg-primary border-primary text-primary-foreground' : 'border-input'}`}
                                >
                                    {isSelected ? <Check className="h-2.5 w-2.5" /> : null}
                                </span>
                                <span className="flex-1 truncate">{proj.title}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
