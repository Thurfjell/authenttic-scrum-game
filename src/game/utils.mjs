/**
 * Random user story content generator
 * 
 * @returns {{as:string, want:string, reason:string}}
 */
function generateDeadSeriousUserStory() {
    const users = [
        "overworked squirrel",
        "sentient vending machine",
        "intern who thinks they're the CEO",
        "AI with abandonment issues",
        "developer powered by pizza",
        "project manager trapped in a spreadsheet",
        "cat working remotely",
        "janitor with admin access",
        "rubber duck debugger that became sentient",
        "freelancer with too many tabs open",
        "wizard disguised as a QA engineer",
        "product owner with a Ouija board",
        "scrum master who speaks only in metaphors",
        "developer haunted by merge conflicts",
        "hamster running the CI/CD pipeline"
    ];

    const wants = [
        "trigger coffee breaks with a clap",
        "auto-reply to emails with haikus",
        "deploy to production by yelling 'YOLO'",
        "convert Jira tickets into memes",
        "summon Scrum Master with a kazoo",
        "generate unit tests using tarot cards",
        "replace meetings with Mario Kart races",
        "track productivity based on caffeine levels",
        "rebase time itself",
        "scrum while bungee jumping",
        "enable dark mode for reality",
        "detect bugs using interpretive dance",
        "undo Friday deployments with a whistle",
        "refactor feelings into microservices",
        "display sprint burndown as a Tamagotchi’s mood"
    ];

    const reasons = [
        "So I can achieve inner peace at standups",
        "Because the coffee machine respects assertiveness",
        "To boost team morale with chaos",
        "Because time is an illusion (and so is QA)",
        "To finally impress my Roomba",
        "Because deadlines are a social construct",
        "So the CTO stops crying",
        "Because the intern summoned bugs again",
        "To unlock the hidden Jira boss fight",
        "So I can finally earn my Agile wizard hat",
        "Because reality lacks feature flags",
        "To keep the rubber duck debugger appeased",
        "Because the build gods demand sacrifice",
        "So I can debug without existential dread",
        "Because chaos is agile if it's on the board"
    ];

    const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

    return { as: random(users), want: random(wants), reason: random(reasons) }
}

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}


function generateDeadSeriousProjectName() {
    const prefixes = [
        "Waffle", "Quantum", "Turbo", "Angry", "Dizzy", "Hyper", "Invisible", "Spicy",
        "Cursed", "Velcro", "Cosmic", "Drunken", "Electric", "Fluffy", "Rusty", "Banana",
        "Haunted", "Chewy", "Funky", "Rainbow", "Wonky", "Sleepy", "Barking", "Slimy"
    ];

    const cores = [
        "Machine", "Hamster", "Octopus", "Parrot", "Engine", "Blender", "Unicorn", "Toaster",
        "Taco", "Keyboard", "Skateboard", "Pickle", "Spaceship", "Duck", "Melon", "Yeti",
        "Ferret", "Laser", "Cabbage", "Chihuahua", "Penguin", "Lawnmower", "Accordion", "Crayon"
    ];

    const suffixes = [
        "OS", "Suite", "Pro", "Cloud", "Engine", "Service", "Stack", "App",
        "Core", "Express", "Lite", "X", "System", "Kit", "Net", "Forge",
        "Plus", "Works", "Desk", "Box", "Flow", "Portal", "Tools", "3000"
    ];

    const prefix = getRandomItem(prefixes);
    const core = getRandomItem(cores);
    const suffix = getRandomItem(suffixes);

    return `${prefix} ${core} ${suffix}`;
}

function generateDeadSeriousStoryTitle() {
    const adjectives = [
        "Exploding", "Invisible", "Cursed", "Hyperactive", "Banana", "Quantum",
        "Sleepy", "Spicy", "Rusty", "Haunted", "Funky", "Velcro", "Wonky", "Drunken",
        "Unstable", "Suspicious", "Screaming", "Slimy", "Magnetic", "Evil"
    ];

    const nouns = [
        "Duck", "Waffle", "Blender", "Skateboard", "Toaster", "Ferret", "Octopus",
        "Lawnmower", "Accordion", "Chinchilla", "Crayon", "Keyboard", "Melon",
        "Spoon", "Drone", "Helmet", "Penguin", "Hamster", "Portal", "Pickle"
    ];

    const suffixes = [
        "Optimizer", "Manager", "System", "Tracker", "Daemon", "Service",
        "Protocol", "Generator", "Detector", "Enhancer", "Engine", "Debugger",
        "Injector", "Reducer", "Widget", "API", "Module", "Bot", "Hub", "Suite"
    ];

    const num = Math.floor(Math.random() * 3000) + 3000;
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

    return `${num} - ${adj} ${noun} ${suffix}`;
}

export { generateDeadSeriousUserStory, generateDeadSeriousProjectName, generateDeadSeriousStoryTitle}