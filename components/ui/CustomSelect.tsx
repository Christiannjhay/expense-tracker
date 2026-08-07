// components/ui/CustomSelect.tsx
import { useState, useRef, useEffect } from 'react';

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { id: number; name: string }[];
  placeholder?: string;
  className?: string;
}

export function CustomSelect({ value, onChange, options, placeholder = "Select an option", className = "" }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const selectedOption = options.find(opt => opt.id.toString() === value);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white/10 rounded-lg px-3 py-2 text-white text-left flex justify-between items-center hover:bg-white/20 transition-all duration-200"
      >
        <span className={!selectedOption ? 'text-white/50' : 'text-white'}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <svg 
          className={`w-4 h-4 text-white transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute bottom-full mb-2 left-0 right-0 bg-zinc-800 rounded-lg border border-white/10 overflow-hidden z-50 max-h-60 overflow-y-auto">
          <button
            onClick={() => {
              onChange('');
              setIsOpen(false);
            }}
            className={`w-full px-3 py-2 text-left text-white/50 hover:bg-white/10 transition-colors ${
              !value ? 'bg-white/10' : ''
            }`}
          >
            {placeholder}
          </button>
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => {
                onChange(option.id.toString());
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-white hover:bg-white/10 transition-colors ${
                value === option.id.toString() ? 'bg-white/10' : ''
              }`}
            >
              {option.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}