'use client';
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { stringToColor } from "@/lib/utils";

interface TypeFilterProps {
  label: string;
  types: string[];
  selectedTypes: string[];
  onSelectionChange: (types: string[]) => void;
}

export function TypeFilter({ label, types, selectedTypes, onSelectionChange }: TypeFilterProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-8">
          {label}
          {selectedTypes.length > 0 && (
            <Badge 
              variant="secondary" 
              className="ml-2 rounded-sm px-1 font-normal"
            >
              {selectedTypes.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {types.map((type) => (
          <DropdownMenuCheckboxItem
            key={type}
            checked={selectedTypes.includes(type)}
            onCheckedChange={(checked) => {
              if (checked) {
                onSelectionChange([...selectedTypes, type]);
              } else {
                onSelectionChange(selectedTypes.filter((t) => t !== type));
              }
            }}
          >
            <div className="flex items-center gap-2">
              <Badge
                style={{
                  backgroundColor: stringToColor(type),
                  color: '#000000',
                  border: 'none'
                }}
                className="h-5"
              >
                {type.toLowerCase() === 'list[list[float]]' ? '2D Matrix' : type}
              </Badge>
            </div>
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 