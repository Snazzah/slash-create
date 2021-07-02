/** @hidden */
export type ArrayHeaders = { [key: string]: string | string[] | undefined };
/** @hidden */
export type CommaDelimitedHeaders = { [key: string]: string | undefined };
/** @hidden */
export type JoinedCommaDelimitedHeaders = { [key: string]: string };

export function splitHeaders(headers?: CommaDelimitedHeaders, separator = ',') {
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

export function joinHeaders(headers?: ArrayHeaders, separator = ',') {
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
