import { useQuery } from 'react-query';
import { resolveCurrentUserRole, UserRoleContext } from '../services/authService';

export function useCurrentUserRole(
  userEmail?: string,
  loginName?: string,
  displayName?: string
) {
  return useQuery<UserRoleContext>(
    ['currentUserRole', userEmail, loginName],
    async () => {
      return resolveCurrentUserRole(userEmail, loginName, displayName);
    },
    {
      staleTime: 1000 * 60 * 15, // Cache role for 15 minutes
      cacheTime: 1000 * 60 * 30, // Retain in memory for 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    }
  );
}
