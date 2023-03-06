import type {RequestInfo, RequestInit, Response} from 'node-fetch';
import fetch from 'node-fetch';

interface Fancyfetch {
  resource: RequestInfo;
  options?: RequestInit | null | undefined;
  extras?: {
    maxAttempts?: number;
    validateResponse?: (response: Response, attempt: number) => boolean;
    onError?: () => void;
    onRetrySuccess?: () => void;
    onRetryError?: () => void;
  };
}

const fancyfetch = async (
  resource: Fancyfetch[`resource`],
  options: Fancyfetch[`options`],
  extras: Fancyfetch[`extras`]
): Promise<Response | null> => {
  if (typeof resource !== `string`)
    throw new Error(
      `Error in fancyfetch: A valid fetch resource was not provided\n\nresource: ${JSON.stringify(
        resource,
        null,
        2
      )}`
    );
  if (options && typeof options !== `object`)
    throw new Error(
      `Error in fancyfetch: options must be a valid object.\n\noptions: ${JSON.stringify(
        options,
        null,
        2
      )}`
    );
  if (extras && typeof extras !== `object`)
    throw new Error(
      `Error in fancyfetch: extras must be a valid object.\n\nextras: ${JSON.stringify(
        extras,
        null,
        2
      )}`
    );
  if (
    typeof extras?.maxAttempts === `number` &&
    (!Number.isInteger(extras.maxAttempts) || extras.maxAttempts < 1)
  )
    throw new Error(
      `Error in fancyfetch: extras.maxAttempts must be a positive integer.\n\nextras.maxAttempts: ${extras.maxAttempts}`
    );
  if (
    extras?.validateResponse &&
    typeof extras?.validateResponse !== `function`
  )
    throw new Error(
      `Error in fancyfetch: extras.validateResponse must be a valid function.\n\nextras.validateResponse: ${String(
        extras?.validateResponse
      )}`
    );
  if (extras?.onError && typeof extras.onError !== `function`)
    throw new Error(
      `Error in fancyfetch: extras.onError must be a valid function.\n\nextras.onError: ${String(
        extras.onError
      )}`
    );
  if (extras?.onRetrySuccess && typeof extras.onRetrySuccess !== `function`)
    throw new Error(
      `Error in fancyfetch: extras.onRetrySuccess must be a valid function.\n\nextras.onRetrySuccess: ${String(
        extras.onRetrySuccess
      )}`
    );
  if (extras?.onRetryError && typeof extras.onRetryError !== `function`)
    throw new Error(
      `Error in fancyfetch: extras.onRetryError must be a valid function.\n\nextras.onRetryError: ${String(
        extras.onRetryError
      )}`
    );

  let result: Response | null = null;

  await Promise.all(
    Array.from(Array(extras?.maxAttempts ?? 1)).map(async (item, attempt) => {
      try {
        const response: Response = await fetch(resource, {...options});
        const validResponse = !!(
          !!(
            !!extras?.validateResponse &&
            extras.validateResponse(response, attempt)
          ) || !extras?.validateResponse
        );

        if (validResponse) {
          if (attempt > 0 && result !== null) {
            console.log(`fancyfetch fetch retry successful`);

            if (extras?.onRetrySuccess) {
              extras.onRetrySuccess();
            }
          }

          result = response;
        } else if (extras?.validateResponse) {
          console.error(
            `Error in fancyfetch: Fetch was successful but didn't pass validateResponse. Retrying...`
          );

          if (extras?.onRetryError) {
            extras.onRetryError();
          }
        } else {
          console.error(`Error in fancyfetch: Failed to fetch. Retrying...`);

          if (extras?.onRetryError) {
            extras.onRetryError();
          }
        }
      } catch {
        console.error(`Error in fancyfetch: Failed to fetch. Retrying...`);

        if (extras?.onRetryError) {
          extras.onRetryError();
        }
      }
    })
  );

  const errorMessage = `Error in fancyfetch: No successful responses were returned.\n\nresource: ${JSON.stringify(
    resource,
    null,
    2
  )}\n\noptions: ${JSON.stringify(
    options,
    null,
    2
  )}\n\nextras: ${JSON.stringify(extras, null, 2)}`;

  if (result === null) {
    if (extras?.onError) {
      console.error(errorMessage);
      extras.onError();
    } else {
      throw new Error(errorMessage);
    }
  }

  return result;
};

export default fancyfetch;
