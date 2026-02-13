// components/simple-multi-select.tsx
import React, { useState, useRef, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type Option = {
  value: string;
  label: string;
};

type MultiSelectProps = {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  onClose?: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
};

export function SimpleMultiSelect({
  options,
  selected,
  onChange,
  onClose,
  placeholder = "Select options",
  className,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (isOpen) onClose?.(selected);
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, selected, onClose]);

  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((id) => id !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const handleRemove = (e: React.MouseEvent, value: string) => {
    e.stopPropagation();
    onChange(selected.filter((id) => id !== value));
  };

  const filteredOptions = options.filter((o) =>
    o.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div
        className="flex flex-wrap gap-1.5 p-2 border rounded-md min-h-[40px] cursor-pointer bg-background"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selected.length === 0 ? (
          <span className="text-muted-foreground text-sm py-1">{placeholder}</span>
        ) : (
          selected.map((value) => {
            const option = options.find((o) => o.value === value);
            return (
              <Badge key={value} variant="secondary" className="rounded-md pl-1.5 pr-1 gap-0.5 font-normal">
                {option?.label || value}
                <button type="button" className="rounded p-0.5 hover:bg-muted" onClick={(e) => handleRemove(e, value)}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })
        )}
      </div>

      {isOpen && (
        <div className="absolute z-[9999] w-full mt-1 bg-popover border rounded-md shadow-lg max-h-[220px] overflow-y-auto">
          {searchTerm !== undefined && (
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder="Search..."
              className="w-full px-3 py-2 border-b text-sm outline-none rounded-t-md"
            />
          )}
          <div className="py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">No options</div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = selected.includes(option.value);
                return (
                  <div
                    key={option.value}
                    role="button"
                    tabIndex={0}
                    className={`flex items-center gap-2 px-3 py-2 cursor-pointer text-sm hover:bg-accent ${isSelected ? "bg-accent/50" : ""}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleOption(option.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleOption(option.value);
                      }
                    }}
                  >
                    <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${isSelected ? "bg-primary border-primary text-primary-foreground" : "border-input"}`}>
                      {isSelected ? <Check className="h-2.5 w-2.5" /> : null}
                    </span>
                    {option.label}
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