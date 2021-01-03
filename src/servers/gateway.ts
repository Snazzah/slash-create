import Server, { InteractionHandler } from '../server';

/** @private */
type EventHandler = (handler: InteractionHandler) => void;

/** A "server" for gateway connections to pipe events into. */
class GatewayServer extends Server {
  private readonly _eventHandler: EventHandler;

  /** @param eventHandler A function that is used to handle the event for gateway interactions. */
  constructor(eventHandler: EventHandler) {
    super({ alreadyListening: true }, false);
    this._eventHandler = eventHandler;
  }

  /** @private */
  handleInteraction(handler: InteractionHandler) {
    this._eventHandler(handler);
  }
}

export default GatewayServer;
