"use client";

import React from "react";
import { ChevronDown, ChevronRight, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface JsonViewerProps {
  data: any;
  expanded?: boolean;
}

const formatValue = (value: any): React.ReactNode => {
  if (value === null) return <span className="text-json-null">null</span>;
  if (typeof value === "boolean")
    return <span className="text-json-boolean">{String(value)}</span>;
  if (typeof value === "number")
    return <span className="text-json-number">{value}</span>;
  if (typeof value === "string")
    return <span className="text-json-string">"{value}"</span>;
  return <span>{String(value)}</span>;
};

export function JsonViewer({ data, expanded = false }: JsonViewerProps) {
  const [isExpanded, setIsExpanded] = React.useState(expanded);
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-json-background border border-json-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-2 border-b border-json-border">
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-gray-800"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 mr-2" />
          ) : (
            <ChevronRight className="h-4 w-4 mr-2" />
          )}{" "}
          JSON
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-gray-800"
          onClick={copyToClipboard}
        >
          {copied ? "Copied!" : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      {isExpanded && (
        <div className="p-4 font-mono text-sm text-white max-h-[400px] overflow-auto">
          <JsonTree data={data} level={0} />
        </div>
      )}

      {!isExpanded && (
        <div
          className="p-4 font-mono text-sm text-gray-400 cursor-pointer"
          onClick={() => setIsExpanded(true)}
        >
          Click to expand...
        </div>
      )}
    </div>
  );
}

interface JsonTreeProps {
  data: any;
  level: number;
}

const JsonTree: React.FC<JsonTreeProps> = ({ data, level }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const isArray = Array.isArray(data);
  const isEmpty = isArray ? data.length === 0 : Object.keys(data).length === 0;

  if (isEmpty) {
    return <span>{isArray ? "[]" : "{}"}</span>;
  }

  return (
    <div className="pl-4">
      <span
        className="cursor-pointer text-white"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded
          ? isArray
            ? "["
            : "{"
          : `${isArray ? "[ ... ]" : "{ ... }"}`}
      </span>
      {isExpanded && (
        <div className="pl-4">
          {Object.entries(data).map(([key, value], index, arr) => (
            <div key={key} className="my-1">
              {!isArray && <span className="text-json-key">"{key}"</span>}
              {!isArray && <span className="text-white">: </span>}
              {typeof value === "object" && value !== null ? (
                <JsonTree data={value} level={level + 1} />
              ) : (
                formatValue(value)
              )}
              {index < arr.length - 1 && <span className="text-white">,</span>}
            </div>
          ))}
        </div>
      )}
      {isExpanded && <span className="text-white">{isArray ? "]" : "}"}</span>}
    </div>
  );
};
