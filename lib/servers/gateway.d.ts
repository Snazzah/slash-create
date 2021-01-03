import Server, { InteractionHandler } from '../server';
/** @private */
declare type EventHandler = (handler: InteractionHandler) => void;
/** A "server" for gateway connections to pipe events into. */
declare class GatewayServer extends Server {
    private readonly _eventHandler;
    /** @param eventHandler A function that is used to handle the event for gateway interactions. */
    constructor(eventHandler: EventHandler);
    /** @private */
    handleInteraction(handler: InteractionHandler): void;
}
export default GatewayServer;
