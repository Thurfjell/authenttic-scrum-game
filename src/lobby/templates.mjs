import assert from "node:assert";

/**
 * @typedef {Object} LobbyListItem
 * @property {string} lobbyId
 * @property {number} playerCount
 * @property {number} lobbySize
 * @property {string} name
 */

/**
 *
 * @param {LobbyListItem[]} lobbies
 */
function lobbyListTemplate(lobbies) {
    assert(Array.isArray(lobbies), true, "invalid lobbies param");
    if (!lobbies.length) {
        return `<p>No active lobbies</p>`;
    }
    return `
<ul>
    ${lobbies
            .map(
                (lobby) => `<div class="lobby-item">
        <div>
            <strong>${lobby.name}</strong><br />
            Players: ${lobby.playerCount} / ${lobby.lobbySize}
        </div>
        <form action="/lobby/join" method="post">
            <input name="lobbyId" value="${lobby.lobbyId}" type="hidden"/>
            <button type="submit">Join</button>
        </form>
    </div>`
            )
            .join("")}
</ul >
`;
}

/**
 *
 * @param {string[]} userNames
 * @param {number} maxUsers
 * @returns {string}
 */
function lobbyPlayersTemplate(userNames, maxUsers) {
    const list = [...new Array(maxUsers)];
    for (let i = 0; i < userNames.length; i++) {
        const userName = userNames[i];
        list[i] = userName;
    }

    return `
        
            <h2>Players in this lobby:</h2>
            <ul class="player-list">
                ${list.map((userName) =>
        userName
            ? `<li>${userName}</li>`
            : "<li>Waiting for player...</li>"
    )}
            </ul>

            <p class="lobby-status">
                Waiting for players: <strong>${userNames.length
        } / ${maxUsers}</strong>
            </p>
        
`;
}

/**
 * @typedef {Object} LobbyViewModel
 * @property {string[]} userNames
 * @property {number} maxUsers
 * @property {string} projectName
 * @property {number} storiesCount
 */

/**
 * @param {LobbyViewModel} lobby
 * @returns {string}
 */
function lobbyWaitingTemplate(lobby) {
    return `
        <h1 class="project-name">Project ${lobby.projectName}</h1>

        <section class="lobby-info">
        ${lobbyPlayersTemplate(lobby.userNames, lobby.maxUsers)}
        </section>

        <div class="story-count">
            Estimating <strong>${lobby.storiesCount} stories</strong>
        </div>
    `;
}

/**
 * @param {{id:string, as:string, want:string, reason:string, projectName:string, title:string, voteCount:number, maxUsers:number}} story
 * @returns {string}
 */
function lobbyStoryTemplate(story) {

    return `
    <h1 class="project-name">Project ${story.projectName}</h1>
    <section class="story-card">
        <div class="story-fields">
            <h2 class="story-title">${story.title}</h2>
            <p><strong>As a </strong>${story.as}</p>
            <p><strong>I want </strong>${story.want}</p>
            <p><strong></strong>${story.reason}</p>
        </div>

        <p class="vote-status">
            Votes: <strong> <span id="playerVoteCount">${story.voteCount}</span> / ${story.maxUsers}</strong>
        </p>

        <form class="vote-form" method="POST" action="/lobby/vote">
            <input type="hidden" name="storyId" value="${story.id}" />
            <h3>Choose your vote:</h3>
            <div class="cards vote-buttons">
            <button type="submit" name="vote" value="S" class="card">S</button>
            <button type="submit" name="vote" value="M" class="card">M</button>
            <button type="submit" name="vote" value="L" class="card">L</button>
            </div>
        </form>
    </section>
    `;
}

/**
 * @param {{projectName:string, title:string, votes:{userName:string, vote:string}[]}} story
 * @returns {string}
 */
function lobbyStorySummary(story) {
    return `
    <h1 class="project-name">Project ${story.projectName}</h1>
    <section class="story-card">
        <div class="story-fields">
            <h2 class="story-title">${story.title}</h2>
            ${story.votes.map(
        (vote) => `<p><strong>${vote.userName}</strong>: ${vote.vote}</p>`
    ).join("")}            
        </div>
    </section>
    `;
}

