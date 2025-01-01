'use client';
import { useEffect, useState, useMemo } from 'react';
import { SnippetCard } from '@/components/ui/snippet-card';
import { TypeFilter } from '@/components/ui/type-filter';
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { HealthBadge } from "@/components/ui/health-badge";

interface SnippetDetails {
  name: string;
  description: string;
  endpoint: string;
  params: Record<string, string>;
  return_type: string;
}

export default function Home() {
  const [snippets, setSnippets] = useState<SnippetDetails[]>([]);
  const [selectedInputTypes, setSelectedInputTypes] = useState<string[]>([]);
  const [selectedOutputTypes, setSelectedOutputTypes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Get unique types from all snippets
  const { inputTypes, outputTypes } = useMemo(() => {
    const inputSet = new Set<string>();
    const outputSet = new Set<string>();

    snippets.forEach(snippet => {
      // For inputs
      if (Object.keys(snippet.params).length === 0) {
        inputSet.add('void');
      } else {
        Object.values(snippet.params).forEach(type => inputSet.add(type));
      }
      
      // For outputs
      if (snippet.return_type === '') {
        outputSet.add('void');
      } else {
        outputSet.add(snippet.return_type);
      }
    });

    return {
      inputTypes: Array.from(inputSet),
      outputTypes: Array.from(outputSet)
    };
  }, [snippets]);

  // Filter snippets based on search and selected types
  const filteredSnippets = useMemo(() => {
    return snippets.filter(snippet => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = searchQuery === '' || 
        snippet.name.toLowerCase().includes(searchLower) ||
        snippet.description.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;

      // Input type filter
      const hasNoInputs = Object.keys(snippet.params).length === 0;
      const hasSelectedInput = selectedInputTypes.length === 0 || 
        (hasNoInputs && selectedInputTypes.includes('void')) ||
        Object.values(snippet.params).some(type => selectedInputTypes.includes(type));

      // Output type filter
      const hasNoOutput = snippet.return_type === '';
      const hasSelectedOutput = selectedOutputTypes.length === 0 || 
        (hasNoOutput && selectedOutputTypes.includes('void')) ||
        selectedOutputTypes.includes(snippet.return_type);

      return hasSelectedInput && hasSelectedOutput;
    });
  }, [snippets, searchQuery, selectedInputTypes, selectedOutputTypes]);

  useEffect(() => {
    const fetchSnippets = async () => {
      const response = await fetch('http://localhost:8000/api/snippets');
      const data = await response.json();
      setSnippets(data.snippets);
    };

    fetchSnippets();
  }, []);

  return (
    <main className="container mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">Snippets</h1>
          <HealthBadge />
        </div>
        <ThemeToggle />
      </div>

      <div className="space-y-6 mb-8">
        {/* Search Bar */}
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search snippets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <TypeFilter
            label="Input Types"
            types={inputTypes}
            selectedTypes={selectedInputTypes}
            onSelectionChange={setSelectedInputTypes}
          />
          <TypeFilter
            label="Output Types"
            types={outputTypes}
            selectedTypes={selectedOutputTypes}
            onSelectionChange={setSelectedOutputTypes}
          />
        </div>
      </div>

      {filteredSnippets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSnippets.map((snippet) => (
            <SnippetCard
              key={snippet.name}
              name={snippet.name}
              description={snippet.description}
              endpoint={snippet.endpoint}
              params={snippet.params}
              return_type={snippet.return_type}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          No snippets found matching your criteria.
        </div>
      )}
    </main>
  );
}
