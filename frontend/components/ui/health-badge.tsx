'use client';
import { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";

export function HealthBadge() {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('http://localhost:8000/health');
        setIsHealthy(response.ok);
      } catch (error) {
        setIsHealthy(false);
      }
    };

    // Initial check
    checkHealth();

    // Set up polling every 30 seconds
    const interval = setInterval(checkHealth, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link 
            href="http://localhost:8000/docs" 
            target="_blank"
            className="hover:opacity-80 transition-opacity"
          >
            <Badge 
              variant="outline" 
              className="flex items-center gap-2 cursor-pointer"
            >
              <div 
                className={cn(
                  "w-2 h-2 rounded-full",
                  isHealthy === null && "bg-yellow-500",
                  isHealthy === true && "bg-green-500",
                  isHealthy === false && "bg-red-500"
                )}
              />
              Backend {isHealthy === null ? "Checking" : isHealthy ? "Online" : "Offline"}
            </Badge>
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p>Click to open API docs</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 