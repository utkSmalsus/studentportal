import * as React from 'react';
import { PageHeader, Card, SectionTitle, StatusPill } from '../../ui/Primitives';
import * as mentorRepo from '../../admin/repository/mentorRepository';
import * as courseRepo from '../../admin/repository/courseRepository';
import { SemanticColor } from '../../ui/statusMeta';
import { BatchStatus } from '../../admin/types';

const statusColor: Record<BatchStatus, SemanticColor> = { upcoming: 'blue', active: 'green', completed: 'gray' };

const MyBatchesPage: React.FC<{ mentorId: string }> = ({ mentorId }) => {
  const batches = mentorRepo.getBatchesForMentor(mentorId);
  const courses = courseRepo.listCourses();

  return (
    <div>
      <PageHeader eyebrow="Students" title="My Batches" subtitle="Cohorts you mentor." />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {batches.map((b) => {
          const students = mentorRepo.getStudentsForMentor(mentorId).filter((s) => s.batchId === b.id);
          return (
            <Card key={b.id}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[15px] font-bold text-slate-900">{b.name}</h3>
                <StatusPill color={statusColor[b.status]}>{b.status}</StatusPill>
              </div>
              <p className="text-sm text-slate-500 mb-3">{courses.find((c) => c.id === b.courseId)?.title}</p>
              <SectionTitle className="mb-2">Schedule</SectionTitle>
              <p className="text-sm text-slate-600 mb-3">
                {b.scheduleDays.join(', ')} &middot; {b.scheduleTime}
              </p>
              <p className="text-sm text-slate-500">{students.length} students &middot; {b.startDate} → {b.endDate}</p>
              {b.primaryMentorId === mentorId && <StatusPill color="blue">Primary Mentor</StatusPill>}
            </Card>
          );
        })}
        {batches.length === 0 && <p className="text-sm text-slate-400">No batches assigned yet.</p>}
      </div>
    </div>
  );
};

export default MyBatchesPage;
