# Coaching Center Platform — Architecture

## Current Prototype Status

Everything below section A was written as a pre-implementation proposal (see
its closing line). What actually exists today, as an SPFx webpart under
`src/webparts/studentPortal`:

- **Frontend prototype is complete** for the workflows this document
  describes as MVP/Phase 2: Student/Admin/Mentor portals, course/journey
  authoring, Mini Task and Major Project submission-and-resubmission (with
  full attempt history), Daily Coding, Assessments, Certificates, and a
  multi-course (MERN + Python Backend) content model.
- **The "Local/mock repository" IS the architecture right now, intentionally**
  — not a stub. `admin/repository/store.ts` holds one in-memory `state`
  object (persisted to `localStorage`), and every domain repository
  (`courseRepository`, `progressRepository`, `submissionRepository`,
  `projectSubmissionRepository`, `rosterRepository`, `mentorRepository`,
  `githubRepository`, `questionBankRepository`, ...) reads/writes it. No
  other file touches `localStorage` directly, which is what keeps this layer
  swappable.
- **Backend is NOT implemented.** Section K.0's SharePoint Lists + Graph API
  design, section L's REST API, and section M's `backend/`/`frontend/`
  folder split are still the plan, not the codebase — everything currently
  lives client-side under `src/webparts/studentPortal`, with no server.
  SharePoint/Graph will replace the repository layer's *implementation*
  later; the Engine/Presentation layers (section A) and the repository
  function signatures they call are designed not to need to change when
  that happens.
- **Authentication/RBAC is currently demo/local** — no Entra ID, no real
  login; the "logged-in student" is a single demo `StudentRecord` the portal
  points `AppStateProvider` at, and Admin/Mentor portals are reached by an
  in-app mode switch, not a real role check.
- **GitHub integration is currently mock/local** (`admin/repository/githubRepository.ts`)
  — connect/repository/commit/PR data is simulated in the same local store,
  never a real GitHub API call. Mini Task and Major Project submissions
  capture repository/branch/commit SHA/PR as manually-supplied evidence, not
  verified against a real repository.
- **No production security claims are being made anywhere in this build.**
- The current purpose of this codebase is **functional UX/workflow
  validation** — proving the student/admin/mentor journeys work end to end
  on realistic data — ahead of the backend build this document plans for.

## A. Product Architecture

Three layers, cleanly separated:

- **Content layer (data, admin-authored)**: Courses, Modules, Topics, Assessments, Questions, Tasks, Projects — all created via Admin UI, stored as rows, never as code.
- **Engine layer (generic, code)**: Enrollment, Journey progression, Locking rules, Submission/Evaluation workflow, Progress calculation, Certificate issuance. This code has zero knowledge of "MERN" or "SPFx" — it only knows "JourneyItem", "Assessment", "Task".
- **Presentation layer (generic UI, data-driven)**: A small set of reusable screen templates (Journey view, Module view, Task submission form, Evaluation panel, Dashboard) that render whatever content the engine hands them.

Adding Python = inserting rows (Course → Modules → JourneyItems → Tasks → Questions). Zero new frontend components, zero new backend routes.

This is a **metadata-driven / headless-content** architecture — same pattern as Shopify (products), Notion (blocks), or an LMS like Teachable: one engine, N content trees.

## B. User Roles & Permissions

| Capability | Admin | Instructor | Student |
|---|---|---|---|
| Manage courses/journeys/content | ✅ | ❌ | ❌ |
| Manage batches, enroll students | ✅ | ❌ | ❌ |
| View all students | ✅ | Only assigned batch(es) | ❌ |
| Evaluate submissions/projects | ✅ | ✅ (assigned students only) | ❌ |
| View own progress/content | — | — | ✅ |
| Attempt assessments/tasks/coding | ❌ | ❌ | ✅ |
| Reports (global) | ✅ | Scoped to own batches | ❌ |

Design as **RBAC + scope**: `role` (admin/instructor/student) + `scope` (batch IDs the user can act on). Adding "TA" or "Content Reviewer" later = new role row + permission set, no code change (permission checks are `hasPermission(user, action, resource)`, table-driven).

## C. Core Data Model (entity relationships)

