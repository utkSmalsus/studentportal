import { WebPartContext } from '@microsoft/sp-webpart-base';
import { spfi, SPFI, SPFx } from '@pnp/sp';
import { LogLevel, PnPLogging } from '@pnp/logging';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import '@pnp/sp/batching';
import '@pnp/sp/site-users/web';

let _sp: SPFI | undefined;

/**
 * Initializes and returns the global PnPjs SPFI instance.
 * Call with WebPartContext during web part onInit(), and then call without
 * arguments anywhere across repositories/services to get the authenticated instance.
 */
export const getSP = (context?: WebPartContext): SPFI => {
  if (context) {
    _sp = spfi().using(SPFx(context)).using(PnPLogging(LogLevel.Warning));
  }
  return _sp!;
};

export const isSPInitialized = (): boolean => {
  return !!_sp;
};
