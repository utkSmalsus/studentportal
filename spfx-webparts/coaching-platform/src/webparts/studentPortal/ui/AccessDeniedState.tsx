import * as React from 'react';
import { Card, PrimaryButton, SecondaryButton } from './Primitives';
import { LockIcon, AlertIcon } from './icons';

export interface AccessDeniedStateProps {
  title?: string;
  description?: string;
  userEmail?: string;
  userDisplayName?: string;
  onRetry?: () => void;
  adminContactEmail?: string;
}

export const AccessDeniedState: React.FC<AccessDeniedStateProps> = ({
  title = 'Enrollment Pending',
  description = 'Your Microsoft 365 account is authenticated, but you are not currently assigned to an active coaching batch, mentor roster, or administrator role.',
  userEmail,
  userDisplayName,
  onRetry,
  adminContactEmail = 'admin@coachingplatform.com',
}) => {
  return (
    <div className="min-h-[560px] flex items-center justify-center p-6 bg-slate-50 font-sans">
      <Card className="max-w-lg w-full text-center p-8 sm:p-10 shadow-lg border-slate-200">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-6 shadow-sm">
          <LockIcon className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">{title}</h1>
        <p className="text-slate-600 text-sm leading-relaxed mb-6">{description}</p>

        {(userDisplayName || userEmail) && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 text-left text-xs space-y-1.5">
            <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Signed in as</div>
            {userDisplayName && <div className="font-semibold text-slate-900 text-sm">{userDisplayName}</div>}
            {userEmail && <div className="text-slate-500 font-mono">{userEmail}</div>}
          </div>
        )}

        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {onRetry && (
              <PrimaryButton onClick={onRetry}>
                Check Access Again
              </PrimaryButton>
            )}
            <SecondaryButton
              onClick={() => {
                window.location.href = `mailto:${adminContactEmail}?subject=Coaching%20Platform%20Enrollment%20Request&body=Hello%20Admin,%0D%0A%0D%0APlease%20grant%20access%20to%20my%20account:%20${userEmail || ''}`;
              }}
            >
              Contact Administrator
            </SecondaryButton>
          </div>

          <p className="text-xs text-slate-400 mt-4">
            If you were recently added to a batch, please allow a couple of minutes for SharePoint synchronization and refresh the page.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default AccessDeniedState;
