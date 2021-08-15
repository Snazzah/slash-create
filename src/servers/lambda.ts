import { Server, ServerRequestHandler } from '../server';
import { joinHeaders, splitHeaders } from '../util/lambdaHeaders';
// @ts-ignore
import { APIGatewayProxyCallbackV2, APIGatewayProxyEventV2, Context } from 'aws-lambda';

/**
 * A server for AWS Lambda proxy integrations
 * @see https://aws.amazon.com/lambda/
 * @see https://aws.amazon.com/api-gateway/
 */
export class AWSLambdaServer extends Server {
  private _handler?: ServerRequestHandler;

  /**
   * @param moduleExports The exports for your module, must be `module.exports`
   * @param target The name of the exported lambda handler (only HTTP APIs with payload version 2.0 are supported)
   */
  constructor(moduleExports: any, target = 'interactions') {
    super({ alreadyListening: true });
    moduleExports[target] = this._onRequest.bind(this);
  }

  private _onRequest(event: APIGatewayProxyEventV2, _context: Context, callback: APIGatewayProxyCallbackV2) {
    if (event.version !== '2.0') {
      return callback('Only payload format version 2.0 is supported.');
    }
    if (!this._handler) {
      return callback(null, { statusCode: 503, body: 'Server has no handler.' });
    }
    this._handler(
      {
        headers: splitHeaders(event.headers),
        body: event.body ? JSON.parse(event.body) : {},
        request: event,
        response: callback
      },
      async (response) => {
        const responseHeaders = joinHeaders(response.headers);
        // Content-Type is not set automatically when overwriting headers
        responseHeaders['Content-Type'] = 'application/json';

        callback(null, {
          statusCode: response.status || 200,
          headers: responseHeaders,
          body: JSON.stringify(response.body)
        });
      }
    );
  }

  /** @private */
  createEndpoint(path: string, handler: ServerRequestHandler) {
    this._handler = handler;
  }
}
