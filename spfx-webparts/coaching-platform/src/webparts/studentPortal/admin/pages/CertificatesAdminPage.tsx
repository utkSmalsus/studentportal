import * as React from 'react';
import { useState } from 'react';
import { PageHeader, Card, SectionTitle, StatusPill } from '../../ui/Primitives';
import { FormField, FormSection, TextInput, Select, Checkbox, AdminTable, AdminColumn } from '../ui/AdminPrimitives';
import * as courseRepo from '../repository/courseRepository';
import * as rosterRepo from '../repository/rosterRepository';
import * as settingsRepo from '../repository/settingsRepository';
import { getStudentProgressView } from '../repository/progressView';
import { StudentRecord } from '../types';

const CertificatesAdminPage: React.FC = () => {
  const courses = courseRepo.listCourses();
  const [courseId, setCourseId] = useState(courses[0]?.id || '');
  const cert = settingsRepo.getCertificateForCourse(courseId) || { courseId, name: '', prefix: '', minAssessmentScorePercent: 60, requireAllModulesComplete: true, template: 'Standard' };

  const update = (patch: Partial<typeof cert>): void => settingsRepo.upsertCertificate(courseId, patch);

  const enrolledStudents = rosterRepo.listStudents().filter((s) => s.courseId === courseId);

  const isEligible = (s: StudentRecord): boolean => {
    const view = getStudentProgressView(s.id, s.courseId);
    if (!view) return false;
    return cert.requireAllModulesComplete ? view.currentModuleTitle === 'Complete' : view.overallPercent >= 100;
  };

  const columns: AdminColumn<StudentRecord>[] = [
    { key: 'name', label: 'Student', render: (s) => s.name },
    { key: 'progress', label: 'Progress', render: (s) => `${getStudentProgressView(s.id, s.courseId)?.overallPercent ?? 0}%` },
    {
      key: 'eligible',
      label: 'Eligibility',
      render: (s) => <StatusPill color={isEligible(s) ? 'green' : 'gray'}>{isEligible(s) ? 'Certificate Available' : 'Not Yet Eligible'}</StatusPill>,
    },
  ];

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
      </Card>

      <div className="mt-8 max-w-2xl">
        <SectionTitle>Student Eligibility ({enrolledStudents.length})</SectionTitle>
        <AdminTable columns={columns} rows={enrolledStudents} rowKey={(s) => s.id} emptyLabel="No students enrolled in this course." />
      </div>
    </div>
  );
};

export default CertificatesAdminPage;
