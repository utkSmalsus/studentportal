import * as React from 'react';
import { PageHeader, EmptyState } from '../../ui/Primitives';
import { AwardIcon } from '../../ui/icons';

const CertificatesPage: React.FC = () => (
  <div>
    <PageHeader eyebrow="Progress" title="Certificates" subtitle="Issued automatically when you complete a course." />
    <EmptyState
      title="No certificates yet"
      description="Complete the MERN Full Stack Development course to earn your certificate."
      icon={<AwardIcon className="w-5 h-5" />}
    />
  </div>
);

export default CertificatesPage;
