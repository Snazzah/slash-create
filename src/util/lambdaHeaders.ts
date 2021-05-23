export type ArrayHeaders = { [key: string]: string | string[] | undefined };
export type CommaDelimitedHeaders = { [key: string]: string | undefined };
export type JoinedCommaDelimitedHeaders = { [key: string]: string };

function splitHeaders(headers?: CommaDelimitedHeaders, separator = ',') {
  const arrayHeaders = {} as ArrayHeaders;

  if (!headers) return arrayHeaders;

  Object.entries(headers).forEach(([headerKey, headerValue]) => {
    if (headerValue !== undefined && headerValue.includes(separator)) {
      arrayHeaders[headerKey] = headerValue.split(separator);
    } else {
      arrayHeaders[headerKey] = headerValue;
    }
  });

  return arrayHeaders;
}

function joinHeaders(headers?: ArrayHeaders, separator = ',') {
  const commaDelimitedHeaders = {} as JoinedCommaDelimitedHeaders;

  if (!headers) return commaDelimitedHeaders;

  Object.entries(headers).forEach(([headerKey, headerValue]) => {
    if (headerValue === undefined) return;

    if (Array.isArray(headerValue)) {
      commaDelimitedHeaders[headerKey] = headerValue.join(separator);
    } else {
      commaDelimitedHeaders[headerKey] = headerValue;
    }
  });

  return commaDelimitedHeaders;
}

export { splitHeaders, joinHeaders };