```
Course 1─* Module 1─* Topic
Course 1─* JourneyDefinition 1─* JourneyItem (ordered, refs Topic|Assessment|MiniTask|Project)
Course 1─* Batch *─* Student   (via Enrollment)
Enrollment 1─* Progress (one row per JourneyItem per student)

Question ─* (tagged) Topic, Difficulty, Tags
DailySchedule 1─* ScheduleEntry (day N → [QuestionId...]), assignable to Course|Batch|Student
Submission (polymorphic: type=coding|miniTask|project) *─1 Student, *─1 JourneyItem
Evaluation 1─1 Submission

MajorProject 1─* Milestone
Certificate *─1 Enrollment (issued when Course complete)
```

Key generic pattern: **JourneyItem is polymorphic** — `itemType: 'topic' | 'assessment' | 'miniTask' | 'project'` + `refId`. The journey engine just walks an ordered list of JourneyItems and asks "is this complete?" — delegating the actual completion check to whatever type it is.

## D. How MERN and SPFx Share One System

Both are just **rows**, not code paths:

```
Course("MERN")   → JourneyDefinition → [Topic:HTML, Topic:CSS, ..., Assessment:JS, MiniTask:Portfolio, ...]
Course("SPFx")   → JourneyDefinition → [Topic:SP Fundamentals, ..., MiniTask:Build Web Part, ...]
```

The engine's only contract: a JourneyItem has `order`, `prerequisites[]`, `status`, `isMandatory`, `estimatedDuration`. Nothing about content is hardcoded. Difficulty progression for Daily Coding is also just data (`QuestionBank.difficulty` + `DailySchedule` ordering) — applies identically whether the student is in MERN or SPFx (coding practice is course-agnostic, tagged separately from the course journey).

## E. Student Lifecycle

Enroll (Admin assigns Batch) → Journey unlocked at item 1 → Learn Topic → (if attached) take Assessment → (if attached) submit Mini Task → Evaluation → Pass unlocks next item / Fail or "Changes Requested" reopens same item → repeat through all items → Major Project → Project Evaluation → Course marked complete → Certificate auto-generated.

## F. Admin Workflow

Create Course → open Course Builder → add Modules/Topics → attach Assessments (pick from Question Bank or author new) → attach Mini Tasks → set ordering/prerequisites/mandatory flags → publish JourneyDefinition → create Batch → assign Course + Instructor + schedule → enroll Students → (ongoing) review Evaluation Queue, watch Reports/Dashboard for stragglers.

## G. Daily Coding Architecture

`QuestionBank` (reusable, tagged by topic/difficulty/language) → `DailySchedule` (Day N → question IDs, assignable at Course/Batch/Student level, independent of journey position) → Student attempts → `Submission(type=coding)` → auto-evaluation (test cases run) sets Passed/Failed + score → `Progress` aggregates streak/success-rate/attempts. Runs in parallel to the main journey, never blocks it.

## H. Mini Task Architecture

`MiniTask` (definition, reusable per course) → Student `Submission` (GitHub URL/Live URL/files) → Instructor `Evaluation` (criteria are a **JSON array of `{label, maxScore}` set per task**, so MERN's "Responsive Design" and SPFx's "Graph API Usage" both fit the same Evaluation model) → status (`Submitted→UnderReview→Passed/Failed/ChangesRequested→Completed`) → if ChangesRequested, student resubmits (new Submission version, same task) → Passed unlocks next JourneyItem.

## I. Major Project Architecture

`MajorProject` (requirements, criteria, deadline) → `Milestone[]` (optional checkpoints) → `Submission` (repo/live/docs) → `Evaluation` (same configurable-criteria model as Mini Tasks) → Passed → Course completion triggers Certificate.

## J. Pages/Screens

**Student**: Login, Dashboard, My Courses, Journey View, Topic/Learning View, Assessment Attempt, Assessment Result, Daily Challenge, Coding Submission History, Mini Task List, Mini Task Detail/Submit, Mini Task Evaluation View, Major Project Detail/Submit, Project Evaluation View, Achievements, Certificates, Profile.

