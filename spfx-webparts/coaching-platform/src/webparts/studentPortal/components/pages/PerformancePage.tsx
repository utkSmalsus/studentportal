import * as React from 'react';
import { Route } from '../../navigation/types';
import { PageHeader, Card, SectionTitle, StatusPill, PrimaryButton, ProgressBar } from '../../ui/Primitives';
import { SemanticColor } from '../../ui/statusMeta';
import { CheckIcon, AlertIcon } from '../../ui/icons';
import { useAppState } from '../../state/AppStateContext';
import * as progression from '../../state/engine/progression';
import { moduleDefs, skillRatings, codingStats, miniTaskStats, assessmentStats, recommendedFocus, majorProject, getModuleById, codingQuestions } from '../../data/selectors';

const skillColor: Record<string, SemanticColor> = { Strong: 'green', Developing: 'blue', 'Not Started': 'gray' };

const CategoryBar: React.FC<{ label: string; percent: number }> = ({ label, percent }) => (
  <div>
    <div className="flex justify-between text-sm mb-1.5">
      <span className="font-medium text-slate-700">{label}</span>
      <span className="font-semibold text-slate-900">{percent}%</span>
    </div>
    <ProgressBar percent={percent} heightClass="h-2" />
  </div>
);

const StatRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between">
    <span className="text-slate-500">{label}</span>
    <span className="font-semibold text-slate-900">{value}</span>
  </div>
);

const PerformancePage: React.FC<{ onNavigate: (r: Route) => void }> = ({ onNavigate }) => {
  const { state: progress } = useAppState();
  const skills = skillRatings(progress);
  const coding = codingStats(progress);
  const tasks = miniTaskStats(progress);
  const assess = assessmentStats(progress);
  const focus = recommendedFocus(progress);

  const totalLessons = moduleDefs.reduce((s, m) => s + m.topics.length, 0);
  const doneLessons = moduleDefs.reduce((s, m) => s + m.topics.filter((t) => progression.isTopicTestPassed(t.id, progress)).length, 0);
  const totalPractice = moduleDefs.reduce((s, m) => s + m.practice.length, 0);
  const donePractice = moduleDefs.reduce((s, m) => s + m.practice.filter((p) => progression.isPracticeComplete(p.id, progress)).length, 0);
  const projectModule = getModuleById(majorProject.moduleId);
  const projectUnlocked = projectModule ? progression.isModuleUnlocked(projectModule, moduleDefs, progress) : false;
  const projectDone = majorProject.milestones.filter((m) => progress.project.milestoneStatus[m.id] === 'completed').length;

  const categories = [
    { label: 'Learning', percent: totalLessons ? Math.round((doneLessons / totalLessons) * 100) : 0 },
    { label: 'Practice', percent: totalPractice ? Math.round((donePractice / totalPractice) * 100) : 0 },
    { label: 'Daily Coding', percent: codingQuestions.length ? Math.round((coding.solved / codingQuestions.length) * 100) : 0 },
    { label: 'Mini Tasks', percent: tasks.total ? Math.round((tasks.completed / tasks.total) * 100) : 0 },
    { label: 'Assessments', percent: assess.total ? Math.round((assess.completed / assess.total) * 100) : 0 },
    { label: 'Major Project', percent: projectUnlocked && majorProject.milestones.length ? Math.round((projectDone / majorProject.milestones.length) * 100) : 0 },
  ];

  const strengths = skills.filter((s) => s.level === 'Strong');
  const weakTopics = new Set<string>();
  Object.keys(progress.assessments).forEach((id) => {
    const entry = progress.assessments[id];
    const last = entry.attempts[entry.attempts.length - 1];
    last?.weakTopics.forEach((t) => weakTopics.add(t));
  });

  return (
    <div>
      <PageHeader eyebrow="Progress" title="Performance" subtitle="A snapshot of how you're actually doing — not a wall of numbers." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <SectionTitle>Course Progress</SectionTitle>
            <div className="space-y-4">
              {categories.map((c) => (
                <CategoryBar key={c.label} label={c.label} percent={c.percent} />
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card>
              <SectionTitle>Your Strengths</SectionTitle>
              {strengths.length === 0 ? (
                <p className="text-sm text-slate-400">Keep going — strengths will show up here as modules complete.</p>
              ) : (
                <ul className="space-y-2">
                  {strengths.map((s) => (
                    <li key={s.label} className="flex items-center gap-2 text-sm text-slate-700">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <CheckIcon className="w-3 h-3" />
                      </span>
                      {s.label}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
            <Card>
              <SectionTitle>Weak Areas</SectionTitle>
              {weakTopics.size === 0 ? (
                <p className="text-sm text-slate-400">No weak areas flagged yet.</p>
              ) : (
                <ul className="space-y-2">
                  {Array.from(weakTopics).map((t) => (
                    <li key={t} className="flex items-center gap-2 text-sm text-slate-700">
                      <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                        <AlertIcon className="w-3 h-3" />
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          {focus && (
            <Card className="!border-indigo-200 !bg-indigo-50/40">
              <SectionTitle>Recommended Next Step</SectionTitle>
              <p className="text-sm text-slate-700">
                Your <span className="font-semibold">{focus.assessmentTitle}</span> result shows weakness in{' '}
                <span className="font-semibold">{focus.topic}</span>.
              </p>
              {focus.suggestedQuestions.length > 0 ? (
                <>
                  <p className="text-sm text-slate-500 mt-1">
                    Practice {focus.suggestedQuestions.length} {focus.topic.toLowerCase()} coding challenge
                    {focus.suggestedQuestions.length > 1 ? 's' : ''} before retaking the assessment.
                  </p>
                  <PrimaryButton className="mt-3.5" onClick={() => onNavigate({ view: 'challengeDetail', questionId: focus.suggestedQuestions[0].id })}>
                    Practice {focus.topic}
                  </PrimaryButton>
                </>
              ) : (
                <p className="text-sm text-slate-500 mt-1">Review the {focus.topic.toLowerCase()} material before retaking the assessment.</p>
              )}
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <SectionTitle>Skills</SectionTitle>
            <ul className="space-y-2.5">
              {skills.map((s) => (
                <li key={s.label} className="flex items-center justify-between text-sm">
                  <span className="text-slate-800">{s.label}</span>
                  <StatusPill color={skillColor[s.level]}>{s.level}</StatusPill>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <SectionTitle>Coding</SectionTitle>
            <div className="grid grid-cols-1 gap-3 text-sm">
              <StatRow label="Problems Solved" value={String(coding.solved)} />
              <StatRow label="Success Rate" value={`${coding.successRate}%`} />
              <StatRow label="Current Streak" value={`${progress.codingStreak.current} days`} />
            </div>
          </Card>

          <Card>
            <SectionTitle>Practical Work</SectionTitle>
            <div className="text-sm space-y-1.5">
              <div>
                <span className="font-semibold text-slate-900">{tasks.completed}</span> <span className="text-slate-500">mini tasks completed</span>
              </div>
              {tasks.underReview > 0 && <div className="text-slate-500">{tasks.underReview} under review</div>}
              {tasks.changesRequested > 0 && <div className="text-amber-600">{tasks.changesRequested} needs changes</div>}
              <div className="pt-2 mt-2 border-t border-slate-100">
                <span className="font-semibold text-slate-900">{assess.averagePercent}%</span>{' '}
                <span className="text-slate-500">assessment average</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PerformancePage;
