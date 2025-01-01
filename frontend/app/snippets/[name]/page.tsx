'use client';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { stringToColor } from "@/lib/utils";
import { ArrowLeft, Play, Copy, Code, ChevronDown, ChevronUp, Download, X } from "lucide-react";
import Link from "next/link";
import { DependencyGraph } from "@/components/ui/dependency-graph";
import { cn } from "@/lib/utils";
import { CodeBlock } from "@/components/ui/code-block";
import { MatrixInput } from "@/components/ui/matrix-input";
import { MatrixDisplay } from "@/components/ui/matrix-display";
import { Switch } from "@/components/ui/switch";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface SnippetDetails {
  name: string;
  description: string;
  endpoint: string;
  params: Record<string, string>;
  return_type: string;
  dependencies: string[];
}

// Add this helper function to check if a value is a dictionary
const isDict = (value: any): value is Record<string, any> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

// Add this helper function for copying individual values
const copyToClipboard = async (text: string) => {
  await navigator.clipboard.writeText(text);
};

// Add this constant at the top of the file
const MAX_DISPLAY_LENGTH = 200;  // Adjust this value as needed

// Add this helper function
const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

// Add this helper function
const downloadJson = (data: any, filename: string) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

// Add this helper function at the top with other helpers
const formatNumber = (value: number): string => {
  return Number.isInteger(value) ? value.toString() : value.toFixed(2);
};

