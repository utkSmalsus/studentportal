import * as React from 'react';
import { useState } from 'react';
import { PageHeader, PrimaryButton, SecondaryButton } from '../../ui/Primitives';
import { AdminTable, AdminColumn, StatusBadge, Drawer, FormField, Select } from '../ui/AdminPrimitives';
import { PlusIcon, AlertIcon } from '../../ui/icons';
import { SemanticColor } from '../../ui/statusMeta';
import * as courseRepo from '../repository/courseRepository';
import * as rosterRepo from '../repository/rosterRepository';
import { Enrollment, EnrollmentStatus } from '../types';

const statusColor: Record<EnrollmentStatus, SemanticColor> = { active: 'green', completed: 'blue', withdrawn: 'red' };

const EnrollmentsPage: React.FC = () => {
  const courses = courseRepo.listCourses();
  const students = rosterRepo.listStudents();
  const batches = rosterRepo.listBatches();
  const enrollments = rosterRepo.listEnrollments();

  const [enrolling, setEnrolling] = useState(false);
  const [studentId, setStudentId] = useState(students[0]?.id || '');
  const [courseId, setCourseId] = useState(courses[0]?.id || '');
  const [batchId, setBatchId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [expectedCompletion, setExpectedCompletion] = useState('');

  const selectedStudent = students.find((s) => s.id === studentId);
  const isSwitchingLiveCourse = !!selectedStudent?.isLiveDemoStudent && selectedStudent.courseId !== courseId;

  const columns: AdminColumn<Enrollment>[] = [
    { key: 'student', label: 'Student', render: (e) => students.find((s) => s.id === e.studentId)?.name || '—' },
    { key: 'course', label: 'Course', render: (e) => courses.find((c) => c.id === e.courseId)?.title || '—' },
    { key: 'batch', label: 'Batch', render: (e) => batches.find((b) => b.id === e.batchId)?.name || '—' },
    { key: 'start', label: 'Start Date', render: (e) => e.startDate },
    { key: 'expected', label: 'Expected Completion', render: (e) => e.expectedCompletion },
    { key: 'status', label: 'Status', render: (e) => <StatusBadge color={statusColor[e.status]}>{e.status}</StatusBadge> },
  ];

  const handleEnroll = (): void => {
    if (!studentId || !courseId || !startDate) return;
    rosterRepo.enrollStudent({ studentId, courseId, batchId: batchId || undefined, startDate, expectedCompletion });
    setEnrolling(false);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Students"
        title="Enrollments"
        subtitle="Enrolling a student assigns them a course and starts their journey from the first unlocked module."
        action={
          <PrimaryButton onClick={() => setEnrolling(true)}>
            <PlusIcon className="w-4 h-4" /> Enroll Student
          </PrimaryButton>
        }
      />

      <AdminTable columns={columns} rows={enrollments} rowKey={(e) => e.id} emptyLabel="No enrollments yet." />

      <Drawer
        open={enrolling}
        title="Enroll Student"
        onClose={() => setEnrolling(false)}
        footer={
          <>
            <SecondaryButton onClick={() => setEnrolling(false)}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleEnroll} disabled={!studentId || !courseId || !startDate}>
              Enroll
            </PrimaryButton>
          </>
        }
      >
        <div className="space-y-4">
          <FormField label="Student">
            <Select value={studentId} onChange={(e) => setStudentId(e.target.value)}>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Course">
            <Select
              value={courseId}
              onChange={(e) => {
                // A batch belongs to one course — switching courses without
                // clearing this would silently submit a batch from the
                // student's PREVIOUS course selection.
                setCourseId(e.target.value);
                setBatchId('');
              }}
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Batch">
            <Select value={batchId} onChange={(e) => setBatchId(e.target.value)}>
              <option value="">—</option>
              {batches.filter((b) => b.courseId === courseId).map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Start Date">
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm" />
            </FormField>
            <FormField label="Expected Completion">
              <input type="date" value={expectedCompletion} onChange={(e) => setExpectedCompletion(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm" />
            </FormField>
          </div>

          {isSwitchingLiveCourse && (
            <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-3">
              <AlertIcon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">
                {selectedStudent?.name} is the live demo student — enrolling them here switches the Student Portal to this course immediately.
              </p>
            </div>
          )}
        </div>
      </Drawer>
    </div>
  );
};

export default EnrollmentsPage;
