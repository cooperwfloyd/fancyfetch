import type {
  RequestInfo as NodeFetchRequestInfo,
  RequestInit as NodeFetchRequestInit,
  Response,
} from '@types/node-fetch';

export interface Fetch {
  resource: RequestInfo | (NodeFetchRequestInfo & RequestInfo);
  options?:
    | RequestInit
    | (NodeFetchRequestInit &
        RequestInit & {
          highWaterMark?: number | undefined;
        });
}

export interface FancyfetchExtras {
  fetch?: (
    resource: Fetch['resource'],
    options?: Fetch['options']
  ) => Promise<Response>;
  log?: boolean;
  validateResponse?: (response: Response) => Promise<boolean> | boolean;
  maxAttempts?: number;
  retryDelay?: number;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  onError?: () => any;
  onRetryError?: () => any;
  onRetrySuccess?: () => any;
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

export declare function fancyfetch(
  resource: Fetch['resource'],
  options?: Fetch['options'],
  extras?: FancyfetchExtras
): Promise<Response>;

export default fancyfetch;
