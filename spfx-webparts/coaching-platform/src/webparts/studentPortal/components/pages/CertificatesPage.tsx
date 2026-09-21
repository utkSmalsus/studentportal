import * as React from 'react';
import { Card } from '../../ui/Primitives';
import { certificates } from '../../data/mockData';

const CertificatesPage: React.FC = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Certificates</h1>
      <p className="text-gray-500">Issued automatically when a course or module is completed</p>
    </div>

    {certificates.length === 0 ? (
      <Card className="text-center text-gray-400 py-12">No certificates yet — complete a module to earn one.</Card>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {certificates.map((c) => (
          <Card key={c.id} className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center text-2xl">🏅</div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900">{c.courseTitle}</div>
              <div className="text-xs text-gray-400">Issued {c.issuedAt}</div>
            </div>
            <a href={c.fileUrl} className="text-sm font-medium text-blue-600 hover:underline">
              Download
            </a>
          </Card>
        ))}
      </div>
    )}
  </div>
);

export default CertificatesPage;
