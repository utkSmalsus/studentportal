// GitHub integration, behind a service abstraction — no component talks to
// GitHub (real or mock) directly. This file IS the "mock GitHub provider";
// swapping it for a real GitHub OAuth/API-backed implementation later means
// replacing the bodies below only. The function surface below is the
// IGitHubRepository interface described in the spec — TypeScript structural
// typing means we don't need a separate `interface IGitHubRepository { ... }`
// declaration for a single implementation, but every exported function here
// is the contract a future real provider must also satisfy.
//
// Security: never store an OAuth token here or anywhere in this frontend.
// connectAccount() below takes just a username (simulating the callback of an
// OAuth flow whose token would live server-side) — see admin/types.ts's
// GitHubConnection, which deliberately has no token field.
import { state, commit } from './store';
import { GitHubConnection, GitHubRepositoryLink, GitHubActivityItem, GitHubActivityAction, GitHubRepositorySnapshot, GitHubCommit, GitHubPullRequest } from '../types';

export function getConnection(studentId: string): GitHubConnection | undefined {
  return state.githubConnections.find((c) => c.studentId === studentId && c.status === 'connected');
}

// Simulates the OAuth callback: in production this is where a backend would
// exchange a code for a token server-side and hand back only the profile.
export function connectAccount(studentId: string, username: string): GitHubConnection {
  const existing = state.githubConnections.find((c) => c.studentId === studentId);
  const connection: GitHubConnection = {
    id: existing?.id || `ghc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    studentId,
    githubUserId: existing?.githubUserId || `gh-${Math.floor(Math.random() * 100000)}`,
    username,
    displayName: username,
    avatarUrl: `https://avatars.githubusercontent.com/u/${Math.floor(Math.random() * 100000)}?v=4`,
    connectedAt: new Date().toISOString(),
    status: 'connected',
  };
  if (existing) Object.assign(existing, connection);
  else state.githubConnections.push(connection);
  commit();
  return connection;
}

export function disconnectAccount(studentId: string): void {
  const existing = state.githubConnections.find((c) => c.studentId === studentId);
  if (!existing) return;
  existing.status = 'disconnected';
  commit();
}

export function listRepositories(studentId: string): { id: string; name: string; owner: string }[] {
  const connection = getConnection(studentId);
  if (!connection) return [];
  return Object.keys(state.githubRepoSnapshots)
    .filter((full) => full.split('/')[0] === connection.username)
    .map((full) => ({ id: full, name: full.split('/')[1], owner: connection.username }));
}

function seedSnapshot(owner: string, name: string): GitHubRepositorySnapshot {
  const full = `${owner}/${name}`;
  const now = new Date().toISOString();
  const snapshot: GitHubRepositorySnapshot = {
    owner, name, defaultBranch: 'main', branches: ['main'],
    commits: [{ sha: Math.random().toString(16).slice(2, 9), message: 'Initial commit', branch: 'main', author: owner, date: now, url: `https://github.com/${full}/commits/main` }],
    pullRequests: [],
  };
  state.githubRepoSnapshots[full] = snapshot;
  return snapshot;
}

export function createRepository(studentId: string, courseId: string, name: string): GitHubRepositoryLink | undefined {
  const connection = getConnection(studentId);
  if (!connection) return undefined;
  const owner = connection.username;
  const snapshot = seedSnapshot(owner, name);
  const link: GitHubRepositoryLink = {
    id: `ghl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    studentId,
    courseId,
    repositoryId: `${owner}/${name}`,
    repositoryName: `${owner}/${name}`,
    owner,
    defaultBranch: snapshot.defaultBranch,
    connectedAt: new Date().toISOString(),
  };
  state.githubRepositoryLinks = state.githubRepositoryLinks.filter((l) => !(l.studentId === studentId && l.courseId === courseId));
  state.githubRepositoryLinks.push(link);
  commit();
  return link;
}

// A student can connect an existing repository name instead of creating a new one.
export function linkExistingRepository(studentId: string, courseId: string, repositoryName: string): GitHubRepositoryLink | undefined {
  const connection = getConnection(studentId);
  if (!connection) return undefined;
  const [owner, name] = repositoryName.split('/');
  if (!state.githubRepoSnapshots[repositoryName]) seedSnapshot(owner, name);
  const link: GitHubRepositoryLink = {
    id: `ghl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    studentId,
    courseId,
    repositoryId: repositoryName,
    repositoryName,
    owner,
    defaultBranch: state.githubRepoSnapshots[repositoryName].defaultBranch,
    connectedAt: new Date().toISOString(),
  };
  state.githubRepositoryLinks = state.githubRepositoryLinks.filter((l) => !(l.studentId === studentId && l.courseId === courseId));
  state.githubRepositoryLinks.push(link);
  commit();
  return link;
}

export function getRepositoryLink(studentId: string, courseId: string): GitHubRepositoryLink | undefined {
  return state.githubRepositoryLinks.find((l) => l.studentId === studentId && l.courseId === courseId);
}

export function getRepository(owner: string, name: string): GitHubRepositorySnapshot | undefined {
  return state.githubRepoSnapshots[`${owner}/${name}`];
}

export function getBranches(owner: string, name: string): string[] {
  return getRepository(owner, name)?.branches || [];
}

export function getCommits(owner: string, name: string, branch?: string): GitHubCommit[] {
  const commits = getRepository(owner, name)?.commits || [];
  return branch ? commits.filter((c) => c.branch === branch) : commits;
}

export function getPullRequests(owner: string, name: string): GitHubPullRequest[] {
  return getRepository(owner, name)?.pullRequests || [];
}

export function getRepositoryContents(): string[] {
  // ponytail: the mock provider doesn't simulate a file tree — GitHub remains
  // the actual source of truth for file contents; add when a real API backs this.
  return [];
}

// ---- Activity: evidence, not completion (see spec section 37). ----

export function recordActivity(studentId: string, courseId: string, repositoryName: string, action: GitHubActivityAction, extra?: { branch?: string; message?: string; sha?: string; prNumber?: number }): GitHubActivityItem {
  const item: GitHubActivityItem = {
    id: `gha-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    studentId,
    courseId,
    repositoryName,
    action,
    createdAt: new Date().toISOString(),
    ...extra,
  };
  state.githubActivities.unshift(item);
  commit();
  return item;
}

export function listActivityForStudent(studentId: string): GitHubActivityItem[] {
  return state.githubActivities.filter((a) => a.studentId === studentId);
}

export function listRecentActivity(studentIds: string[], limit = 10): GitHubActivityItem[] {
  return state.githubActivities.filter((a) => studentIds.indexOf(a.studentId) !== -1).slice(0, limit);
}