/**
 * @returns {string}
 */
function lobbyFullTemplate() {
    return `
        <section class=story-card">
            <h3>Lobby is full :(</h3>
            <a href="/">Back to lobbies</a>
        </section>
    `;
}

/**
 * @returns {string}
 */
function lobbyNotExistTemplate() {
    return `
        <section class=story-card">
            <h3>Lobby doesn't exist :(</h3>
            <a href="/">Back to lobbies</a>
        </section>
    `;
}

/**
 * @returns {string}
 */
function lobbyStoryFinishTemplate() {
    return `
        <section class="story-card">
            <h1>Good job you're done<h1>
            <form method="post" action="/lobby/story/finish">
                <button type="submit">Now go back to work</button>
            </form>
        </section>
    `
}

/**
 *
 * @param {string} mainContent
 * @returns
 */
function lobbytemplate(mainContent) {
    //Project WaffleMachine 2.0
    return `
        <!DOCTYPE html>
        <html lang="en">

        <head>
            <meta charset="UTF-8" />
            <title>Scrum Poker – Lobby</title>
            <link href="https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap" rel="stylesheet" />
            <style>
                ${lobbyStyle}
            </style>
            <script>
                document.addEventListener("DOMContentLoaded", () => {
                    function loadPlayers() {
                        const list = document.querySelector(".lobby-info");
                        fetch("/lobby/players")
                        .then(async (res) => {
                            const html = await res.text()                            
                            list.innerHTML = html;
                        });
                    }

                    function loadStory(){
                        const main = document.querySelector(".lobby")
                        fetch("/lobby/story")
                        .then((res) => res.text())
                        .then((html) => {
                            main.innerHTML = html;    
                        })
                    }

                    function loadStorySummary(){
                        const main = document.querySelector(".lobby")
                        fetch("/lobby/story/summary")
                        .then((res) => res.text())
                        .then((html) => {
                            main.innerHTML = html;    
                        })
                    }
                    
                    function loadStoryFinish(){
                        const main = document.querySelector(".lobby")
                        fetch("/lobby/story/finish")
                        .then((res) => res.text())
                        .then((html) => {
                            main.innerHTML = html;    
                        })
                    }


                    const sse = new EventSource("/lobby-events")

                    sse.addEventListener("lobby:update", (event) => {
                        console.log("[SSE] lobby:update", event.data)
                        loadPlayers()
                    })

                    sse.addEventListener("story:update", (event) => {
                        console.log("[SSE] story:update", event.data)
                        loadStory()
                    })
                    
                    sse.addEventListener("story:vote:finish", (event) => { 
                        console.log("[SSE] story:vote:finish", event.data)                      
                        loadStorySummary()
                    })

                    sse.addEventListener("story:finish", (event) => {
                        console.log("[SSE] story:finish", event.data)                        
                        loadStoryFinish()
                    })
                    
                    sse.addEventListener("story:vote:update", (event) => {
                        console.log("[SSE] story:vote:update", event.data)
                        loadStory()
                    })                

                    sse.onerror = () => {
                        console.warn("SSE connection lost. Attempting to reconnect...");
                    }

                });
            </script>
        </head>

        <body>
            <main class="lobby">
                ${mainContent}
            </main>
        </body>

        </html>
    `;
}

