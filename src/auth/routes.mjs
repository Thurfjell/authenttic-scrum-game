import http from "http"
import { parseCookies } from "../shared/utils.mjs"
import { signinTemplate } from "./templates.mjs"

/**
 * @returns {import("../server/server.mjs").Route[]}
 */
function AuthRoutes() {
    /**
     * @param {http.IncomingMessage} req
     * @param {http.ServerResponse} res
     */
    function getSignin(req, res) {
        // const url = new URL(req.url, "http://localhost:1337")
        // const callbackUrl = url.searchParams.get("r")

        const { userId } = parseCookies(req.headers.cookie)
        if (userId) {
            res.statusCode = 303
            res.setHeader("Location", "/")
            res.end()
            return
        }

        res.write(signinTemplate())
        res.end()
    }
    /**
     * Would make sense if this was a json actually
     * @param {http.IncomingMessage} req
     * @param {http.ServerResponse} res
     */
    function postSignin(req, res) {
        let body = []
        req.on("data", (chunk) => {
            body.push(chunk)
        }).on("end", () => {
            const q = new URLSearchParams(Buffer.concat(body).toString())
            const userName = q.get("userName")
            const userId = crypto.randomUUID()
            const headder = new Headers()
            headder.set("Set-Cookie", "HttpOnly; path=/")
            headder.append("Set-Cookie", `userId=${userId}`)
            headder.append("Set-Cookie", `userName=${userName}`)

            res.setHeaders(headder)
            res.appendHeader("Location", "/")
            res.statusCode = 303
            res.end()
        })
    }

    return [
        {
            handler: getSignin, method: "GET", path: "/auth"
        },
        {
            handler: postSignin, method: "POST", path: "/auth"
        }
    ]
}

export { AuthRoutes }