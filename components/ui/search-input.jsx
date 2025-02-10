"use client";

import { Search } from "lucide-react";
import { Input } from "./input";

export function SearchInput({ placeholder, value, onChange, className }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`pl-9 ${className}`}
      />
    </div>
  );
} 