const lobbyStyle = `
    body {
                    font-family: "Comic Sans MS", "Chalkboard SE", sans-serif;
                    background-color: #f7f6f3;
                    color: #333;
                    padding: 2rem;
                    margin: 0;
                }

                .lobby {
                    max-width: 500px;
                    margin: auto;
                    border: 2px dashed #bbb;
                    padding: 1.5rem;
                    border-radius: 10px;
                    background-color: #fff;
                    box-shadow: 3px 3px 5px rgba(180, 160, 130, 0.15);
                }

                .project-name {
                    font-size: 1.5rem;
                    margin-bottom: 1rem;
                }

                .lobby-status,
                .story-count {
                    margin-bottom: 0.5rem;
                    font-size: 1.1rem;
                }

                .vote-options {
                    margin-top: 2rem;
                }

                .vote-options.muted {
                    opacity: 0.5;
                }

                .cards {
                    display: flex;
                    gap: 1rem;
                    margin-top: 0.5rem;
                }

                .card {
                    padding: 1rem 1.5rem;
                    border: 2px solid #555;
                    border-radius: 6px;
                    font-size: 1.2rem;
                    background-color: #eee;
                    box-shadow: 2px 2px 0px #ccc;
                }

                .lobby-info {
                    font-family: 'Patrick Hand', cursive, 'Comic Sans MS', sans-serif;
                    background: #fcf9f3;
                    /* very subtle parchment */
                    border: 1.5px dashed #c4b68a;
                    /* softer border */
                    border-radius: 12px;
                    padding: 1.2em 1.8em;
                    max-width: 360px;
                    margin: 1.5em auto;
                    box-shadow: 2px 2px 5px rgba(196, 182, 138, 0.3);
                    /* lighter warm shadow */
                    color: #5a503e;
                    user-select: none;
                    line-height: 1.4;
                }

                .lobby-info h2 {
                    font-weight: 700;
                    font-size: 1.4em;
                    margin-bottom: 1em;
                    border-bottom: 2px dotted #c4b68a;
                    padding-bottom: 0.4em;
                    color: #7a6f52;
                    letter-spacing: 1.2px;
                    font-family: 'Patrick Hand', cursive;
                }

                .player-list {
                    list-style-type: none;
                    padding-left: 0;
                    margin-bottom: 1.2em;
                }

                .player-list li {
                    padding: 0.4em 0.7em;
                    border-bottom: 1px dashed #c4b68a;
                    font-style: normal;
                    color: #6b6148;
                    font-size: 1.1em;
                    /* subtle shaky effect with text shadow */
                    text-shadow:
                        0.4px 0.4px 0 #c4b68a,
                        -0.4px -0.4px 0 #c4b68a;
                }

                .player-list li:last-child {
                    border-bottom: none;
                }

                .waiting-status {
                    font-weight: 600;
                    font-size: 1.05em;
                    color: #8b8262;
                    text-align: center;
                    font-style: italic;
                    margin-top: 0;
                    letter-spacing: 0.8px;
                }

                /* Responsive: make it narrower on small screens */
                @media (max-width: 400px) {
                    .lobby-info {
                        max-width: 95vw;
                        padding: 1em 1.2em;
                    }

                    .lobby-info h2 {
                        font-size: 1.2em;
                    }

                    .player-list li {
                        font-size: 1em;
                    }

                    .waiting-status {
                        font-size: 1em;
                    }


                }

                /* THE VOTING CARD */
                .story-card {
                    margin-top: 2rem;
                    padding: 1.5rem;
                    background: #fcf9f3;
                    border: 2px dashed #c4b68a;
                    border-radius: 12px;
                    box-shadow: 2px 2px 6px rgba(180, 160, 130, 0.2);
                    max-width: 500px;
                    margin-left: auto;
                    margin-right: auto;
                    color: #5a503e;
                    font-family: 'Patrick Hand', cursive, 'Comic Sans MS', sans-serif;
                    line-height: 1.5;
                }

                .story-fields p {
                    margin: 0.4em 0;
                    font-size: 1.2em;
                }

                .vote-form h3 {
                    margin-top: 1.2rem;
                    font-size: 1.1rem;
                    color: #7a6f52;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                }

                .vote-buttons {
                    justify-content: center;
                    margin-top: 0.5rem;
                }

                .vote-buttons .card {
                    cursor: pointer;
                    background-color: #fdf6e3;
                    transition: background-color 0.2s ease, transform 0.1s ease;
                }

                .vote-buttons .card:hover {
                    background-color: #f1e8d0;
                    transform: scale(1.05);
                }
    `


export {
    lobbyListTemplate,
    lobbyPlayersTemplate,
    lobbytemplate,
    lobbyStoryTemplate,
    lobbyWaitingTemplate,
    lobbyFullTemplate,
    lobbyNotExistTemplate,
    lobbyStorySummary,
    lobbyStoryFinishTemplate
};
