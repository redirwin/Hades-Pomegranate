"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export function MultiSelect({ options, value, onChange, placeholder = "Select items..." }) {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState(value || []);

  React.useEffect(() => {
    setSelected(value || []);
  }, [value]);

  const handleSelect = (itemValue) => {
    const newSelected = selected.includes(itemValue)
      ? selected.filter((item) => item !== itemValue)
      : [...selected, itemValue];

    setSelected(newSelected);
    onChange(newSelected);
  };

  const selectedItems = options.filter((item) => selected.includes(item.value));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <div className="flex flex-wrap gap-1">
            {selectedItems.length > 0 ? (
              selectedItems.map((item) => (
                <Badge
                  key={item.value}
                  variant="secondary"
                  className="mr-1"
                >
                  {item.label}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandEmpty>No items found.</CommandEmpty>
          <CommandGroup>
            {options.map((item) => (
              <CommandItem
                key={item.value}
                onSelect={() => handleSelect(item.value)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selected.includes(item.value)
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
} 