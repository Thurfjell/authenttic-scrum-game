import { EVENTS } from "../postOffice/postOffice.mjs";
import { ERROR_LOBBY_FULL } from "./error.mjs";
import {
  generateDeadSeriousProjectName,
  generateDeadSeriousStoryTitle,
  generateDeadSeriousUserStory,
} from "./utils.mjs";

/**
 * @typedef {Object} LobbyUser
 * @property {string} userId
 * @property {string} userName
 * @property {string} lobbyId
 */

/**
 * @typedef {Object} Vote
 * @property {string} userName - The name of the user (from cookie)
 * @property {string} userId - The id of the user (from cookie)
 * @property {string|number} vote - The story point (e.g., "5", "☕", "M")
 * @property {number} voteAt - Unix timestamp when the vote was cast
 */

/**
 * @typedef {Object} Story
 * @property {string} id - Unique story ID
 * @property {string} as - As a ...
 * @property {string} want - I want ...
 * @property {string} reason - Because ...
 * @property {string} title - Story title
 * @property {Vote[]} votes - List of votes for this story
 * @property {number|null} startedAt - When it was opened
 * @property {number|null} revealedAt - Timestamp when votes were revealed
 */

/**
 * @typedef {Object} LobbyState
 * @property {number} createdAt - Unix timestamp of lobby creation
 * @property {string} lobbyId - Unique identifier for this game lobby
 * @property {string} lobbyName - Name
 * @property {number} startedAt - Unix timestamp of game start (0 = not started)
 * @property {number} lobbySize - Max number of players allowed
 * @property {number} playingUsersCount - Number of users who joined when game started
 * @property {Story[]} stories - List of stories to be estimated
 */

/**
 * Interface for the Game API.
 *
 * @typedef {Object} GameLogic
 * @property {(filters?: { notFull?: boolean }) => LobbyState[]} getLobbies
 * @property {(lobbyId: string) => LobbyState | null} getLobbyByLobbyId
 * @property {(userId: string) => LobbyState | null} getLobbyByUserId
 * @property {(lobbyId: string, userId: string, userName:string) => LobbyState | {error:string}} joinLobby
 * @property {(userId: string, userName:string) => LobbyState} createLobby
 * @property {(userId: string) => void} leaveLobby
 * @property {(lobbyId: string) => Story | null} startStory
 * @property {(lobbyId: string, storyId:string, vote: Vote) => void} voteStory
 * @property {(lobbyId: string) => void} finishLobby
 * @property {(lobbyId: string) => Pick<LobbyUser, "userName" | "userId">[]} getLobbyUsers
 */

/**
 *
 * @param {import("../postOffice/postOffice.mjs").PostOffice} postOffice
 * @returns {GameLogic}
 */
