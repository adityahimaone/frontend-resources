"use client";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandEmpty,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

export interface Option {
  value: string;
  label: string;
  color?: string;
  fixed?: boolean;
}

interface MultiSelectProps {
  value?: Option[];
  options: Option[];
  placeholder?: string;
  emptyMessage?: string;
  onChange?: (options: Option[]) => void;
  maxSelected?: number;
  onMaxSelected?: (maxLimit: number) => void;
  disabled?: boolean;
  className?: string;
  badgeClassName?: string;
  createOption?: (inputValue: string) => void;
  selected: Option[];
}

export function MultiSelect({
  value,
  onChange,
  placeholder = "Select...",
  emptyMessage = "No options found.",
  options,
  maxSelected,
  onMaxSelected,
  disabled,
  className,
  badgeClassName,
  createOption,
  selected,
}: MultiSelectProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  const handleUnselect = React.useCallback(
    (option: Option) => {
      onChange?.(selected.filter((s) => s.value !== option.value));
    },
    [onChange, selected]
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current;
      if (input) {
        if (e.key === "Delete" || e.key === "Backspace") {
          if (input.value === "" && selected.length > 0) {
            handleUnselect(selected[selected.length - 1]);
          }
        }
        if (e.key === "Escape") {
          input.blur();
        }
      }
    },
    [handleUnselect, selected]
  );

  const handleCreateOption = React.useCallback(() => {
    if (!inputValue) return;
    createOption?.(inputValue);
    setInputValue("");
  }, [inputValue, createOption]);

  const selectables = options.filter(
    (option) => !selected.find((s) => s.value === option.value)
  );

  return (
    <Command
      onKeyDown={handleKeyDown}
      className={cn("overflow-visible bg-transparent", className)}
    >
      <div className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="flex flex-wrap gap-1">
          {selected.map((option) => {
            return (
              <Badge
                key={option.value}
                className={cn(
                  option.color,
                  "data-[disabled]:bg-muted-foreground data-[disabled]:text-muted data-[disabled]:hover:bg-muted-foreground",
                  "data-[fixed]:bg-muted-foreground data-[fixed]:text-muted data-[fixed]:hover:bg-muted-foreground",
                  badgeClassName
                )}
                data-fixed={option.fixed}
                data-disabled={disabled}
              >
                {option.label}
                <button
                  className={cn(
                    "ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    (disabled || option.fixed) && "hidden"
                  )}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUnselect(option);
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => handleUnselect(option)}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            );
          })}
          <CommandPrimitive.Input
            ref={inputRef}
            value={inputValue}
            disabled={disabled}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className="ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>
      <div className="relative mt-2">
        {open && (
          <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
            <CommandList>
              {selectables.length === 0 && !createOption && (
                <CommandEmpty>{emptyMessage}</CommandEmpty>
              )}
              <CommandGroup>
                {selectables.map((option) => (
                  <CommandItem
                    key={option.value}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onSelect={() => {
                      if (maxSelected && selected.length >= maxSelected) {
                        onMaxSelected?.(selected.length);
                        return;
                      }
                      setInputValue("");
                      onChange?.([...selected, option]);
                    }}
                    className={"cursor-pointer"}
                  >
                    {option.label}
                  </CommandItem>
                ))}
                {inputValue && createOption && (
                  <CommandItem
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onSelect={handleCreateOption}
                    className="cursor-pointer"
                  >
                    Create &quot;{inputValue}&quot;
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </div>
        )}
      </div>
    </Command>
  );
}
