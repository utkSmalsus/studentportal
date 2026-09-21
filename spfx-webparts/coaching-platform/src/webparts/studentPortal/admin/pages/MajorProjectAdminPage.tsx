import * as React from 'react';
import { useState } from 'react';
import { PageHeader, Card, SectionTitle, SecondaryButton } from '../../ui/Primitives';
import { FormField, FormSection, TextInput, TextArea, Select } from '../ui/AdminPrimitives';
import { PlusIcon, TrashIcon } from '../../ui/icons';
import * as courseRepo from '../repository/courseRepository';
import * as contentRepo from '../repository/contentRepository';
import { MilestoneDef } from '../../data/types';

const MilestoneCard: React.FC<{ courseId: string; milestone: MilestoneDef; index: number; total: number }> = ({ courseId, milestone, index, total }) => (
  <Card>
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs font-bold text-slate-400">Milestone {index + 1}</span>
      <div className="flex items-center gap-2">
        <button disabled={index === 0} onClick={() => contentRepo.reorderMilestone(courseId, milestone.id, 'up')} className="text-slate-300 hover:text-slate-600 disabled:opacity-30">
          ↑
        </button>
        <button disabled={index === total - 1} onClick={() => contentRepo.reorderMilestone(courseId, milestone.id, 'down')} className="text-slate-300 hover:text-slate-600 disabled:opacity-30">
          ↓
        </button>
        <button onClick={() => contentRepo.deleteMilestone(courseId, milestone.id)} className="text-slate-300 hover:text-red-500">
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
    <FormField label="Title">
      <TextInput value={milestone.title} onChange={(e) => contentRepo.updateMilestone(courseId, milestone.id, { title: e.target.value })} />
    </FormField>
    <div className="mt-3">
      <FormField label="Objectives" hint="One per line">
        <TextArea rows={2} value={milestone.objectives.join('\n')} onChange={(e) => contentRepo.updateMilestone(courseId, milestone.id, { objectives: e.target.value.split('\n').filter(Boolean) })} />
      </FormField>
    </div>
    <div className="mt-3">
      <FormField label="Deliverables" hint="One per line">
        <TextArea rows={2} value={milestone.deliverables.join('\n')} onChange={(e) => contentRepo.updateMilestone(courseId, milestone.id, { deliverables: e.target.value.split('\n').filter(Boolean) })} />
      </FormField>
    </div>
  </Card>
);

const MajorProjectAdminPage: React.FC = () => {
  const courses = courseRepo.listCourses();
  const [courseId, setCourseId] = useState(courses[0]?.id || '');
  const content = courseRepo.getCourseContent(courseId);

  if (!content) return null;
  const project = content.majorProject;

  return (
    <div>
      <PageHeader eyebrow="Content" title="Major Project" subtitle="The capstone project students build to graduate the course." />

      <div className="mb-5">
        <Select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="max-w-[260px]">
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </Select>
      </div>

      <Card className="max-w-2xl mb-6">
        <FormSection title="Project">
          <FormField label="Project Name">
            <TextInput value={project.title} onChange={(e) => contentRepo.updateMajorProject(courseId, { title: e.target.value })} />
          </FormField>
          <FormField label="Description">
            <TextArea rows={3} value={project.description} onChange={(e) => contentRepo.updateMajorProject(courseId, { description: e.target.value })} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Deadline (days from unlock)">
              <TextInput type="number" value={project.deadlineInDays} onChange={(e) => contentRepo.updateMajorProject(courseId, { deadlineInDays: Number(e.target.value) })} />
            </FormField>
            <FormField label="Which module unlocks it">
              <Select value={project.moduleId} onChange={(e) => contentRepo.updateMajorProject(courseId, { moduleId: e.target.value })}>
                <option value="">—</option>
                {content.moduleDefs.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>
        </FormSection>

        <FormSection title="Evaluation Criteria">
          <div className="space-y-2">
            {project.evaluationCriteriaTemplate.map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <TextInput
                  value={c.label}
                  onChange={(e) => {
                    const list = [...project.evaluationCriteriaTemplate];
                    list[i] = { ...list[i], label: e.target.value };
                    contentRepo.updateMajorProject(courseId, { evaluationCriteriaTemplate: list });
                  }}
                />
                <TextInput
                  type="number"
                  className="max-w-[100px]"
                  value={c.maxScore}
                  onChange={(e) => {
                    const list = [...project.evaluationCriteriaTemplate];
                    list[i] = { ...list[i], maxScore: Number(e.target.value) };
                    contentRepo.updateMajorProject(courseId, { evaluationCriteriaTemplate: list });
                  }}
                />
                <button
                  onClick={() => contentRepo.updateMajorProject(courseId, { evaluationCriteriaTemplate: project.evaluationCriteriaTemplate.filter((_, ii) => ii !== i) })}
                  className="text-slate-300 hover:text-red-500 shrink-0"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
            <SecondaryButton
              className="text-xs px-3 py-1.5"
              onClick={() => contentRepo.updateMajorProject(courseId, { evaluationCriteriaTemplate: [...project.evaluationCriteriaTemplate, { label: '', maxScore: 10 }] })}
            >
              <PlusIcon className="w-3.5 h-3.5" /> Add Criterion
            </SecondaryButton>
          </div>
        </FormSection>
      </Card>

      <SectionTitle
        action={
          <SecondaryButton className="text-xs px-3 py-1.5" onClick={() => contentRepo.addMilestone(courseId, { title: 'New Milestone', objectives: [], deliverables: [] })}>
            <PlusIcon className="w-3.5 h-3.5" /> Add Milestone
          </SecondaryButton>
        }
      >
        Milestones
      </SectionTitle>
      <div className="space-y-3 max-w-2xl">
        {project.milestones.map((m, i) => (
          <MilestoneCard key={m.id} courseId={courseId} milestone={m} index={i} total={project.milestones.length} />
        ))}
      </div>
    </div>
  );
};

export default MajorProjectAdminPage;
