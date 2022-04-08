/*
 * A generals.io game helper.
 *
 * GitHub Repo: https://github.com/AstralLing/generals.io-Helper
 */
const GeneralsIOColors = ["red", "lightblue", "green", "teal", "orange", "pink", "purple", "maroon", "yellow", "brown", "blue", "purple-blue"];
var isAlive = {
    "red": false,
    "lightblue": false,
    "green": false,
    "teal": false,
    "orange": false,
    "pink": false,
    "purple": false,
    "maroon": false,
    "yellow": false,
    "brown": false,
    "blue": false,
    "purple-blue": false
};
var lastTurn = {
    "red": 1,
    "lightblue": 1,
    "green": 1,
    "teal": 1,
    "orange": 1,
    "pink": 1,
    "purple": 1,
    "maroon": 1,
    "yellow": 1,
    "brown": 1,
    "blue": 1,
    "purple-blue": 1,
    "id": 0
};
var cities = [];
var generals = [];
var mapObserver, turnObserver;
function startObserve() {
    let observeTarget = document.getElementById("react-container");
    let observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            mutation.addedNodes.forEach(function (added) {
                if (added.id === "game-page")
                    setTimeout(meow, 100);
            });
            mutation.removedNodes.forEach(function (removed) {
                if (removed.id === "game-page")
                    mapObserver.disconnect();
            });
        });
    });
    observer.observe(observeTarget, { childList: true, subtree: true });
}
function meow() {
    let turncounter = document.getElementById("turn-counter");
    let playerInfo = document.getElementById("game-leaderboard").children[0].children;
    mapObserver = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type === "characterData")
                rewriteGame();
        });
    });
    for (let color of GeneralsIOColors)
        for (let i = 1; i < playerInfo.length; ++i)
            if (playerInfo[i].children[1].classList.contains(color))
                isAlive[color] = true;
    playerInfo[0].appendChild(document.createElement('td'));
    playerInfo[0].children[4].textContent = "City";
    playerInfo[0].appendChild(document.createElement('td'));
    playerInfo[0].children[5].textContent = "Delta";
    for (let i = 1, cur; i < playerInfo.length; ++i) {
        cur = playerInfo[i].children[1].className.split(' ')[1];
        lastTurn[cur] = 1;
        playerInfo[i].appendChild(document.createElement('td'));
        playerInfo[i].children[4].textContent = "1";
        playerInfo[i].appendChild(document.createElement('td'));
        playerInfo[i].children[5].textContent = "Loading";
    }
    mapObserver.observe(turncounter, { attributes: true, characterData: true, subtree: true });
    cities = [];
    generals = [];
}
function rewriteGame() {
    let deads = document.getElementsByClassName("dead");
    for (let dead of deads)
        for (let key in isAlive)
            if (dead.children[1].classList.contains(isAlive[key]))
                isAlive[key] = false;
    let gameMap = document.getElementById("gameMap").children[0];
    let X = gameMap.children.length;
    let Y = gameMap.children[0].children.length;
    for (let general of generals) {
        let pos = gameMap.children[general.x].children[general.y];
        if (!isAlive[general.color]) {
            pos.classList.remove("general", general.color);
            cities.push({ x: general.x, y: general.y });
        }
        else if (!pos.classList.contains("city") && !pos.classList.contains("general")) {
            pos.classList.add("general", general.color, "selected");
        }
    }
    for (let city of cities) {
        let pos = gameMap.children[city.x].children[city.y];
        if (!pos.classList.contains("city") && pos.classList.contains("obstacle")) {
            pos.classList.add("city");
            pos.classList.remove("obstacle");
        }
    }
    cities = [];
    generals = [];
    for (let x = 0; x < X; ++x) {
        for (let y = 0; y < Y; ++y) {
            let pos = gameMap.children[x].children[y];
            if (pos.classList.contains("city")) {
                cities.push({ x: x, y: y });
            }
            else if (pos.classList.contains("general")) {
                let color = getColor(pos);
                if (isAlive[color])
                    generals.push({ x: x, y: y, color: color });
            }
        }
    }
    let turncounter = document.getElementById("turn-counter").textContent;
    let gameTurn = Number(turncounter.match(/\d+/g)[0]);
    if (gameTurn === lastTurn.id)
        return;
    lastTurn.id = gameTurn;
    let playerInfo = document.getElementById("game-leaderboard").children[0].children;
    for (let i = 1, cur; i < playerInfo.length; ++i) {
        cur = playerInfo[i].children[1].className.split(' ')[1];
        let army = Number(playerInfo[i].children[2].textContent);
        let delta = army - lastTurn[cur];
        if (gameTurn % 25 !== 0 && delta > 0 &&
            delta - Number(playerInfo[i].children[4].textContent) <= 2) // I guess it's impossible to get more than 2 cities in one turn
            playerInfo[i].children[4].textContent = delta.toString();
        playerInfo[i].children[5].textContent = delta.toString();
        lastTurn[cur] = army;
    }
    for (let i = 1; i < playerInfo.length; ++i) {
        if (Number(playerInfo[i].children[5].textContent) > 0) {
            playerInfo[i].children[5].setAttribute("class", "");
            continue;
        }
        let isFighting = false;
        for (let j = 1; j < playerInfo.length; ++j)
            if (i !== j && playerInfo[i].children[5].textContent === playerInfo[j].children[5].textContent) {
                playerInfo[i].children[5].setAttribute("class", playerInfo[j].children[1].getAttribute("class"));
                isFighting = true;
                break;
            }
        if (!isFighting)
            playerInfo[i].children[5].setAttribute("class", "");
    }
}
function getColor(pos) {
    for (let color of GeneralsIOColors)
        if (pos.classList.contains(color))
            return color;
    return "meow";
}
startObserve();
