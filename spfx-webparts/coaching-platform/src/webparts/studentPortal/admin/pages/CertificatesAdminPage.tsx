import * as React from 'react';
import { useState } from 'react';
import { PageHeader, Card, SectionTitle, StatusPill, LoadingState } from '../../ui/Primitives';
import { FormField, FormSection, TextInput, Select, Checkbox, AdminTable, AdminColumn } from '../ui/AdminPrimitives';
import { StudentRecord, CertificateConfig } from '../types';
import { useCourses, useCertificateForCourse, useUpsertCertificate, useStudents, useStudentProgressView } from '../../hooks';

const defaultCert = (courseId: string): CertificateConfig => ({
  courseId,
  name: '',
  prefix: '',
  minAssessmentScorePercent: 60,
  requireAllModulesComplete: true,
  template: 'Standard',
});

const CertificateProgressCell: React.FC<{ studentId: string; courseId: string }> = ({ studentId, courseId }) => {
  const { data: view, isLoading } = useStudentProgressView(studentId, courseId);
  if (isLoading) return <span className="text-xs text-slate-400">...</span>;
  return <span>{view?.overallPercent ?? 0}%</span>;
};

const CertificateEligibilityCell: React.FC<{
  studentId: string;
  courseId: string;
  requireAllModulesComplete: boolean;
}> = ({ studentId, courseId, requireAllModulesComplete }) => {
  const { data: view, isLoading } = useStudentProgressView(studentId, courseId);
  if (isLoading) return <span className="text-xs text-slate-400">...</span>;
  if (!view) return <StatusPill color="gray">Not Yet Eligible</StatusPill>;
  const eligible = requireAllModulesComplete ? view.currentModuleTitle === 'Complete' : view.overallPercent >= 100;
  return <StatusPill color={eligible ? 'green' : 'gray'}>{eligible ? 'Certificate Available' : 'Not Yet Eligible'}</StatusPill>;
};

const CertificatesAdminPage: React.FC = () => {
  const { data: courses = [], isLoading: coursesLoading } = useCourses();
  const [selectedCourseId, setSelectedCourseId] = useState('');

  const activeCourseId = selectedCourseId || courses[0]?.id || '';

  const { data: certData, isLoading: certLoading } = useCertificateForCourse(activeCourseId);
  const { data: allStudents = [], isLoading: studentsLoading } = useStudents();
  const upsertMutation = useUpsertCertificate();

  const cert = certData || defaultCert(activeCourseId);

  const update = (patch: Partial<Omit<CertificateConfig, 'courseId'>>): void => {
    upsertMutation.mutate({ courseId: activeCourseId, patch });
  };

  const enrolledStudents = allStudents.filter((s) => s.courseId === activeCourseId);

  const columns: AdminColumn<StudentRecord>[] = [
    { key: 'name', label: 'Student', render: (s) => s.name },
    {
      key: 'progress',
      label: 'Progress',
      render: (s) => <CertificateProgressCell studentId={s.id} courseId={s.courseId} />,
    },
    {
      key: 'eligible',
      label: 'Eligibility',
      render: (s) => (
        <CertificateEligibilityCell
          studentId={s.id}
          courseId={s.courseId}
          requireAllModulesComplete={cert.requireAllModulesComplete}
        />
      ),
    },
  ];

  const isLoading = coursesLoading || (!!activeCourseId && certLoading) || studentsLoading;

  if (isLoading) {
    return (
      <div>
        <PageHeader eyebrow="System" title="Certificates" subtitle="Configure completion requirements for each course's certificate." />
        <LoadingState label="Loading certificates..." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader eyebrow="System" title="Certificates" subtitle="Configure completion requirements for each course's certificate." />

      <div className="mb-5">
        <Select value={activeCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} className="max-w-[260px]">
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
            <Select value={cert.template} onChange={(e) => update({ template: e.target.value as CertificateConfig['template'] })}>
              <option value="Standard">Standard</option>
              <option value="Premium">Premium</option>
            </Select>
          </FormField>
        </FormSection>

        <FormSection title="Completion Requirements">
          <FormField label="Minimum Assessment Score (%)">
            <TextInput
              type="number"
              value={cert.minAssessmentScorePercent}
              onChange={(e) => update({ minAssessmentScorePercent: Number(e.target.value) })}
            />
          </FormField>
          <Checkbox
            label="Require all modules complete"
            checked={cert.requireAllModulesComplete}
            onChange={(v) => update({ requireAllModulesComplete: v })}
          />
        </FormSection>
      </Card>

      <div className="mt-8 max-w-2xl">
        <SectionTitle>Student Eligibility ({enrolledStudents.length})</SectionTitle>
        <AdminTable columns={columns} rows={enrolledStudents} rowKey={(s) => s.id} emptyLabel="No students enrolled in this course." />
      </div>
    </div>
  );
};

export default CertificatesAdminPage;
