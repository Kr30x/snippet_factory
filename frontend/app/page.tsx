'use client';
import { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { SnippetCard } from "@/components/ui/snippet-card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Link from 'next/link';

interface Snippet {
  name: string;
  description: string;
  endpoint: string;
  params: Record<string, string>;
  return_type: string;
}

export default function Home() {
  const [health, setHealth] = useState<{status?: string, error?: string}>({});
  const [loading, setLoading] = useState(true);
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [snippetsLoading, setSnippetsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('http://localhost:8000/health');
        const data = await response.json();
        setHealth(data);
      } catch (error) {
        setHealth({ error: 'Failed to connect to backend' });
      } finally {
        setLoading(false);
      }
    };

    const fetchSnippets = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/snippets');
        const data = await response.json();
        setSnippets(data.snippets);
      } catch (error) {
        console.error('Failed to fetch snippets:', error);
      } finally {
        setSnippetsLoading(false);
      }
    };

    checkHealth();
    fetchSnippets();
  }, []);

  const filteredSnippets = snippets.filter(snippet => {
    const searchLower = searchQuery.toLowerCase();
    return (
      snippet.name.toLowerCase().includes(searchLower) ||
      snippet.description.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="relative min-h-screen p-8">
      {/* Health Status Badge */}
      <div className="absolute top-4 right-4">
        {loading ? (
          <Badge variant="outline" className="animate-pulse flex items-center gap-2">
            Checking...
            <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse"></div>
          </Badge>
        ) : (
          <Link 
            href="http://localhost:8000/docs" 
            target="_blank"
            className={health.status ? "cursor-pointer" : "cursor-not-allowed pointer-events-none"}
          >
            <Badge 
              variant={health.status ? "secondary" : "destructive"}
              className="transition-colors flex items-center gap-2 hover:opacity-80"
            >
              {health.status ? "Backend Online" : "Backend Offline"}
              <div 
                className={`w-2 h-2 rounded-full ${
                  health.status 
                    ? "bg-green-500 animate-pulse" 
                    : "bg-red-500"
                }`}
              ></div>
            </Badge>
          </Link>
        )}
      </div>

      <main className="container mx-auto pt-16">
        <div className="flex flex-col gap-8">
          <h1 className="text-4xl font-bold">Snippets</h1>
          
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

          {snippetsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-[280px] bg-muted rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : filteredSnippets.length > 0 ? (
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
              No snippets found matching your search.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
