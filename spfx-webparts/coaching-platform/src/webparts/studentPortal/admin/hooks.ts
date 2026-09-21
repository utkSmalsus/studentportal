// A single hook both the Admin app and the Student app use to re-render when
// the admin store changes — e.g. a student page open on Module Detail should
// reflect an admin edit to that module without needing a manual refresh.
import { useEffect, useState } from 'react';
import { subscribe } from './repository/store';

export function useAdminStoreVersion(): number {
  const [version, setVersion] = useState(0);
  useEffect(() => subscribe(() => setVersion((v) => v + 1)), []);
  return version;
}
