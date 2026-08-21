import React, { useState } from 'react';
import { Check, X, ShieldAlert, FileText, Sparkles } from 'lucide-react';

export function EntityReview() {
  const [pendingDocs, setPendingDocs] = useState([
    {
      document_id: 'doc-89a1f2c',
      filename: 'LDA_Gulberg_Commercial_Notification_2024.pdf',
      uploaded_by: 'Officer Tariq Mahmood',
      upload_date: '2026-08-20',
      status: 'PENDING_APPROVAL',
      entities: [
        {
          entity_id: 'ent-101',
          entity_type: 'FAR',
          raw_text: 'Floor Area Ratio: 1:8',
          value: '1:8',
          confidence: 0.96,
          page_number: 3,
          verified: false
        },
        {
          entity_id: 'ent-102',
          entity_type: 'HEIGHT_LIMIT',
          raw_text: 'Max Height: 120ft',
          value: '120ft',
          confidence: 0.94,
          page_number: 3,
          verified: false
        },
        {
          entity_id: 'ent-103',
          entity_type: 'SETBACK',
          raw_text: 'Compulsory front open space: 20ft',
          value: '20ft',
          confidence: 0.89,
          page_number: 4,
          verified: false
        }
      ]
    }
  ]);

  const handleToggleVerify = (docId, entityId) => {
    setPendingDocs((prev) =>
      prev.map((doc) => {
        if (doc.document_id === docId) {
          return {
            ...doc,
            entities: doc.entities.map((e) =>
              e.entity_id === entityId ? { ...e, verified: !e.verified } : e
            )
          };
        }
        return doc;
      })
    );
  };

  const handleApproveDoc = (docId) => {
    setPendingDocs((prev) =>
      prev.map((d) => (d.document_id === docId ? { ...d, status: 'APPROVED' } : d))
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <span>Municipal Officer Entity Verification Portal</span>
            <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              LDA Audit
            </span>
          </h2>
          <p className="text-xs text-slate-400">Verify AI-extracted building bylaws before vector storage deployment</p>
        </div>
      </div>

      {pendingDocs.map((doc) => (
        <div key={doc.document_id} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                <FileText className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200">{doc.filename}</h3>
                <p className="text-xs text-slate-500">Uploaded by {doc.uploaded_by} on {doc.upload_date}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                doc.status === 'APPROVED'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              }`}>
                {doc.status}
              </span>

              {doc.status !== 'APPROVED' && (
                <button
                  onClick={() => handleApproveDoc(doc.document_id)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md"
                >
                  Approve & Index to Vector RAG
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Entity Type</th>
                  <th className="p-3">Raw Extracted Clause</th>
                  <th className="p-3">Normalized Value</th>
                  <th className="p-3">Confidence</th>
                  <th className="p-3 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {doc.entities.map((ent) => (
                  <tr key={ent.entity_id} className="hover:bg-slate-900/40 transition-all">
                    <td className="p-3">
                      <span className="font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-semibold">
                        {ent.entity_type}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300 italic">"{ent.raw_text}"</td>
                    <td className="p-3 font-bold text-white">{ent.value}</td>
                    <td className="p-3 text-slate-400 font-mono">{(ent.confidence * 100).toFixed(0)}%</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleToggleVerify(doc.document_id, ent.entity_id)}
                        className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center space-x-1 ml-auto ${
                          ent.verified
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {ent.verified ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                        <span>{ent.verified ? 'Verified' : 'Verify Clause'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
