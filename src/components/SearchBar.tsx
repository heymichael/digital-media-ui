import { Search } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchBar({ value, onChange, placeholder = 'Search assets...' }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#aab2c2]" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-64 rounded-lg border border-[#2a3140] bg-[#0f141d] py-2 pl-10 pr-4 text-sm text-[#f5f7fa] placeholder-[#6b7280] focus:border-[#8cc5ff] focus:outline-none"
      />
    </div>
  )
}
