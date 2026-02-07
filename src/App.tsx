import React, { useState } from "react";
import { AIGenerator } from "./components/AIGenerator";
import { UIRenderer } from "./components/UIRenderer";

export default function App() {
  const [generatedComponents, setGeneratedComponents] = useState<any[]>([]);
  const [adaptedHTML, setAdaptedHTML] = useState<string>("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <header className="sticky top-0 z-10 backdrop-blur-md bg-slate-900/80 border-b border-slate-700/50 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            AI UI Generator
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Offline demo mode (no external service calls)
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Generator */}
          <div className="space-y-6">
            <AIGenerator
              onGenerate={async () => {
                setLoading(true);
                try {
                  setGeneratedComponents([]);
                  setAdaptedHTML("");
                } finally {
                  setLoading(false);
                }
              }}
              loading={loading}
            />
          </div>

          {/* Right: Output */}
          <div className="space-y-6">
            {generatedComponents.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-lg p-6 space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                  Generated Schema
                </h2>
                <pre className="bg-slate-900/50 rounded p-4 text-xs overflow-auto max-h-96 text-slate-300">
                  {JSON.stringify(generatedComponents, null, 2)}
                </pre>
              </div>
            )}

            {adaptedHTML && <UIRenderer html={adaptedHTML} />}

            {loading && (
              <div className="flex items-center justify-center p-8 bg-slate-800/30 rounded-lg border border-slate-700/30">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-3 border-slate-600 border-t-cyan-400 rounded-full animate-spin"></div>
                  <p className="text-sm text-slate-400">Processing...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoCard
            title="Offline Demo"
            status={true}
            description="Static UI preview (no service dependencies)"
          />
          <InfoCard
            title="Frontend Renderer"
            status={true}
            description="Public-safe UI rendering only"
          />
          <InfoCard
            title="Standalone Ready"
            status={true}
            description="No calls to internal services"
          />
        </div>
      </main>
    </div>
  );
}

interface InfoCardProps {
  title: string;
  status: boolean;
  description: string;
}

function InfoCard({ title, status, description }: InfoCardProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div
          className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${status ? "bg-green-400" : "bg-red-400"}`}
        ></div>
        <div>
          <h3 className="font-semibold text-sm">{title}</h3>
          <p className="text-xs text-slate-400 mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
}
