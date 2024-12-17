export interface Fetch {
  resource: RequestInfo;
  options?:
    | RequestInit
    | (RequestInit & {
        highWaterMark?: number | undefined;
      });
}

export interface FancyfetchExtras {
  fetch?: <T>(...args: unknown) => Promise<Response | (Response & T)>;
  log?: boolean;
  validateResponse?: <T>(
    response: Response | (Response & T)
  ) => Promise<boolean> | boolean;
  maxAttempts?: number;
  retryDelay?: number;
  onError?: (error?: unknown) => unknown;
  onRetryError?: (error?: unknown) => unknown;
  onRetrySuccess?: () => unknown;
}

export declare function fancyfetch<T>(
  resource: Fetch['resource'],
  options?: Fetch['options'],
  extras?: FancyfetchExtras
): Promise<Response | (Response & T)>;

export default fancyfetch;
