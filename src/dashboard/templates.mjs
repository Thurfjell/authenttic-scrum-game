/**
 * @typedef {Object} DashboardViewModel
 */

/**
 * 
 * @param {DashboardViewModel} dashboard
 * @returns 
 */
function dashboardTemplate(dashboard) {
    //Project WaffleMachine 2.0
    return `
        <!DOCTYPE html>
        <html lang="en">

        <head>
            <meta charset="UTF-8" />
            <title>Scrum Poker</title>
            <link href="https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap" rel="stylesheet" />
            <style>
        <style>
            body {
                font-family: "Comic Sans MS", "Chalkboard SE", sans-serif;
                background-color: #f7f6f3;
                color: #333;
                padding: 2rem;
                margin: 0;
            }

            .dashboard {
                max-width: 600px;
                margin: auto;
                background-color: #fff;
                border: 2px dashed #bbb;
                border-radius: 12px;
                padding: 2rem;
                box-shadow: 3px 3px 5px rgba(180, 160, 130, 0.15);
            }

            h1 {
                font-family: 'Patrick Hand', cursive;
                text-align: center;
                font-size: 2rem;
                margin-bottom: 1.5rem;
                color: #6a5f44;
            }

            .lobby-list {
                margin-bottom: 2rem;
            }

            .lobby-item {
                background: #fcf9f3;
                border: 1.5px dashed #c4b68a;
                border-radius: 10px;
                padding: 1rem;
                margin-bottom: 1rem;
                box-shadow: 2px 2px 4px rgba(196, 182, 138, 0.2);
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
            }

            .lobby-item .info {
                font-family: 'Patrick Hand', cursive;
                font-size: 1.1rem;
                color: #5a503e;
            }

            .lobby-item button {
                font-family: inherit;
                font-size: 1rem;
                padding: 0.5em 1em;
                background-color: #e6e2d7;
                border: 2px solid #a89c7a;
                border-radius: 6px;
                cursor: pointer;
                transition: background-color 0.2s;
            }

            .lobby-item button:hover {
                background-color: #dcd6c0;
            }

            .create-lobby {
                text-align: center;
            }

            .create-lobby button {
                font-family: inherit;
                font-size: 1.1rem;
                padding: 0.6em 1.2em;
                background-color: #fffbe8;
                border: 2px dashed #c4b68a;
                border-radius: 8px;
                cursor: pointer;
                box-shadow: 2px 2px 4px rgba(180, 160, 130, 0.2);
            }

            .create-lobby button:hover {
                background-color: #fdfae3;
            }

            @media (max-width: 500px) {
                .lobby-item {
                    flex-direction: column;
                    align-items: flex-start;
                }

                .lobby-item button {
                    margin-top: 0.5em;
                    width: 100%;
                }

                .create-lobby button {
                    width: 100%;
                }
            }

            .lobby-item form button {
                background: #f2eddc;
                border: 2px solid #a89c7a;
                border-radius: 6px;
                color: #333;
                font-weight: bold;
                padding: 0.4em 1em;
                font-family: inherit;
                cursor: pointer;
            }
            </style>
            <script>
                document.addEventListener("DOMContentLoaded", () => {
                    function loadList() {
                        const list = document.querySelector(".lobby-list");
                        fetch("/lobbies").then(async (res) => {
                            const html = await res.text();
                            list.innerHTML = html;
                        });
                    }

                    const sse = new EventSource("/dashboard-events")

                    sse.addEventListener("dashboard:update", (event) => {
                        console.log("[SSE] dashboard:update", event.data)
                        loadList()
                    })

                    sse.onerror = () => {
                        console.warn("SSE connection lost. Attempting to reconnect...");
                    }

                    loadList()
                });
            </script>
        </head>

        <body>
        <main class="dashboard">
                <h1>Scum Bro</h1>

                <section class="lobby-list">
                    <p>Loading lobbies...</p>                        
                </section>

                <section class="create-lobby">
                    <form action="/lobbies" method="post">
                        <button type="submit">✨ Start New Project</button>
                    </form>
                </section>
            </main>
        </body>

        </html>
    `
}

export { dashboardTemplate }