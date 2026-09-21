import * as React from 'react';
import { EmptyState } from '../../ui/Primitives';

const CertificatesPage: React.FC = () => (
  <div>
    <h1 className="text-2xl font-semibold text-gray-900">Certificates</h1>
    <p className="text-gray-500 mt-1">Issued automatically when you complete a course.</p>
    <div className="mt-6">
      <EmptyState
        title="No certificates yet"
        description="Complete the MERN Full Stack Development course to earn your certificate."
      />
    </div>
  </div>
);

export default CertificatesPage;
