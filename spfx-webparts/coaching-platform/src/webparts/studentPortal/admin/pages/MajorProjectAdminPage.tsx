import * as React from 'react';
import { useState } from 'react';
import { PageHeader, Card, SectionTitle, SecondaryButton, LoadingState } from '../../ui/Primitives';
import { FormField, FormSection, TextInput, TextArea, Select, ConfirmDialog } from '../ui/AdminPrimitives';
import { PlusIcon, TrashIcon } from '../../ui/icons';
import { MilestoneDef } from '../../data/types';
import {
  useCourses,
  useCourseContent,
  useUpdateMajorProject,
  useAddMilestone,
  useUpdateMilestone,
  useDeleteMilestone,
  useReorderMilestone,
} from '../../hooks';

const MilestoneCard: React.FC<{
  courseId: string;
  milestone: MilestoneDef;
  index: number;
  total: number;
  onRequestDelete: (m: MilestoneDef) => void;
}> = ({ courseId, milestone, index, total, onRequestDelete }) => {
  const updateMilestoneMutation = useUpdateMilestone();
  const reorderMilestoneMutation = useReorderMilestone();

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-slate-400">Milestone {index + 1}</span>
        <div className="flex items-center gap-2">
          <button
            disabled={index === 0 || reorderMilestoneMutation.isLoading}
            onClick={() => reorderMilestoneMutation.mutate({ courseId, milestoneId: milestone.id, direction: 'up' })}
            className="text-slate-300 hover:text-slate-600 disabled:opacity-30"
          >
            ↑
          </button>
          <button
            disabled={index === total - 1 || reorderMilestoneMutation.isLoading}
            onClick={() => reorderMilestoneMutation.mutate({ courseId, milestoneId: milestone.id, direction: 'down' })}
            className="text-slate-300 hover:text-slate-600 disabled:opacity-30"
          >
            ↓
          </button>
          <button onClick={() => onRequestDelete(milestone)} className="text-slate-300 hover:text-red-500">
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      <FormField label="Title">
        <TextInput
          value={milestone.title}
          onChange={(e) => updateMilestoneMutation.mutate({ courseId, milestoneId: milestone.id, patch: { title: e.target.value } })}
        />
      </FormField>
      <div className="mt-3">
        <FormField label="Objectives" hint="One per line">
          <TextArea
            rows={2}
            value={milestone.objectives.join('\n')}
            onChange={(e) =>
              updateMilestoneMutation.mutate({
                courseId,
                milestoneId: milestone.id,
                patch: { objectives: e.target.value.split('\n').filter(Boolean) },
              })
            }
          />
        </FormField>
      </div>
      <div className="mt-3">
        <FormField label="Deliverables" hint="One per line">
          <TextArea
            rows={2}
            value={milestone.deliverables.join('\n')}
            onChange={(e) =>
              updateMilestoneMutation.mutate({
                courseId,
                milestoneId: milestone.id,
                patch: { deliverables: e.target.value.split('\n').filter(Boolean) },
              })
            }
          />
        </FormField>
      </div>
    </Card>
  );
};

const MajorProjectAdminPage: React.FC = () => {
  const { data: courses = [], isLoading: coursesLoading } = useCourses();
  const [selectedCourseId, setSelectedCourseId] = useState('');

  const courseId = selectedCourseId || courses[0]?.id || '';
  const { data: content, isLoading: contentLoading } = useCourseContent(courseId);

  const updateProjectMutation = useUpdateMajorProject();
  const addMilestoneMutation = useAddMilestone();
  const deleteMilestoneMutation = useDeleteMilestone();

  const [deleteTarget, setDeleteTarget] = useState<MilestoneDef | undefined>();

  const isLoading = coursesLoading || (!!courseId && contentLoading);

  if (isLoading) {
    return (
      <div>
        <PageHeader eyebrow="Content" title="Major Project" subtitle="The capstone project students build to graduate the course." />
        <LoadingState label="Loading major project..." />
      </div>
    );
  }

  if (!content) return null;
  const project = content.majorProject;

  return (
    <div>
      <PageHeader eyebrow="Content" title="Major Project" subtitle="The capstone project students build to graduate the course." />

      <div className="mb-5">
        <Select value={courseId} onChange={(e) => setSelectedCourseId(e.target.value)} className="max-w-[260px]">
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
            <TextInput
              value={project.title}
              onChange={(e) => updateProjectMutation.mutate({ courseId, patch: { title: e.target.value } })}
            />
          </FormField>
          <FormField label="Description">
            <TextArea
              rows={3}
              value={project.description}
              onChange={(e) => updateProjectMutation.mutate({ courseId, patch: { description: e.target.value } })}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Deadline (days from unlock)">
              <TextInput
                type="number"
                value={project.deadlineInDays}
                onChange={(e) => updateProjectMutation.mutate({ courseId, patch: { deadlineInDays: Number(e.target.value) } })}
              />
            </FormField>
            <FormField label="Which module unlocks it">
              <Select
                value={project.moduleId}
                onChange={(e) => updateProjectMutation.mutate({ courseId, patch: { moduleId: e.target.value } })}
              >
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
                    const copy = [...project.evaluationCriteriaTemplate];
                    copy[i] = { ...copy[i], label: e.target.value };
                    updateProjectMutation.mutate({ courseId, patch: { evaluationCriteriaTemplate: copy } });
                  }}
                  className="flex-1 text-sm py-1.5"
                />
                <TextInput
                  type="number"
                  value={c.maxScore}
                  onChange={(e) => {
                    const copy = [...project.evaluationCriteriaTemplate];
                    copy[i] = { ...copy[i], maxScore: Number(e.target.value) };
                    updateProjectMutation.mutate({ courseId, patch: { evaluationCriteriaTemplate: copy } });
                  }}
                  className="w-20 text-sm py-1.5 text-right"
                />
              </div>
            ))}
          </div>
        </FormSection>
      </Card>

      <div className="max-w-2xl mb-4 flex items-center justify-between">
        <SectionTitle className="mb-0">Milestones ({project.milestones.length})</SectionTitle>
        <SecondaryButton
          className="text-xs px-3 py-1.5"
          disabled={addMilestoneMutation.isLoading}
          onClick={() =>
            addMilestoneMutation.mutate({
              courseId,
              milestone: {
                title: `Milestone ${project.milestones.length + 1}`,
                objectives: [],
                deliverables: [],
              },
            })
          }
        >
          <PlusIcon className="w-3.5 h-3.5" /> Add Milestone
        </SecondaryButton>
      </div>

      <div className="max-w-2xl space-y-4">
        {project.milestones.map((m, i) => (
          <MilestoneCard
            key={m.id}
            courseId={courseId}
            milestone={m}
            index={i}
            total={project.milestones.length}
            onRequestDelete={setDeleteTarget}
          />
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete "${deleteTarget?.title}"?`}
        confirmLabel="Delete"
        danger
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteMilestoneMutation.mutateAsync({ courseId, milestoneId: deleteTarget.id });
          }
          setDeleteTarget(undefined);
        }}
        onCancel={() => setDeleteTarget(undefined)}
      />
    </div>
  );
};

export default MajorProjectAdminPage;
