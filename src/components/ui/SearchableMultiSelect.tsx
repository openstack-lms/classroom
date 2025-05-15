import { useState, useEffect, useRef } from 'react';
import { HiSearch, HiX } from 'react-icons/hi';

interface Option {
    id: string;
    label: string;
}

interface SearchableMultiSelectProps {
    options: Option[];
    selectedIds: string[];
    onSelectionChange: (selectedIds: string[]) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    className?: string;
}

export default function SearchableMultiSelect({
    options,
    selectedIds,
    onSelectionChange,
    placeholder = "Select items...",
    searchPlaceholder = "Search...",
    className = "",
}: SearchableMultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Update selected options when selectedIds or options change
    useEffect(() => {
        const selected = options.filter(option => selectedIds.includes(option.id));
        setSelectedOptions(selected);
    }, [selectedIds, options]);

    // Filter options based on search query
    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Handle click outside to close dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleOption = (optionId: string) => {
        const newSelectedIds = selectedIds.includes(optionId)
            ? selectedIds.filter(id => id !== optionId)
            : [...selectedIds, optionId];
        onSelectionChange(newSelectedIds);
    };

    const removeOption = (optionId: string) => {
        const newSelectedIds = selectedIds.filter(id => id !== optionId);
        onSelectionChange(newSelectedIds);
    };

    const handleInputClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen(true);
        inputRef.current?.focus();
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {/* Selected items display */}
            <div
                className="min-h-[2.5rem] w-full rounded-md border border-border bg-background px-3 py-2 cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                {selectedOptions.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {selectedOptions.map(option => (
                            <div
                                key={option.id}
                                className="flex items-center gap-1 bg-primary-100 text-primary-900 px-2 py-1 rounded-md text-sm"
                            >
                                <span>{option.label}</span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeOption(option.id);
                                    }}
                                    className="hover:text-primary-700"
                                >
                                    <HiX className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <span className="text-foreground-muted">{placeholder}</span>
                )}
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg">
                    {/* Search input */}
                    <div className="p-2 border-b border-border">
                        <div className="relative">
                            <HiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-foreground-muted" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onClick={handleInputClick}
                                placeholder={searchPlaceholder}
                                className="w-full pl-8 pr-4 py-2 bg-background-muted rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>

                    {/* Options list */}
                    <div className="max-h-60 overflow-y-auto">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(option => (
                                <div
                                    key={option.id}
                                    className="flex items-center px-4 py-2 hover:bg-background-muted cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleOption(option.id);
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(option.id)}
                                        onChange={() => {}}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleOption(option.id);
                                        }}
                                        className="mr-2"
                                    />
                                    <span>{option.label}</span>
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-2 text-foreground-muted">
                                No options found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
} 