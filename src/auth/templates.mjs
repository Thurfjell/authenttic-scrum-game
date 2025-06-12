
function signinTemplate() {
    return `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <title>Scrum Poker - Sign in</title>
    <link href="https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap" rel="stylesheet" />
    <style>
        body {
            font-family: "Comic Sans MS", "Chalkboard SE", sans-serif;
            background-color: #f7f6f3;
            color: #333;
            padding: 2rem;
            margin: 0;
        }
    </style>
    <script>
    </script>
</head>

<body>
    <main class="lobby">
        <h1>Sign yourself in!</h1>
        <form method="post" action="/auth">
            <input type="text" name="userName" placeholder="User name"></input>
            <button type="submit">Sign in!</button>
        </form>

    </main>
</body>

</html>
    `
}

export { signinTemplate }