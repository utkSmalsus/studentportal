import * as React from 'react';
import { useState } from 'react';
import { PageHeader, Card, SectionTitle, StatusPill } from '../../ui/Primitives';
import { FormField, FormSection, TextInput, Select, Checkbox } from '../ui/AdminPrimitives';
import * as courseRepo from '../repository/courseRepository';
import * as settingsRepo from '../repository/settingsRepository';
import { useAppState } from '../../state/AppStateContext';
import * as progression from '../../state/engine/progression';
import { moduleDefs, course as activeCourse } from '../../data/selectors';

const CertificatesAdminPage: React.FC = () => {
  const { state: liveProgress } = useAppState();
  const courses = courseRepo.listCourses();
  const [courseId, setCourseId] = useState(courses[0]?.id || '');
  const cert = settingsRepo.getCertificateForCourse(courseId) || { courseId, name: '', prefix: '', minAssessmentScorePercent: 60, requireAllModulesComplete: true, template: 'Standard' };

  const update = (patch: Partial<typeof cert>): void => settingsRepo.upsertCertificate(courseId, patch);

  const isActiveCourse = courseId === activeCourse.id;
  const overallProgress = isActiveCourse ? progression.courseOverallProgress(activeCourse, moduleDefs, liveProgress) : 0;
  const allModulesComplete = isActiveCourse && moduleDefs.every((m) => progression.isModuleComplete(m, liveProgress));
  const eligible = cert.requireAllModulesComplete ? allModulesComplete : overallProgress >= 100;

  return (
    <div>
      <PageHeader eyebrow="System" title="Certificates" subtitle="Configure completion requirements for each course's certificate." />

      <div className="mb-5">
        <Select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="max-w-[260px]">
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </Select>
      </div>

      <Card className="max-w-2xl">
        <FormSection title="Certificate">
          <FormField label="Certificate Name">
            <TextInput value={cert.name} onChange={(e) => update({ name: e.target.value })} />
          </FormField>
          <FormField label="Certificate Prefix" hint="Used to generate certificate numbers, e.g. MERN-CERT-0001">
            <TextInput value={cert.prefix} onChange={(e) => update({ prefix: e.target.value })} />
          </FormField>
          <FormField label="Certificate Template">
            <Select value={cert.template} onChange={(e) => update({ template: e.target.value })}>
              <option value="Standard">Standard</option>
              <option value="Premium">Premium</option>
            </Select>
          </FormField>
        </FormSection>

        <FormSection title="Completion Requirements">
          <FormField label="Minimum Assessment Score (%)">
            <TextInput type="number" value={cert.minAssessmentScorePercent} onChange={(e) => update({ minAssessmentScorePercent: Number(e.target.value) })} />
          </FormField>
          <Checkbox label="Require all modules complete" checked={cert.requireAllModulesComplete} onChange={(v) => update({ requireAllModulesComplete: v })} />
        </FormSection>

        {isActiveCourse && (
          <div className="pt-4 border-t border-slate-100">
            <SectionTitle>Live Demo Student Eligibility</SectionTitle>
            <div className="flex items-center gap-3">
              <StatusPill color={eligible ? 'green' : 'gray'}>{eligible ? 'Certificate Available' : 'Not Yet Eligible'}</StatusPill>
              <span className="text-sm text-slate-500">{overallProgress}% course progress</span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CertificatesAdminPage;
