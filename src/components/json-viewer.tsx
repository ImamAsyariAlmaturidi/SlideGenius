"use client";

import React from "react";
import { ChevronDown, ChevronRight, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface JsonViewerProps {
  data: any;
  expanded?: boolean;
}

const formatValue = (value: any): React.ReactNode => {
  if (value === null) return <span className="text-indigo-400">null</span>;
  if (typeof value === "boolean")
    return <span className="text-teal-500">{String(value)}</span>;
  if (typeof value === "number")
    return <span className="text-amber-500">{value}</span>;
  if (typeof value === "string")
    return <span className="text-emerald-500">"{value}"</span>;
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
    <div className="bg-gray-100 border border-gray-300 rounded-lg overflow-hidden shadow-md">
      <div className="flex items-center justify-between p-2 bg-gray-200 border-b border-gray-300">
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-700 hover:bg-gray-300"
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
          className="text-gray-700 hover:bg-gray-300"
          onClick={copyToClipboard}
        >
          {copied ? "Copied!" : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      {isExpanded && (
        <div className="p-4 font-mono text-sm text-gray-800 max-h-[400px] overflow-auto bg-white">
          <JsonTree data={data} level={0} />
        </div>
      )}

      {!isExpanded && (
        <div
          className="p-4 font-mono text-sm text-gray-600 cursor-pointer bg-white"
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
        className="cursor-pointer text-gray-800"
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
              {!isArray && <span className="text-purple-600">"{key}"</span>}
              {!isArray && <span className="text-gray-800">: </span>}
              {typeof value === "object" && value !== null ? (
                <JsonTree data={value} level={level + 1} />
              ) : (
                formatValue(value)
              )}
              {index < arr.length - 1 && (
                <span className="text-gray-800">,</span>
              )}
            </div>
          ))}
        </div>
      )}
      {isExpanded && (
        <span className="text-gray-800">{isArray ? "]" : "}"}</span>
      )}
    </div>
  );
};
