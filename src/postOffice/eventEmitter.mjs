import { EventEmitter } from "node:events";

/**
 * 
 * @returns {import("./postOffice.mjs").PostOffice}
 */
function EventEmitterPostOffice() {
    const emitter = new EventEmitter()

    return {
        Watch(handler) {
            emitter.on("event", handler)
            return () => emitter.off("event", handler)
        },
        Send(event) {
            emitter.emit("event", event);
        },
    }
}

export { EventEmitterPostOffice }