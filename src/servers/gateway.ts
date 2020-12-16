import Server, { InteractionHandler } from '../server';

type EventHandler = (handler: InteractionHandler) => void;

class GatewayServer extends Server {
  private _eventHandler: EventHandler;

  /**
   * @param eventHandler A function that is used to handle the event for gateway interactinos.
   */
  constructor(eventHandler: EventHandler) {
    super({ alreadyListening: true }, false);
    this._eventHandler = eventHandler;
  }

  handleInteraction(handler: InteractionHandler) {
    this._eventHandler(handler);
  }
}

export default GatewayServer;