function GameLogic(postOffice) {
  /** @type {Map<string, LobbyState>} */
  const lobbies = new Map();

  /** @type {Map<string, LobbyUser>} */
  const userToLobby = new Map(); // userId => LobbyUser

  return {
    getLobbies({ notFull = false } = {}) {
      return [...lobbies.values()]
        .filter((lobby) => {
          if (notFull && lobby.playingUsersCount >= lobby.lobbySize) {
            return false;
          }
          return true;
        })
        .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    },
    getLobbyByLobbyId(lobbyId) {
      return lobbies.get(lobbyId) || null;
    },
    getLobbyByUserId(userId) {
      const user = userToLobby.get(userId);
      let lobby = null;
      if (user && user.lobbyId) {
        lobby = lobbies.get(user.lobbyId) || null;
      }

      return lobby;
    },
    joinLobby(lobbyId, userId, userName) {
      if (userToLobby.has(userId)) {
        // either reject or join new lobby and leave old?
        this.leaveLobby(userId);
      }

      const lobby = lobbies.get(lobbyId);
      if (lobby.playingUsersCount >= lobby.lobbySize) {
        return { error: ERROR_LOBBY_FULL };
      }

      lobby.playingUsersCount += 1;
      userToLobby.set(userId, { lobbyId, userId, userName });
      postOffice.Send({ type: "dashboard:update", lobbyId });
      postOffice.Send({ type: lobby.playingUsersCount === lobby.lobbySize ? EVENTS.STORY_UPDATE : EVENTS.LOBBY_UPDATE, lobbyId });

      return lobbies.get(lobbyId);
    },
    startStory(lobbyId) {
      const lobby = lobbies.get(lobbyId);
      const story = lobby.stories.find((story) => !story.startedAt);
      if (!story) {
        return null;
      }
      story.startedAt = Date.now();
      postOffice.Send({ type: "story:update", lobbyId });
      return story;
    },
    createLobby(userId, userName) {
      const lobbyId = crypto.randomUUID();

      /** @type {Story[]} */
      const stories = [...new Array(5)].map(() => {
        const { as, reason, want } = generateDeadSeriousUserStory();
        const id = crypto.randomUUID();
        return {
          id,
          as,
          reason,
          want,
          votes: [],
          revealedAt: 0,
          title: generateDeadSeriousStoryTitle(),
        };
      });
      lobbies.set(lobbyId, {
        lobbyId,
        createdAt: Date.now(),
        startedAt: 0,
        lobbySize: 3,
        playingUsersCount: 1,
        stories,
        lobbyName: generateDeadSeriousProjectName(),
      });
      userToLobby.set(userId, { lobbyId, userId, userName });
      postOffice.Send({
        lobbyId,
        type: "dashboard:update",
      });
      return lobbies.get(lobbyId);
    },
    leaveLobby(userId) {
      const lobbyId = userToLobby.get(userId);
      if (!lobbyId) {
        return;
      }

      const lobby = lobbies.get(lobbyId);
      if (!lobby) {
        return;
      }

      lobby.playingUsersCount = lobby.playingUsersCount - 1 || 0;
      userToLobby.delete(userId);
      if (!lobby.playingUsersCount) {
        // Should do something..
        lobbies.delete(lobbyId);
      } else {
        postOffice.Send({
          lobbyId,
          type: "lobby:update",
        });
      }

      postOffice.Send({
        lobbyId,
        type: "dashboard:update",
      });
    },
    getLobbyUsers(lobbyId) {
      return [...userToLobby.values()]
        .filter((user) => user.lobbyId === lobbyId)
        .map(({ userId, userName }) => ({ userId, userName }));
    },
    voteStory(lobbyId, storyId, vote) {
      const lobby = lobbies.get(lobbyId);
      const story = lobby.stories.find((story) => story.id === storyId);
      if (story.votes.length === lobby.playingUsersCount) {
        return;
      }

      const currentVote = story.votes.find((v) => v.userId === vote.userId);

      if (currentVote) {
        currentVote.vote = vote;
      } else {
        story.votes.push(vote);
      }

      postOffice.Send({
        lobbyId,
        payload: story.votes.length,
        type:
          story.votes.length === lobby.playingUsersCount
            ? EVENTS.VOTE_FINISH
            : EVENTS.VOTE_UPDATE,
      });

      if (story.votes.length === lobby.playingUsersCount) {
        setTimeout(() => {
          const l = lobbies.get(lobbyId);
          const s = l.stories.find((s) => s.id === storyId);
          s.revealedAt = Date.now();

          this.startStory(lobbyId);

          postOffice.Send({ type: EVENTS.VOTE_UPDATE, lobbyId });
        }, 5000);
      }
    },
    finishLobby(lobbyId) {
      const lobby = lobbies.get(lobbyId)
      if (!lobby) {
        return
      }

      lobby.stories
        .flatMap((story) => story.votes.map((vote) => vote.userId))
        .forEach((userId) => userToLobby.delete(userId))

      lobbies.delete(lobby)
    }
  };
}

export { GameLogic };
