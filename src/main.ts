
/*
 * A generals.io game helper.
 *
 * GitHub Repo: https://github.com/AstralLing/generals.io-Helper
 */

const generalsioColors = ["red", "lightblue", "green", "teal", "orange", "pink", "purple", "maroon", "yellow", "brown", "blue", "purpleblue"];

// 颜色是否存活
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
  "purpleblue": false
};
// 上回合情况
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
  "purpleblue": 1,
  "id": 0
}
var cities: { x: number, y: number }[] = [];
var generals: { x: number, y: number, color: string }[] = [];
var turnObserver: MutationObserver;
var myColor: string;
var lboardCol: number;
var isTeamMode = false;

function startObserve(): void {
  let observeTarget = document.getElementById("react-container");
  let observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      mutation.addedNodes.forEach(function (added: any) {
        if (added.id === "game-page")
          setTimeout(meow, 233);
      });
      mutation.removedNodes.forEach(function (removed: any) {
        if (removed.id === "game-page")
          turnObserver.disconnect();
      });
    });
  });

  observer.observe(observeTarget, { childList: true, subtree: true });
}

function meow(): void {
  let turncounter = document.getElementById("turn-counter");
    let playerInfo = document.getElementById("game-leaderboard").children[0].children;
  turnObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.type === "characterData")
        rewriteGame();
    });
  });

  /**
   * 初始化计分板
   * 
   * Replay 中，会多一列 POV
   * 组队模式中，队名行默认少一列，通过额外添加星数统计补全
   * 
   * 倒数第 6 列：星数
   * 倒数第 5 列：昵称
   * 倒数第 4 列：兵力
   * 倒数第 3 列：土地数量
   * 倒数第 2 列：城市数量
   * 倒数第 1 列：兵力变化量
   */
  lboardCol = playerInfo[0].childElementCount + 2;
  playerInfo[0].appendChild(document.createElement('td'));
  playerInfo[0].children[lboardCol - 2].textContent = "City";
  playerInfo[0].appendChild(document.createElement('td'));
  playerInfo[0].children[lboardCol - 1].textContent = "Delta";

  for (let i = 1, cur: string, lastPos = -1; i < playerInfo.length; ++i) {
    if (playerInfo[i].childElementCount === lboardCol - 3) { // is team name
      isTeamMode = true;
      playerInfo[i].children[lboardCol - 6].removeAttribute("colspan");
      playerInfo[i].insertBefore(document.createElement('td'), playerInfo[i].children[lboardCol - 6]);
      playerInfo[i].children[lboardCol - 6].textContent = "0";
      playerInfo[i].appendChild(document.createElement('td'));
      playerInfo[i].children[lboardCol - 2].textContent = "1";
      playerInfo[i].appendChild(document.createElement('td'));
      playerInfo[i].children[lboardCol - 1].textContent = "Loading";
      lastPos = i; // lastPos 记录当前队伍表示队名的行编号
      continue;
    }
    cur = playerInfo[i].children[lboardCol - 5].className.split(' ')[1];
    playerInfo[i].appendChild(document.createElement('td'));
    playerInfo[i].children[lboardCol - 2].textContent = "1";
    playerInfo[i].appendChild(document.createElement('td'));
    playerInfo[i].children[lboardCol - 1].textContent = "Loading";
    lastTurn[cur] = 1, isAlive[cur] = true;

    if (lastPos !== -1) {
      let curStars = Number(playerInfo[i].children[lboardCol - 6].textContent.match(/\d+/g)[0]);
      playerInfo[lastPos].children[lboardCol - 6].textContent =
        (Number(playerInfo[lastPos].children[0].textContent) + curStars).toString();
    }
  }

  // 显示队伍星数
  for (let i = 1; i < playerInfo.length; ++i) {
    let colorful = document.createElement("span");
    colorful.setAttribute("style", "color: goldenrod");
    colorful.textContent = "★ ";
    if (playerInfo[i].children[lboardCol - 5].classList.contains("team-name"))
      playerInfo[i].children[lboardCol - 6].insertBefore(colorful, playerInfo[i].children[lboardCol - 6].firstChild);
  }

  // 获取自身颜色
  let gameMap = document.getElementById("gameMap").children[0];
  let X = gameMap.children.length;
  let Y = gameMap.children[0].children.length;
  for (let x = 0, flag = false; x < X; ++x) {
    for (let y = 0; y < Y; ++y) {
      let pos = gameMap.children[x].children[y];
      if (pos.classList.contains("selectable"))
        for (let color of generalsioColors)
          if (pos.classList.contains(color)) {
            myColor = color;
            flag = true;
            break;
          }
      if (flag)
        break;
    }
    if (flag)
      break;
  }

  document.onkeyup = function (event) {
    if (document.activeElement.id == "chatroom-input") return false;
    var e = event || window.event || arguments.callee.caller.arguments[0];
    if (e && e.keyCode == 66) // B
      expandArea();
  }

  turnObserver.observe(turncounter, { attributes: true, characterData: true, subtree: true });

  cities = [];
  generals = [];
}

startObserve();