**Admin/Instructor**: Login, Admin Dashboard, Students List/Detail, Courses List, Course Builder, Question Bank, Daily Schedule Builder, Batches List/Detail, Enrollment, Assessment Builder, Mini Task Builder, Major Project Builder, Evaluation Queue (submissions + projects), Reports (student/course/batch/coding), Certificate Management, Role/User Management.

## K.0 Backend Store: SharePoint (Lists + Document Libraries)

Decision: **SharePoint Online is the persistence layer.** Each entity below maps to a SharePoint List; relationships use Lookup columns; file-bearing entities (Submissions, Certificates) use a Document Library instead of a list attachment. Access is via **Microsoft Graph API** from a thin Node/Azure Functions API layer — SharePoint is never called directly from the frontend.

Why this still fits the architecture: the Engine layer (section A) talks to a `Repository` interface (`getCourse`, `saveSubmission`, `updateProgress`...). Today that interface is implemented with Graph API calls against Lists; nothing above it changes if you ever swap the implementation to Postgres. This keeps the "not built specifically around one backend" principle intact — same principle you're applying to MERN vs SPFx, just one layer down.

**What you get for free**: no S3/storage abstraction needed — Document Libraries + Graph `/drive/items` already are the file store; versioning is built in (useful for mini-task resubmissions); Entra ID (Azure AD) gives you auth for free if the coaching center is on M365.

**What you must design around** (real constraints, not hypothetical — mitigate up front):
- **5000-item list view threshold**: fine for CRUD by ID/Graph filter, but any *unindexed filtered query* (e.g. "all submissions pending review") breaks past 5000 rows. Mitigation: add indexed columns on every List for the fields you'll filter by (`studentId`, `status`, `courseId`) at creation time — not later.
- **No transactions / weak relational integrity**: "mark evaluation complete AND unlock next journey item" is two writes, not one. Mitigation: the Engine layer does this, not Power Automate — a single API call does both writes with a retry/compensation step if the second fails.
- **Aggregation is slow** (progress %, streaks, reports): Graph API isn't SQL — no server-side GROUP BY/JOIN. Mitigation: maintain a denormalized `progress` List that the Engine layer updates on every write (already in the schema below), so dashboards read pre-computed rows instead of aggregating on the fly.
- **Business logic does NOT live in Power Automate.** Use Power Automate only for simple notifications (e.g. "email instructor on new submission"); all locking/scoring/progress logic lives in your API layer, same as any other backend — this avoids the classic SharePoint-project trap of business rules scattered across untestable flows.
- Requires an M365 tenant with SharePoint + an App Registration (Graph API permissions) — you'll have this already for the SPFx course anyway.

## K. Database Schema (as SharePoint Lists; column list per entity — same shape works relationally if you ever migrate)

- `users(id, name, email, passwordHash, role)`
- `courses(id, title, description, isActive)`
- `journey_definitions(id, courseId)`
- `journey_items(id, journeyDefId, itemType, refId, order, prerequisites[], isMandatory, estimatedDuration, isActive)`
- `modules(id, courseId, title, order)`, `topics(id, moduleId, title, content, order)`
- `batches(id, courseId, instructorId, name, startDate, endDate, schedule, status)`
- `enrollments(id, studentId, batchId, enrolledAt, status)`
- `questions(id, title, statement, difficulty, topicTags[], language, testCases[], solution, complexity)`
- `daily_schedules(id, scope{course|batch|student}, scopeId)`, `schedule_entries(scheduleId, day, questionIds[])`
- `assessments(id, courseId, questions[], totalMarks, passingMarks, timeLimit, attemptsAllowed, randomize)`
- `assessment_attempts(id, studentId, assessmentId, answers, score, attemptNo)`
- `mini_tasks(id, courseId, title, requirements, evaluationCriteria[{label,maxScore}], deadline)`
- `major_projects(id, courseId, requirements, milestones[], evaluationCriteria[])`
- `submissions(id, studentId, refType{coding|miniTask|project}, refId, files[], githubUrl, liveUrl, version, status, submittedAt)`
- `evaluations(id, submissionId, evaluatorId, scores[{criterion,score}], totalScore, feedback, status)`
- `progress(id, studentId, journeyItemId, status{locked|current|completed|failed|pendingEvaluation|resubmissionRequired})`
- `certificates(id, enrollmentId, issuedAt, fileUrl)`

