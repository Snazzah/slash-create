import Server, { InteractionHandler } from '../server';
declare type EventHandler = (handler: InteractionHandler) => void;
declare class GatewayServer extends Server {
    private _eventHandler;
    /**
     * @param eventHandler A function that is used to handle the event for gateway interactinos.
     */
    constructor(eventHandler: EventHandler);
    handleInteraction(handler: InteractionHandler): void;
}
export default GatewayServer;
