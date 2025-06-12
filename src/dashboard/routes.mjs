import http from "http"
import { parseCookies } from "../shared/utils.mjs"
import { dashboardTemplate } from "./templates.mjs"

/**
 * 
 * @param {import("../postOffice/postOffice.mjs").PostOffice} postOffice 
 * @param {import("../game/game.mjs").GameLogic} gameLogic 
 * @returns {import("../server/server.mjs").Route[]}
 */
function DashboardRoutes(postOffice, gameLogic) {
    /**
     * @param {http.IncomingMessage} req
     * @param {http.ServerResponse} res
     */
    function getDashboard(req, res) {
        const { userId, lobbyId } = parseCookies(req.headers.cookie)
        if (!userId) {
            res.statusCode = 303
            res.setHeader("Location", "/auth")
            res.end()
            return
        }

        const lobby = lobbyId ? gameLogic.getLobbyByLobbyId(lobbyId) : null

        if (lobby) {
            res.statusCode = 303
            res.setHeader("Location", "/lobby")
            res.end()
            return
        }

        res.write(dashboardTemplate())
        res.end()
    }

    /**
     * @param {http.IncomingMessage} req
     * @param {http.ServerResponse} res
     */
    function dashboardEvents(req, res) {
        const { userId } = parseCookies(req.headers.cookie)
        if (!userId) {
            res.statusCode = 303
            res.setHeaders("Location", "/auth")
            res.end()
            return
        }

        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        });
        res.flushHeaders?.();
        const close = postOffice.Watch(({ type }) => {
            if (type === "dashboard:update") {
                res.write(`event: ${type}\ndata: 1\n\n`);
            }
        });

        req.on('close', () => {
            close();  // unsubscribe from postOffice
            res.end();
        });
    }

    return [
        { handler: getDashboard, method: "GET", path: "/" },
        { handler: dashboardEvents, method: "GET", path: "/dashboard-events" }
    ]
}

export { DashboardRoutes }