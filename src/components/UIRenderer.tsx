import React from "react";

interface UIRendererProps {
  html: string;
}

export function UIRenderer({ html }: UIRendererProps) {
  return (
    <div className="space-y-4">
      <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
          Rendered Output
        </h2>

        <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-600/30 min-h-[200px] flex items-center justify-center">
          <div
            dangerouslySetInnerHTML={{ __html: html }}
            className="w-full text-white text-center [&_span]:inline-block [&_span]:px-4 [&_span]:py-2 [&_span]:bg-slate-700/50 [&_span]:rounded [&_span]:border [&_span]:border-slate-600/50"
          />
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Raw HTML</h3>
        <pre className="bg-slate-900/50 rounded p-4 text-xs overflow-auto max-h-48 text-slate-300 whitespace-pre-wrap break-words">
          {html}
        </pre>
      </div>
    </div>
  );
}