Files referenced by URL/key only (`fileUrl`), actual bytes live in the Document Library (Graph `driveItem` id + webUrl), not in the list item itself.

## L. API Architecture (major groups, REST-style — your API, backed by Graph API calls to SharePoint, never exposed directly to frontend)

- `POST /auth/login`, `/auth/me`
- `/admin/courses`, `/admin/courses/:id/journey` (builder CRUD + reorder)
- `/admin/questions` (bank CRUD), `/admin/daily-schedules`
- `/admin/batches`, `/admin/enrollments`
- `/admin/assessments`, `/admin/mini-tasks`, `/admin/projects`
- `/admin/evaluations` (queue, submit evaluation)
- `/admin/reports/*`
- `/student/journey`, `/student/progress`
- `/student/assessments/:id/attempt`
- `/student/daily-challenge`, `/student/submissions`
- `/student/mini-tasks/:id/submit`, `/student/projects/:id/submit`
- `/student/certificates`, `/student/profile`

All scoped by role/JWT; instructor endpoints filtered by assigned batches server-side.

## M. Folder Structure

```
backend/
  src/
    modules/
      course/  journey/  batch/  enrollment/
      question-bank/  daily-coding/
      assessment/  mini-task/  project/
      submission/  evaluation/  progress/  certificate/
      auth/  user/
    common/
      rbac/
      sharepoint/ (Graph client, one repository class per List, list-schema constants)
    server.ts
frontend/
  src/
    portals/
      student/ (pages: Dashboard, Journey, Task, Assessment, Profile...)
      admin/   (pages: CourseBuilder, Batches, EvaluationQueue, Reports...)
    components/ (shared: JourneyMap, ProgressBar, EvaluationForm, DataTable)
    api/ (typed client per module)
    store/ (only where needed — auth, current user)
```

Backend organized by **domain module**, not by MVC layer — each module owns its routes/service/model, so "add Python" never touches this tree at all (it's pure data).

## N. MVP vs Phase 2 vs Future

**MVP**: Course/Journey builder (no drag-and-drop, simple up/down reorder), Module/Topic content, Batch+Enrollment, single manual Mini Task evaluation flow, Question Bank + Daily Schedule + auto-graded coding, basic Assessments (MCQ/TF), Progress % (simple average, weighted-ready), Student Dashboard + Journey view, Admin Dashboard basics, Certificate PDF on completion, file uploads via storage abstraction (local disk adapter first, S3 later).

**Phase 2**: drag-and-drop journey builder, reporting suite, gamification (streaks/badges), bulk admin operations. (Major Project + Milestones and resubmission workflows, both originally scoped here, are already built in the current prototype — see "Current Prototype Status" above.)

**Future**: Multiple instructors per batch, weighted progress config, adaptive daily-coding difficulty, plagiarism checks, SSO/OAuth, mobile app, analytics on "hardest questions."

## O. UI/UX Direction

- **Student portal**: journey rendered as a vertical/horizontal timeline (not a table) — green check / pulsing "current" dot / lock icon / red X / amber "needs resubmission" — this is the emotional core of the product, gets the most design polish.
- **Admin portal**: dense data tables + filters + an evaluation queue (inbox-style, click submission → scoring rubric on the right) — optimize for instructor throughput, not looks.
- Shared design tokens (Tailwind) but two distinct layout shells so student never feels like it's looking at an internal tool.

---

## Answering your specific technical concerns

- **Backend store = SharePoint** (see K.0): Lists for entities, Document Libraries for files, Graph API as the only access path, business logic kept out of Power Automate and inside your API layer. This is a valid choice given the domain (mostly read-heavy CRUD, not high-write-throughput transactional workloads) as long as the indexed-column and denormalized-progress mitigations above are in place from day one, not retrofitted.
- **File storage**: solved by Document Libraries directly — no separate storage abstraction needed, Graph API already gives you upload/versioning/URL.

---

**Next step**: confirm this architecture (or flag changes), then I'll scaffold the actual repo (backend + frontend skeletons, DB schema/migrations) inside this folder — no course-specific code, per the principle above.
