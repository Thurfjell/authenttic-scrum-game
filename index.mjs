import { AuthRoutes } from "./src/auth/routes.mjs";
import { DashboardRoutes } from "./src/dashboard/routes.mjs";
import { GameLogic } from "./src/game/game.mjs";
import { LobbyRoutes } from "./src/lobby/routes.mjs";
import { EventEmitterPostOffice } from "./src/postOffice/eventEmitter.mjs";
import { Server } from "./src/server/server.mjs";

const postOffice = EventEmitterPostOffice()
const gameLogic = GameLogic(postOffice)

const lobbyRoutes = LobbyRoutes(postOffice, gameLogic)
const authRoutes = AuthRoutes()
const dashboardRoutes = DashboardRoutes(postOffice, gameLogic)

const server = Server([...lobbyRoutes, ...authRoutes, ...dashboardRoutes])

server.Run()

process.on("SIGINT", () => server.Close())
process.on("SIGTERM", () => server.Close())