"use client"

import { useState } from "react"

export default function Sidebar() {
    const [isExpanded, setIsExpanded] = useState(false)

    return (
        <aside className={`flex flex-col items-center justify-between gap-y-2 min-h-full border-r-2 border-[var(--border)] p-2 transition-normal overflow-hidden ${isExpanded ? "w-64" : "w-14"}`}>
            <div className="flex flex-col gap-y-2">
                <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 rounded-full hover:bg-[var(--foreground)] transition-normal">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="16" x="2" y="4" rx="2"/><path d="M12 9v11"/><path d="M2 9h13a2 2 0 0 1 2 2v9"/>
                    </svg>
                </button>
                <button className="p-2 rounded-full hover:bg-[var(--foreground)] transition-normal">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/>                
                    </svg>
                </button>
            </div>
            <button className="bg-[var(--orange)]  hover:bg-[var(--orange-hover)] text-[var(--white-text)] rounded-full flex items-center justify-center text-xs font-bold size-10 transition-normal">
                C
            </button>
        </aside>
    )
}