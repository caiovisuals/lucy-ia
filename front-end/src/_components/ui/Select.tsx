"use client"

import { useState, useRef, useEffect } from "react"

type Option = {
    label: string
    value: string
}

type SelectProps = {
    options?: Option[]
    placeholder?: string
    value?: string
    onChange?: (value: string) => void
}

export default function Select({ options = [], placeholder = "Selecione", value, onChange }: SelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [selected, setSelected] = useState<Option | null>(
        value ? options.find(opt => opt.value === value) || null : null
    )
    const containerRef = useRef<HTMLDivElement>(null)

    const handleOptionClick = (option: Option) => {
        setSelected(option)
        onChange?.(option.value)
        setIsOpen(false)
    }

    // Fecha o dropdown ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <div ref={containerRef} className="relative w-48 text-sm">
            <button
                type="button"
                className="w-full flex items-center justify-between px-3 py-2 border-2 border-[var(--border)] rounded-xl bg-[var(--background)] hover:bg-[var(--foreground)]/50 transition"
                onClick={() => setIsOpen(prev => !prev)}
            >
                <span>{selected ? selected.label : placeholder}</span>
            </button>
            <div className={`absolute top-full mt-1 w-full rounded-xl border-2 border-[var(--border)] bg-[var(--background)] shadow-lg z-10 overflow-hidden transition-normal ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
                {options.map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => handleOptionClick(option)}
                    className="w-full text-left px-3 py-2 bg-[var(--background)] hover:bg-[var(--foreground)]/50 transition"
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        </div>
    )
}