import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { stringToColor } from "@/lib/utils"
import { Copy } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

interface SnippetCardProps {
  name: string;
  description: string;
  endpoint: string;
  params: Record<string, string>;
  return_type: string;
}

export function SnippetCard({ name, description, endpoint, params, return_type }: SnippetCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    await navigator.clipboard.writeText(endpoint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Link href={`/snippets/${name}`}>
      <Card className="w-full h-[280px] hover:shadow-lg transition-shadow flex flex-col">
        <CardHeader className="flex-none">
          <CardTitle className="capitalize">{name.replace(/_/g, ' ')}</CardTitle>
          <CardDescription className="line-clamp-2">{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col flex-1 justify-between">
          <div className="grid grid-cols-2 gap-4 flex-1">
            <div>
              <h3 className="text-sm font-medium mb-2">Inputs</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(params).map(([paramName, paramType]) => {
                  const bgColor = stringToColor(paramType);
                  return (
                    <Badge
                      key={`${paramName}-${paramType}`}
                      style={{
                        backgroundColor: bgColor,
                        color: '#000000',
                        border: 'none'
                      }}
                      className="w-fit px-2 py-1 text-xs"
                    >
                      {paramName}: {paramType.toLowerCase() === 'list[list[float]]' ? '2D Matrix' : paramType}
                    </Badge>
                  );
                })}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">Output</h3>
              <Badge 
                style={{
                  backgroundColor: stringToColor(return_type),
                  color: '#000000',
                  border: 'none'
                }}
                className="w-fit px-2 py-1 text-xs"
              >
                {return_type.toLowerCase() === 'list[list[float]]' ? '2D Matrix' : return_type}
              </Badge>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-4"
            onClick={handleCopy}
          >
            <Copy className="h-4 w-4 mr-2" />
            {copied ? "Copied!" : "Copy Endpoint"}
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
} 