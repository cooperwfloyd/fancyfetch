const fetch = require('node-fetch');

const fancyfetch = async (resource, options, extras) => {
  if (!resource || typeof resource !== `string`) throw new Error(`Error in fancyfetch: A valid fetch resource was not provided\n\nresource: ${resource}`);
  if (options && typeof options !== `object`) throw new Error(`Error in fancyfetch: options must be a valid object.\n\noptions: ${options}`);
  if (extras && typeof extras !== `object`) throw new Error(`Error in fancyfetch: extras must be a valid object.\n\nextras: ${extras}`);
  if (extras.maxTries && (typeof extras.maxTries !== `number` || !(Number.isInteger(extras.maxTries)) || extras.maxTries < 1)) throw new Error(`Error in fancyfetch: extras.maxTries must be a positive integer.\n\nextras.maxTries: ${extras.maxTries}`);
  if (extras.validateResponse && typeof extras.validateResponse !== `function`) throw new Error(`Error in fancyfetch: extras.validateResponse must be a valid function.\n\nextras.validateResponse: ${extras.validateResponse}`);
  if (extras.onError && typeof extras.onError !== `function`) throw new Error(`Error in fancyfetch: extras.onError must be a valid function.\n\nextras.onError: ${extras.onError}`);
  if (extras.onRetrySuccess && typeof extras.onRetrySuccess !== `function`) throw new Error(`Error in fancyfetch: extras.onRetrySuccess must be a valid function.\n\nextras.onRetrySuccess: ${extras.onRetrySuccess}`);
  if (extras.onRetryError && typeof extras.onRetryError !== `function`) throw new Error(`Error in fancyfetch: extras.onRetryError must be a valid function.\n\nextras.onRetryError: ${extras.onRetryError}`);

  let result = null;

  for (let tries = 0; tries < (extras.maxTries || 1); tries++) {
    try {
      const response = await fetch(resource, {...options});

      if ((extras.validateResponse && extras.validateResponse(response)) || (!extras.validateResponse && response)) {
        result = response;

        if (tries > 0 && result) {
          console.log(`fancyfetch fetch retry successful`);
          extras?.onRetrySuccess();
        }

        break;
      } else if (extras.validateResponse) {
        console.error(`Error in fancyfetch: Fetch was successful but didn't pass validateResponse. Retrying...`);
        extras?.onRetryError();
      } else {
        console.error(`Error in fancyfetch: Failed to fetch. Retrying...`);
        extras?.onRetryError();
      }
    } catch {
      console.error(`Error in fancyfetch: Failed to fetch. Retrying...`);
      extras?.onRetryError();
    }
  }

  const errorMessage = `Error in fancyfetch: No successful responses were returned.\n\nresource: ${resource}\n\noptions: ${JSON.stringify(options, null, 2)}\n\nextras: ${JSON.stringify(extras, null, 2)}`;

  if (!result) {
    if (extras.onError) {
      console.error(errorMessage);
      extras.onError();
    } else {
      throw new Error(errorMessage);
    }
  }

  return result;
};

module.exports = fancyfetch;
