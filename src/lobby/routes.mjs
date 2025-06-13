import http from "http";
import { parseCookies } from "../shared/utils.mjs";
import {
  lobbyFullTemplate,
  lobbyListTemplate,
  lobbyNotExistTemplate,
  lobbyPlayersTemplate,
  lobbyStorySummary,
  lobbyStoryTemplate,
  lobbytemplate,
  lobbyWaitingTemplate,
} from "./templates.mjs";

/**
 *
 * @param {import("../postOffice/postOffice.mjs").PostOffice} postOffice
 * @param {import("../game/game.mjs").GameLogic} gameLogic
 * @returns {import("../server/server.mjs").Route[]}
 */
function LobbyRoutes(postOffice, gameLogic) {
  /**
   * SSE endpoint handler for lobby events
   * @param {http.IncomingMessage} req
   * @param {http.ServerResponse} res
   */
  function getLobbyEvents(req, res) {
    const { userId } = parseCookies(req.headers.cookie);

    const lobby = gameLogic.getLobbyByUserId(userId);

    if (!lobby) {
      res.statusCode = 400;
      res.end("No lobby bro");
      return;
    }

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    res.flushHeaders?.();

    const close = postOffice.Watch(({ lobbyId, type }) => {
      if (lobby.lobbyId === lobbyId) {
        res.write(`event: ${type}\ndata: 1\n\n`);
      }
    });

    // Cleanup when client disconnects
    req.on("close", () => {
      close(); // unsubscribe from postOffice
      res.end();
    });
  }

  /**
   * Get lobbies
   * @param {http.IncomingMessage} req
   * @param {http.ServerResponse} res
   */
  function getLobbies(req, res) {
    const { userId } = parseCookies(req.headers.cookie);
    if (!userId) {
      res.statusCode = 401;
      res.end();
      return;
    }
    const lobbies = gameLogic.getLobbies();

    res.write(
      lobbyListTemplate(
        lobbies.map((lobby) => ({
          lobbyId: lobby.lobbyId,
          lobbySize: lobby.lobbySize,
          name: lobby.lobbyName,
          playerCount: lobby.playingUsersCount,
        }))
      )
    );
    res.end();
  }

  /**
   * Get lobby
   * @param {http.IncomingMessage} req
   * @param {http.ServerResponse} res
   */
  function getLobby(req, res) {
    const { userId } = parseCookies(req.headers.cookie);

    if (!userId) {
      res.statusCode = 303;
      res.setHeader("Location", "/auth");
      res.end();
      return;
    }

    let lobby = gameLogic.getLobbyByUserId(userId);
    if (!lobby) {
      res.write(lobbytemplate(lobbyNotExistTemplate()));
      res.end();
      return;
    }

    const users = gameLogic.getLobbyUsers(lobby.lobbyId);

    let story = lobby.stories.find(
      (story) => !story.revealedAt && story.startedAt
    );

    if (!story) {
      story = gameLogic.startStory(lobby.lobbyId);
    }

    let mainContent = "";

    if (!story) {
      mainContent = '<h1>Finish</h1><p>TODO</p><a href="/">Back</a>'
    } else if (story.votes.length === lobby.playingUsersCount) {
      mainContent = lobbyStorySummary({
        projectName: lobby,
        title: story.title,
        votes: story.votes,
      });
    } else if (lobby.playingUsersCount === lobby.lobbySize) {
      mainContent = lobbyStoryTemplate({
        as: story.as,
        reason: story.reason,
        want: story.want,
        title: story.title,
        projectName: lobby.lobbyName,
        id: story.id,
        maxUsers: lobby.lobbySize,
        voteCount: story.votes.length,
      });
    } else {
      mainContent = lobbyWaitingTemplate({
        maxUsers: lobby.lobbySize,
        projectName: lobby.lobbyName,
        storiesCount: lobby.stories.length,
        userNames: users.map((user) => user.userName),
      });
    }

    res.write(lobbytemplate(mainContent));
    res.end();
  }

  /**
   * Get Lobby players
   * @param {http.IncomingMessage} req
   * @param {http.ServerResponse} res
   */
  function getLobbyPlayers(req, res) {
    const { userId } = parseCookies(req.headers.cookie);
    if (!userId) {
      res.statusCode = 303;
      res.setHeader("Location", "/auth");
      res.end();
      return;
    }

    const lobby = gameLogic.getLobbyByUserId(userId);

    if (!lobby) {
      res.statusCode = 400;
      res.write("No lobby bro");
      res.end();
      return;
    }

    const users = gameLogic.getLobbyUsers(lobby.lobbyId);

    res.write(
      lobbyPlayersTemplate(
        users.map((user) => user.userName),
        lobby.lobbySize
      )
    );
    res.end();
  }

  /**
   * Get Story Summary
   * @param {http.IncomingMessage} req
   * @param {http.ServerResponse} res
   */
  function getStorySummary(req, res) {
    const { userId } = parseCookies(req.headers.cookie);
    if (!userId) {
      res.statusCode = 303;
      res.setHeader("Location", "/auth");
      res.end();
      return;
    }

    const lobby = gameLogic.getLobbyByUserId(userId);

    if (!lobby) {
      res.statusCode = 400;
      res.write("No lobby bro");
      res.end();
      return;
    }

    const story = lobby.stories.find((story) => story.startedAt);
    res.write(
      lobbyStorySummary({
        projectName: lobby.lobbyName,
        title: story.title,
        votes: story.votes,
      })
    );
    res.end();
  }

  /**
   * Create lobby
   * @param {http.IncomingMessage} req
   * @param {http.ServerResponse} res
   */
  function createLobby(req, res) {
    const { userId, userName } = parseCookies(req.headers.cookie);
    if (!userId) {
      res.statusCode = 401;
      res.end();
      return;
    }

    gameLogic.createLobby(userId, userName);

    res.statusCode = 303;
    res.setHeader("Location", "/lobby");
    res.end();
  }

  /**
   * Join lobby
   *
   * @param {http.IncomingMessage} req
   * @param {http.ServerResponse} res
   */
  function joinLobby(req, res) {
    const { userId, userName } = parseCookies(req.headers.cookie);
    if (!userId) {
      res.statusCode = 401;
      res.end();
      return;
    }

    if (gameLogic.getLobbyByUserId(userId)) {
      res.write(
        "TODO: Error: 'you're already in a lobby'; Action:'Reset and go Back'"
      );
      res.end();
      return;
    }

    let body = [];
    req
      .on("data", (chunk) => {
        body.push(chunk);
      })
      .on("end", () => {
        const q = new URLSearchParams(Buffer.concat(body).toString());
        const lobbyId = q.get("lobbyId");

        const lobby = gameLogic.joinLobby(lobbyId, userId, userName);

        if ("error" in lobby) {
          res.write(lobbytemplate(lobbyFullTemplate()));
          res.end();
          return;
        }

        if (lobby.playingUsersCount === lobby.lobbySize) {
          gameLogic.startStory(lobbyId);
        }

        res.appendHeader("Location", "/lobby");
        res.statusCode = 303;
        res.end();
      });
  }

  /**
   * Join lobby
   *
   * @param {http.IncomingMessage} req
   * @param {http.ServerResponse} res
   */
  function getStory(req, res) {
    const { userId } = parseCookies(req.headers.cookie);
    const lobby = gameLogic.getLobbyByUserId(userId);
    const story = lobby.stories.find(
      (story) => story.startedAt && !story.revealedAt
    );

    res.write(
      lobbyStoryTemplate({
        as: story.as,
        reason: story.reason,
        want: story.reason,
        title: story.title,
        projectName: lobby.lobbyName,
        id: story.id,
        maxUsers: lobby.lobbySize,
        voteCount: story.votes.length,
      })
    );

    res.end();
  }

  /**
   * Cast vote
   *
   * @param {http.IncomingMessage} req
   * @param {http.ServerResponse} res
   */
  function createVote(req, res) {
    const { userId, userName } = parseCookies(req.headers.cookie);
    let body = [];
    req
      .on("data", (chunk) => {
        body.push(chunk);
      })
      .on("end", () => {
        const q = new URLSearchParams(Buffer.concat(body).toString());
        const storyId = q.get("storyId");
        const vote = q.get("vote");
        const lobby = gameLogic.getLobbyByUserId(userId);
        gameLogic.voteStory(lobby.lobbyId, storyId, {
          userId,
          userName,
          vote,
          voteAt: Date.now(),
        });

        res.appendHeader("Location", "/lobby");
        res.statusCode = 303;
        res.end();
      });
  }

  // /**
  //  * Finish Story
  //  *
  //  * @param {http.IncomingMessage} req
  //  * @param {http.ServerResponse} res
  //  */
  // function finishStory(req, res) {
  //     const { userId } = parseCookies(req.headers.cookie)

  //     let body = []
  //     req.on("data", (chunk) => {
  //         body.push(chunk)
  //     }).on("end", () => {
  //         const q = new URLSearchParams(Buffer.concat(body).toString())
  //         const storyId = q.get("storyId")
  //         const lobby = gameLogic.getLobbyByUserId(userId)
  //         const story = lobby.stories.find((story) => story.id === storyId)
  //         if (story.votes.length === lobby.playingUsersCount) {
  //             gameLogic.finishStory(lobby.lobbyId, storyId, { userId, userName, vote, voteAt: Date.now() })
  //         }

  //         res.appendHeader("Location", "/lobby")
  //         res.statusCode = 303
  //         res.end()
  //     })
  // }

  return [
    { handler: getLobbyEvents, method: "GET", path: "/lobby-events" },
    { handler: getLobbies, method: "GET", path: "/lobbies" },
    { handler: getLobby, method: "GET", path: "/lobby" },
    { handler: getLobbyPlayers, method: "GET", path: "/lobby/players" },
    { handler: createLobby, method: "POST", path: "/lobbies" },
    { handler: joinLobby, method: "POST", path: "/lobby/join" },
    { handler: createVote, method: "POST", path: "/lobby/vote" },
    { handler: getStory, method: "GET", path: "/lobby/story" },
    { handler: getStorySummary, method: "GET", path: "/lobby/story/summary" },
    // { handler: finishStory, method: "POST", path: "/lobby/story/finish" }
  ];
}

export { LobbyRoutes };
