import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { uploadGazetteDocument } from '../../services/api';

export function UploadModal({ isOpen, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF gazette or image file.');
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await uploadGazetteDocument(formData);
      setResult(res);
      if (onSuccess) onSuccess(res);
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.response?.data?.detail || 'Failed to upload and process document.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white bg-slate-800 w-8 h-8 rounded-full flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <UploadCloud className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Upload LDA Gazette PDF</h2>
            <p className="text-xs text-slate-400">Ingest, extract OCR text & FAR bylaws</p>
          </div>
        </div>

        {!result ? (
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-2xl p-6 text-center cursor-pointer transition-all bg-slate-950/40">
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="hidden"
                id="gazette-upload-input"
              />
              <label htmlFor="gazette-upload-input" className="cursor-pointer space-y-2 block">
                <FileText className="w-10 h-10 text-emerald-400 mx-auto opacity-80" />
                {file ? (
                  <div>
                    <p className="text-xs font-bold text-emerald-400">{file.name}</p>
                    <p className="text-[10px] text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Click to choose or drag & drop PDF</p>
                    <p className="text-[10px] text-slate-500">Supports LDA Official Notifications & Gazette scans</p>
                  </div>
                )}
              </label>
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-rose-400 text-xs bg-rose-950/40 p-3 rounded-xl border border-rose-800">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={uploading || !file}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Processing OCR & PII Redaction...</span>
                </>
              ) : (
                <span>Upload & Extract Entities</span>
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-4 text-center py-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-bold text-white">Document Processed Successfully!</h3>
            <div className="bg-slate-950/60 p-3 rounded-xl text-left text-xs space-y-1 text-slate-300 border border-slate-800">
              <p><span className="text-slate-500">Document ID:</span> <span className="font-mono text-emerald-400">{result.document_id}</span></p>
              <p><span className="text-slate-500">Extracted Entities:</span> <span className="font-bold text-white">{result.extracted_entities_count} LDA Bylaw Clauses</span></p>
              <p><span className="text-slate-500">PII Status:</span> <span className="text-emerald-400">Sanitized (CNIC & Contact Redacted)</span></p>
            </div>
            <button
              onClick={() => { setResult(null); setFile(null); onClose(); }}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2.5 rounded-xl border border-slate-700"
            >
              Close & View Entity Review
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
