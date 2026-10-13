import { useQuery, useMutation, useQueryClient } from 'react-query';
import * as ghRepo from '../admin/repository/githubRepository';
import {
  GitHubConnection,
  GitHubRepositoryLink,
  GitHubActivityItem,
  GitHubActivityAction,
  GitHubRepositorySnapshot,
  GitHubCommit,
  GitHubPullRequest,
} from '../admin/types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ---- Connection ----

export function useGitHubConnection(studentId: string) {
  return useQuery(
    ['ghConnection', studentId],
    async () => {
      await delay(300);
      return ghRepo.getConnection(studentId);
    },
    { enabled: !!studentId }
  );
}

export function useConnectGitHubAccount() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ studentId, username }: { studentId: string; username: string }) => {
      await delay(600);
      return ghRepo.connectAccount(studentId, username);
    },
    {
      onSuccess: (_, { studentId }) => {
        queryClient.invalidateQueries(['ghConnection', studentId]);
        queryClient.invalidateQueries(['ghRepositories', studentId]);
      },
    }
  );
}

export function useDisconnectGitHubAccount() {
  const queryClient = useQueryClient();
  return useMutation(
    async (studentId: string) => {
      await delay(400);
      ghRepo.disconnectAccount(studentId);
    },
    {
      onSuccess: (_, studentId) => {
        queryClient.invalidateQueries(['ghConnection', studentId]);
        queryClient.invalidateQueries(['ghRepositories', studentId]);
      },
    }
  );
}

// ---- Repositories ----

export function useGitHubRepositories(studentId: string) {
  return useQuery(
    ['ghRepositories', studentId],
    async () => {
      await delay(400);
      return ghRepo.listRepositories(studentId);
    },
    { enabled: !!studentId }
  );
}

export function useGitHubRepositoryLink(studentId: string, courseId: string) {
  return useQuery(
    ['ghRepoLink', studentId, courseId],
    async () => {
      await delay(300);
      return ghRepo.getRepositoryLink(studentId, courseId);
    },
    { enabled: !!studentId && !!courseId }
  );
}

export function useCreateGitHubRepository() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ studentId, courseId, name }: { studentId: string; courseId: string; name: string }) => {
      await delay(700);
      return ghRepo.createRepository(studentId, courseId, name);
    },
    {
      onSuccess: (_, { studentId, courseId }) => {
        queryClient.invalidateQueries(['ghRepoLink', studentId, courseId]);
        queryClient.invalidateQueries(['ghRepositories', studentId]);
      },
    }
  );
}

export function useLinkExistingGitHubRepository() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ studentId, courseId, repositoryName }: { studentId: string; courseId: string; repositoryName: string }) => {
      await delay(600);
      return ghRepo.linkExistingRepository(studentId, courseId, repositoryName);
    },
    {
      onSuccess: (_, { studentId, courseId }) => {
        queryClient.invalidateQueries(['ghRepoLink', studentId, courseId]);
        queryClient.invalidateQueries(['ghRepositories', studentId]);
      },
    }
  );
}

export function useGitHubRepository(owner: string, name: string) {
  return useQuery(
    ['ghRepo', owner, name],
    async () => {
      await delay(400);
      return ghRepo.getRepository(owner, name);
    },
    { enabled: !!owner && !!name }
  );
}

export function useGitHubBranches(owner: string, name: string) {
  return useQuery(
    ['ghBranches', owner, name],
    async () => {
      await delay(300);
      return ghRepo.getBranches(owner, name);
    },
    { enabled: !!owner && !!name }
  );
}

export function useGitHubCommits(owner: string, name: string, branch?: string) {
  return useQuery(
    ['ghCommits', owner, name, branch || 'all'],
    async () => {
      await delay(400);
      return ghRepo.getCommits(owner, name, branch);
    },
    { enabled: !!owner && !!name }
  );
}

export function useGitHubPullRequests(owner: string, name: string) {
  return useQuery(
    ['ghPRs', owner, name],
    async () => {
      await delay(350);
      return ghRepo.getPullRequests(owner, name);
    },
    { enabled: !!owner && !!name }
  );
}

// ---- Activity ----

export function useGitHubActivity(studentId: string) {
  return useQuery(
    ['ghActivity', studentId],
    async () => {
      await delay(350);
      return ghRepo.listActivityForStudent(studentId);
    },
    { enabled: !!studentId }
  );
}

export function useRecentGitHubActivity(studentIds: string[], limit = 10) {
  return useQuery(
    ['ghRecentActivity', studentIds.slice().sort().join(','), limit],
    async () => {
      await delay(400);
      return ghRepo.listRecentActivity(studentIds, limit);
    },
    { enabled: studentIds.length > 0 }
  );
}

export function useRecordGitHubActivity() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({
      studentId,
      courseId,
      repositoryName,
      action,
      extra,
    }: {
      studentId: string;
      courseId: string;
      repositoryName: string;
      action: GitHubActivityAction;
      extra?: { branch?: string; message?: string; sha?: string; prNumber?: number };
    }) => {
      await delay(300);
      return ghRepo.recordActivity(studentId, courseId, repositoryName, action, extra);
    },
    {
      onSuccess: (_, { studentId }) => {
        queryClient.invalidateQueries(['ghActivity', studentId]);
        queryClient.invalidateQueries('ghRecentActivity');
      },
    }
  );
}
