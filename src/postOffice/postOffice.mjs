/**
 * @typedef {string} EventType
 */

/**
 * @typedef {Object} Event
 * @property {EventType} type
 * @property {string} lobbyId
 * @property {any} payload
 */

/**
 * @typedef {Object} PostOffice
 * @property {(handler: (event: Event) => void) => () => void} Watch
 *   - Subscribe to events, returns unsubscribe function
 * @property {(event: Event) => void} Send
 *   - Broadcast an event to subscribers
 */



export const EVENTS = {
    DASHBOARD_UPDATE: "dashboard:update",
    LOBBY_UPDATE: "lobby:update",
    STORY_UPDATE: "story:update",
    VOTE_UPDATE: "story:vote:update",
    STORY_FINISH: "story:finish"
};
