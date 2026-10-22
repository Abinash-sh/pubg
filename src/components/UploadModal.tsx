import React, { useRef, useState } from 'react';
import { X, UploadCloud, FileCode, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { ModelDefinition } from '../types/model';
import { loadCustomModelFromFile } from '../3d/fileLoader';
import { sound } from '../services/sound';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onModelLoaded: (def: ModelDefinition, mesh: any) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onModelLoaded,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setErrorMsg(null);
    sound.playSwoosh();

    try {
      const result = await loadCustomModelFromFile(file);
      sound.playMetalChime();
      onModelLoaded(result.definition, result.object);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error importing 3D model.';
      setErrorMsg(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">Import 3D Asset</h2>
              <p className="text-xs text-slate-400">Load local models directly into the real-time studio</p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-950/40 hover:bg-slate-950/70 transition-all group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".glb,.gltf,.obj,.stl"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-14 h-14 rounded-2xl bg-cyan-950/40 border border-cyan-800/50 flex items-center justify-center text-cyan-400 mb-3 group-hover:scale-105 transition-transform">
              <FileCode className="w-7 h-7" />
            </div>
            <p className="text-sm font-semibold text-white mb-1">
              Drag & Drop your 3D file here, or <span className="text-cyan-400 underline">Browse</span>
            </p>
            <p className="text-xs text-slate-400 font-mono">
              Accepted formats: .GLB, .GLTF, .OBJ, .STL
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800 text-cyan-300 text-xs flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin shrink-0" />
              <span>Parsing mesh geometry, calculating bounds & building shaders...</span>
            </div>
          )}

          {/* Supported Format Specifications */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-xs font-semibold text-slate-300">Supported Formats:</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/80">
                <span className="font-mono font-bold text-cyan-400">.GLB / .GLTF</span>
                <p className="text-[11px] text-slate-400 mt-0.5">Binary & JSON glTF with full PBR materials & hierarchy</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/80">
                <span className="font-mono font-bold text-blue-400">.OBJ / .STL</span>
                <p className="text-[11px] text-slate-400 mt-0.5">Wavefront OBJ multi-mesh & stereolithography CAD formats</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
