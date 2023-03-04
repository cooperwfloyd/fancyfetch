import type {RequestInfo, RequestInit, Response} from 'node-fetch';

export default interface Fancyfetch {
  resource: RequestInfo;
  options?: RequestInit | undefined;
  extras?: {
    maxAttempts?: number;
    validateResponse?: (response: Response, attempt: number) => boolean;
    onError?: () => void;
    onRetrySuccess?: () => void;
    onRetryError?: () => void;
  };
}
