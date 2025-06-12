import assert from "node:assert"
import http from "node:http"
import { parse } from "node:url"

/**
 * A simple routing table: method + path → handler
 * @typedef {Object} Route
 * @property {string} path
 * @property {string} method
 * @property {(req: http.IncomingMessage, res: http.ServerResponse) => Promise<void>} handler 
 */

/**
 * @typedef {Object} server
 * @property {() => void} Run
 * @property {() => void} Close
 */

/**
 * @param {Route[]} routes
 * @returns {server}
 */
function Server(routes) {
    assert.equal(Array.isArray(routes), true, "routes param is not an array")
    const server = http.createServer(async (req, res) => {
        const method = req.method
        const { pathname } = parse(req.url || "", true)


        const route = routes.find((r) => r.path === pathname && r.method === method)

        if (route) {
            await route.handler(req, res)
        } else {
            res.writeHead(404)
            res.end("404 Not Found")
        }
    })

    return {
        Run() {
            server.listen(1337, () => { console.log(`Serving http at http://localhost:1337`) })
        },
        Close() {
            server.closeAllConnections()
            server.close((err) => {
                if (err) {
                    console.error(err)
                    process.exit(1)
                } else {
                    console.log(`Server closed`)
                    process.exit(0)
                }
            })
        }
    }
}

export { Server }