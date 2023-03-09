// TODO: add debug option to output info
// TODO: documentation
// TODO: typescript

const fancyfetch = async (resource, options, extras) => {
  const extrasToUse = {
    log: true,
    retries: 1,
    ...extras,
  };

  if (
    typeof extrasToUse !== `undefined` &&
    typeof extrasToUse?.fetch !== `function`
  )
    throw new Error(
      `Error in fancyfetch: extras.fetch must be a valid function.\n\nextras.fetch: ${String(
        extrasToUse?.fetch
      )}`
    );

  const fetchToUse =
    typeof extrasToUse !== `undefined` &&
    typeof extrasToUse?.fetch === `function`
      ? extrasToUse.fetch
      : typeof fetch === `function`
      ? fetch
      : typeof global !== `undefined` && typeof global?.fetch === `function`
      ? global.fetch
      : typeof window !== `undefined` && typeof window?.fetch === `function`
      ? window.fetch
      : null;

  if (typeof fetchToUse !== `function`)
    throw new Error(
      `Error in fancyfetch: fetchToUse must be a valid function.\n\nfetchToUse: ${String(
        fetchToUse
      )}`
    );

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
  if (extrasToUse && typeof extrasToUse !== `object`)
    throw new Error(
      `Error in fancyfetch: extras must be a valid object.\n\nextras: ${JSON.stringify(
        extrasToUse,
        null,
        2
      )}`
    );
  if (
    typeof extrasToUse?.retries === `number` &&
    (!Number.isInteger(extrasToUse.retries) || extrasToUse.retries < 1)
  )
    throw new Error(
      `Error in fancyfetch: extras.retries must be a positive integer.\n\nextras.retries: ${extrasToUse.retries}`
    );
  if (
    extrasToUse?.validateResponse &&
    typeof extrasToUse?.validateResponse !== `function`
  )
    throw new Error(
      `Error in fancyfetch: extras.validateResponse must be a valid function.\n\nextras.validateResponse: ${String(
        extrasToUse?.validateResponse
      )}`
    );
  if (extrasToUse?.onError && typeof extrasToUse.onError !== `function`)
    throw new Error(
      `Error in fancyfetch: extras.onError must be a valid function.\n\nextras.onError: ${String(
        extrasToUse.onError
      )}`
    );
  if (
    extrasToUse?.onRetrySuccess &&
    typeof extrasToUse.onRetrySuccess !== `function`
  )
    throw new Error(
      `Error in fancyfetch: extras.onRetrySuccess must be a valid function.\n\nextras.onRetrySuccess: ${String(
        extrasToUse.onRetrySuccess
      )}`
    );
  if (
    extrasToUse?.onRetryError &&
    typeof extrasToUse.onRetryError !== `function`
  )
    throw new Error(
      `Error in fancyfetch: extras.onRetryError must be a valid function.\n\nextras.onRetryError: ${String(
        extrasToUse.onRetryError
      )}`
    );
  let attempts = 0;

  const tryFetch = async () => {
    attempts++;
    if (attempts > extrasToUse.retries) return null;

    try {
      const response = await fetchToUse(resource, options);

      const validResponse = extrasToUse?.validateResponse
        ? !!(await extrasToUse.validateResponse(response))
        : true;

      if (validResponse) {
        if (attempts > 1) {
          if (extrasToUse?.logging === true)
            console.log(`fancyfetch fetch retry successful`);

          if (extrasToUse?.onRetrySuccess) {
            extrasToUse.onRetrySuccess();
          }
        }

        return response;
      } else {
        if (extrasToUse.retries === 1) return null;

        if (extrasToUse?.logging === true)
          console.error(
            `Error in fancyfetch: Fetch was successful but didn't pass validateResponse. Retrying...`
          );

        if (extrasToUse?.onRetryError) extrasToUse.onRetryError();
        return await tryFetch();
      }
    } catch {
      if (extrasToUse.retries === 1) return null;
      if (extrasToUse?.logging === true)
        console.error(`Error in fancyfetch: Failed to fetch. Retrying...`);
      if (extrasToUse?.onRetryError) extrasToUse.onRetryError();
      return await tryFetch();
    }
  };

  const result = await tryFetch();

  const errorMessage = `Error in fancyfetch: No successful responses were returned.\n\nresource: ${JSON.stringify(
    resource,
    null,
    2
  )}\n\noptions: ${JSON.stringify(
    options,
    null,
    2
  )}\n\nextras: ${JSON.stringify(extrasToUse, null, 2)}`;

  if (result === null) {
    if (extrasToUse?.onError) {
      if (extrasToUse?.logging === true) console.error(errorMessage);

      extrasToUse.onError();
    } else {
      throw new Error(errorMessage);
    }
  }

  return result;
};

export default fancyfetch;