export default function SnippetPage() {
  const params = useParams();
  const [snippet, setSnippet] = useState<SnippetDetails | null>(null);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<'formatted' | 'raw'>('formatted');
  const [copiedFields, setCopiedFields] = useState<Record<string, boolean>>({});
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [executionStates, setExecutionStates] = useState<
    Record<string, 'pending' | 'executing' | 'completed' | 'error'>
  >({});
  const [expandedFields, setExpandedFields] = useState<Record<string, boolean>>({});
  const [isRawExpanded, setIsRawExpanded] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [isLoadingCode, setIsLoadingCode] = useState(false);

  useEffect(() => {
    const fetchSnippetDetails = async () => {
      const response = await fetch('http://localhost:8000/api/snippets');
      const data = await response.json();
      const snippetDetails = data.snippets.find((s: SnippetDetails) => s.name === params.name);
      if (snippetDetails) {
        setSnippet(snippetDetails);
        // Initialize inputs with proper default values
        const initialInputs = Object.entries(snippetDetails.params).reduce((acc, [key, type]) => {
          if (type.toLowerCase() === 'list[list[float]]') {
            acc[key] = JSON.stringify([[0, 0], [0, 0]]);  // Default 2x2 matrix
          } else {
            acc[key] = '';
          }
          return acc;
        }, {} as Record<string, string>);
        setInputs(initialInputs);
      }
    };

    fetchSnippetDetails();
  }, [params.name]);

  const handleInputChange = (param: string, value: string) => {
    setInputs(prev => ({ ...prev, [param]: value }));
  };

  const handleAbort = () => {
    setIsLoading(false);
    setError('Execution aborted');
    setExecutionStates(prev => ({
      ...prev,
      [snippet!.name]: 'error',
      ...snippet!.dependencies.reduce((acc, dep) => ({
        ...acc,
        [dep]: 'error'
      }), {})
    }));
  };

  const executeSnippet = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    // Initialize execution states
    const initialStates = {
      [snippet!.name]: 'executing',
      ...snippet!.dependencies.reduce((acc, dep) => ({
        ...acc,
        [dep]: 'pending'
      }), {})
    };
    setExecutionStates(initialStates);

    try {
      // Parse any matrix inputs before sending
      const processedInputs = Object.entries(inputs).reduce((acc, [key, value]) => {
        if (snippet?.params[key]?.toLowerCase() === 'list[list[float]]') {
          acc[key] = JSON.parse(value);
        } else if (snippet?.params[key]?.toLowerCase() === 'bool') {
          acc[key] = value === 'true';  // Convert string to boolean
        } else {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);

      console.log('Executing snippet:', snippet?.endpoint, 'with params:', processedInputs);
      
      const response = await fetch(`http://localhost:8000${snippet?.endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(processedInputs),
      });
      
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        const errorMessage = data.detail || 'Failed to execute snippet';
        setError(errorMessage);
        setExecutionStates(prev => ({
          ...prev,
          [snippet!.name]: 'error'
        }));
        return;
      }

      setResult(data);
      setExecutionStates(prev => ({
        ...prev,
        [snippet!.name]: 'completed',
        ...snippet!.dependencies.reduce((acc, dep) => ({
          ...acc,
          [dep]: 'completed'
        }), {})
      }));

    } catch (err) {
      console.error('Execution error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setExecutionStates(prev => ({
        ...prev,
        [snippet!.name]: 'error'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyRaw = async () => {
    await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  // Add handler for copying individual fields
  const handleCopyField = async (key: string, value: string) => {
    await copyToClipboard(value);
    setCopiedFields(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopiedFields(prev => ({ ...prev, [key]: false }));
    }, 2000);
  };

  // Add toggle handler
  const toggleExpand = (key: string) => {
    setExpandedFields(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const fetchCode = async () => {
    try {
      setIsLoadingCode(true);
      const response = await fetch(`http://localhost:8000/api/snippets/${params.name}/code`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to fetch code');
      }
      setCode(data.code);
    } catch (err) {
      console.error('Error fetching code:', err);
    } finally {
      setIsLoadingCode(false);
    }
  };

  if (!snippet) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Snippets
        </Link>
        <ThemeToggle />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="capitalize">{snippet.name.replace(/_/g, ' ')}</CardTitle>
            <CardDescription>{snippet.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="inputs" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="inputs">Inputs</TabsTrigger>
                <TabsTrigger 
                  value="code" 
                  onClick={() => {
                    if (code === null) {
                      fetchCode();
                    }
                  }}
                >
                  Code
                </TabsTrigger>
              </TabsList>

              <TabsContent value="inputs" className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Inputs</h3>
                    <div className="flex gap-2">
                      {Object.entries(snippet.params).map(([paramName, type]) => (
                        <Badge
                          key={`${paramName}-${type}`}
                          style={{
                            backgroundColor: stringToColor(type),
                            color: '#000000',
                            border: 'none'
                          }}
                          className="h-5"
                        >
                          {type === 'list[list[float]]' ? '2D Matrix' : type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {Object.entries(snippet.params).map(([param, type]) => (
                    <div key={param} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <label htmlFor={param} className="text-sm font-medium">
                          {param}
                        </label>
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
                      {type.toLowerCase() === 'list[list[float]]' ? (
                        <MatrixInput
                          value={JSON.parse(inputs[param] || '[[0,0],[0,0]]')}
                          onChange={(matrix) => handleInputChange(param, JSON.stringify(matrix))}
                          allowRectangular={snippet.name === 'add_matrices'}
                        />
                      ) : type.toLowerCase() === 'bool' ? (
                        <Switch
                          checked={inputs[param] === 'true'}
                          onCheckedChange={(checked) => handleInputChange(param, String(checked))}
                        />
                      ) : (
                        <Input
                          id={param}
                          type={type === 'float' || type === 'int' ? 'number' : 'text'}
                          value={inputs[param]}
                          onChange={(e) => handleInputChange(param, e.target.value)}
                          placeholder={`Enter ${param}`}
                          step={type === 'float' ? '0.01' : '1'}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <Button 
                  onClick={isLoading ? handleAbort : executeSnippet} 
                  className="w-full"
                  variant={isLoading ? "destructive" : "default"}
                  disabled={!snippet}
                >
                  {isLoading ? (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Abort
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Execute
                    </>
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="code">
                <div className="relative bg-muted rounded-lg">
                  {isLoadingCode ? (
                    <div className="p-4 text-center text-muted-foreground">
                      Loading code...
                    </div>
                  ) : code ? (
                    <CodeBlock 
                      code={code}
                      language="python"
                      isExpanded={true}
                    />
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      Failed to load code
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Output</h3>
              <Badge
                style={{
                  backgroundColor: stringToColor(snippet.return_type),
                  color: '#000000',
                  border: 'none'
                }}
                className="h-5"
              >
                {snippet.return_type.toLowerCase() === 'list[list[float]]' ? '2D Matrix' : snippet.return_type}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {error ? (
              <div className="text-red-500 p-4 bg-red-50 rounded-lg">
                {error}
              </div>
            ) : result !== null && (
              <Tabs defaultValue="formatted" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="formatted">Formatted</TabsTrigger>
                  <TabsTrigger value="raw">Raw</TabsTrigger>
                </TabsList>
                <TabsContent value="formatted" className="space-y-4">
                  <div className="bg-muted rounded-lg p-6">
                    <div className="text-sm font-medium text-muted-foreground mb-4">
                      Output
                    </div>
                    {isDict(result) ? (
                      <div className="grid gap-4">
                        {Object.entries(result).map(([key, value]) => {
                          const isMatrix = Array.isArray(value) && Array.isArray(value[0]);
                          return (
                            <div
                              key={key}
                              className="bg-background rounded-lg p-4 border border-border"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-muted-foreground">
                                    {key}
                                  </span>
                                  <Badge variant="outline" className="h-5">
                                    {isMatrix ? '2D Matrix' : typeof value}
                                  </Badge>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8"
                                  onClick={() => handleCopyField(key, String(value))}
                                >
                                  {copiedFields[key] ? (
                                    "Copied!"
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                              {isMatrix ? (
                                <MatrixDisplay 
                                  matrix={value.map((row: number[]) => 
                                    row.map(cell => Number(formatNumber(cell)))
                                  )} 
                                />
                              ) : (
                                <div className="font-mono text-lg break-all">
                                  {typeof value === 'number' ? formatNumber(value) : String(value)}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : Array.isArray(result) && Array.isArray(result[0]) ? (
                      <div className="flex items-center justify-between">
                        <MatrixDisplay 
                          matrix={result.map((row: number[]) => 
                            row.map(cell => Number(formatNumber(cell)))
                          )} 
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8"
                          onClick={() => handleCopyField('result', String(result))}
                        >
                          {copiedFields['result'] ? (
                            "Copied!"
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="text-4xl font-bold">
                          {typeof result === 'number' ? formatNumber(result) : String(result)}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8"
                          onClick={() => handleCopyField('result', String(result))}
                        >
                          {copiedFields['result'] ? (
                            "Copied!"
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="raw" className="space-y-4">
                  <div className="bg-muted rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium text-muted-foreground">
                        Raw Output
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadJson(result, `${snippet.name}_result.json`)}
                          className="h-8"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCopyRaw}
                          className="h-8"
                        >
                          {copiedRaw ? (
                            "Copied!"
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="relative">
                      <CodeBlock 
                        code={JSON.stringify(result, null, 2)}
                        isExpanded={isRawExpanded}
                      />
                      {!isRawExpanded && JSON.stringify(result, null, 2).length > MAX_DISPLAY_LENGTH && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-muted to-transparent h-20 flex items-end justify-center pb-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setIsRawExpanded(true)}
                          >
                            Show Full Result
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dependencies section */}
      {snippet.dependencies.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Dependencies</h3>
          <DependencyGraph 
            dependencies={snippet.dependencies}
            currentSnippet={snippet.name}
            executionStates={executionStates}
          />
        </div>
      )}
    </div>
  );
} 