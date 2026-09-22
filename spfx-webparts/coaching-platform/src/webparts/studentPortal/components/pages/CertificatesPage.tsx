import * as React from 'react';
import { PageHeader, Card, SectionTitle, EmptyState, ProgressBar } from '../../ui/Primitives';
import { AwardIcon } from '../../ui/icons';
import { useAppState } from '../../state/AppStateContext';
import * as courseRepo from '../../admin/repository/courseRepository';
import * as settingsRepo from '../../admin/repository/settingsRepository';
import { getStudentProgressView } from '../../admin/repository/progressView';

// Mirrors admin/pages/CertificatesAdminPage.tsx's isEligible exactly — same
// course-scoped config, same progress view, so a student never sees
// "Available" here while the admin's own eligibility table disagrees.
const CertificatesPage: React.FC = () => {
  const { studentId, courseId } = useAppState();
  const courseMeta = courseRepo.getCourseMeta(courseId);
  const cert = settingsRepo.getCertificateForCourse(courseId);
  const view = getStudentProgressView(studentId, courseId);
  const eligible = !!view && !!cert && (cert.requireAllModulesComplete ? view.currentModuleTitle === 'Complete' : view.overallPercent >= 100);

  return (
    <div>
      <PageHeader eyebrow="Progress" title="Certificates" subtitle="Issued automatically when you complete a course." />

      {!cert ? (
        <EmptyState
          title="No certificate configured"
          description={`${courseMeta?.title || 'This course'} doesn't have a certificate set up yet — check back later.`}
          icon={<AwardIcon className="w-5 h-5" />}
        />
      ) : eligible ? (
        <Card className="max-w-xl text-center py-10">
          <div className="mx-auto w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <AwardIcon className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-4">{cert.name || `${courseMeta?.title} — Certificate of Completion`}</h1>
          <p className="text-slate-500 mt-1">Congratulations — you&apos;ve completed {courseMeta?.title}.</p>
          {cert.prefix && <div className="mt-5 text-xs font-mono text-slate-400">Certificate No. {cert.prefix}-{studentId.slice(-4).toUpperCase()}</div>}
        </Card>
      ) : (
        <Card className="max-w-xl">
          <SectionTitle>Not Yet Eligible</SectionTitle>
          <p className="text-sm text-slate-500 mb-4">Complete {courseMeta?.title || 'this course'} to earn your certificate.</p>
          <ProgressBar percent={view?.overallPercent ?? 0} />
          <div className="text-xs text-slate-400 mt-2">{view?.overallPercent ?? 0}% complete</div>
        </Card>
      )}
    </div>
  );
};

export default CertificatesPage;
