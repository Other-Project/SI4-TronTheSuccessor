class TronBot {
    gameTurn = 0;
    pathHistory = [];

    constructor(gridWidth, gridHeight) {
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
    }

    /**
     * Returns the neighbors of a given position
     * @param x The x position (0-based)
     * @param y The y position (0-based)
     * @returns {{x: number, y: number}[]} The neighbors
     */
    getNeighbors(x, y) {
        if (!isValid(x, y)) return [];
        return allAdjacent[y][x].filter(([x, y]) => isValid(x, y)).map(([x, y]) => ({x, y}));
    }

    /**
     * Returns the free neighbors of a given position
     * @param x The x position (0-based)
     * @param y The y position (0-based)
     * @returns {{x: number, y: number}[]} The free neighbors
     */
    getFreeNeighbors(x, y) {
        return this.getNeighbors(x, y).filter(cell => !get(gameBoard, cell.x, cell.y));
    }

    /**
     * Checks if a position can be reached from another
     * @param start The starting position
     * @param dest The destination position
     * @returns {boolean} Whether the destination can be reached from the starting position
     */
    canReachPosition(start, dest) {
        let queue = [start];
        let visited = new Set();
        visited.add(`${start.x},${start.y}`);

        while (queue.length > 0) {
            let {x, y} = queue.shift();
            for (let neighbor of this.getNeighbors(x, y)) {
                if (neighbor.x === dest.x && neighbor.y === dest.y) return true;

                let key = `${neighbor.x},${neighbor.y}`;
                if (visited.has(key) || get(gameBoard, neighbor.x, neighbor.y)) continue;
                visited.add(key);
                queue.push(neighbor);
            }
        }
        return false;
    }

    //region Flood-fill algorithm

    /**
     * Returns the area reachable from a given position
     * @remarks Uses a flood-fill algorithm
     * @param {{x: number, y: number}} start The starting position
     * @returns {number} The area reachable from the starting position
     */
    reachableArea(start) {
        let queue = [start];
        let visited = new Set();

        let area = 0;
        while (queue.length > 0) {
            let {x, y} = queue.shift();
            area++;
            for (let neighbor of this.getFreeNeighbors(x, y)) {
                let key = `${neighbor.x},${neighbor.y}`;
                if (visited.has(key)) continue;
                visited.add(key);
                queue.push(neighbor);
            }
        }
        return area;
    }

    /**
     * Implementation of the flooding algorithm
     * @param neighbors The neighbors to consider
     * @returns {{x: number, y: number}[]} The best moves
     */

    floodingAlgorithm(neighbors) {
        const scores = Array(neighbors.length);
        for (let i = 0; i < neighbors.length; i++)
            scores[i] = this.reachableArea(neighbors[i]);

        let maxScore = Math.max(...scores);
        let bestMoves = [];
        for (let i = 0; i < neighbors.length; i++)
            if (scores[i] === maxScore)
                bestMoves.push(neighbors[i]);
        return bestMoves;
    }

    //endregion

    //region First arrived algorithm

    /**
     * Performs a BFS to calculate the shortest distance from the start position to each cell.
     * @param {Object} start - The starting position {x, y}.
     * @returns {Map<string, number>} A map of cell positions to their shortest distances.
     */
    bfsShortestDistance(start) {
        let queue = [start];
        let distances = new Map();
        distances.set(`${start.x},${start.y}`, 0);

        while (queue.length > 0) {
            let {x, y} = queue.shift();
            let currentDistance = distances.get(`${x},${y}`);

            for (let neighbor of this.getFreeNeighbors(x, y)) {
                let key = `${neighbor.x},${neighbor.y}`;
                if (!distances.has(key)) {
                    distances.set(key, currentDistance + 1);
                    queue.push(neighbor);
                }
            }
        }
        return distances;
    }

    /**
     * Counts the number of cells the bot can reach before the opponent.
     * @param {Object} botPosition - The bot's position {x, y}.
     * @param {Object} opponentPosition - The opponent's position {x, y}.
     * @returns {number} The number of cells the bot can reach before the opponent.
     */
    countCellsReachableBeforeOpponent(botPosition, opponentPosition) {
        let botDistances = this.bfsShortestDistance(botPosition);
        let opponentDistances = this.bfsShortestDistance(opponentPosition);

        let count = 0;
        for (let [key, botDistance] of botDistances.entries()) {
            let opponentDistance = opponentDistances.get(key);
            if (opponentDistance === undefined || botDistance < opponentDistance) count++;
            else if (botDistance === opponentDistance) count += 0.5;
        }
        return count;
    }

    firstArrivedAlgorithm(neighbors, opponent) {
        const scores = [];
        for (let i = 0; i < neighbors.length; i++)
            for (let opponentMove of this.getFreeNeighbors(opponent.x, opponent.y))
                scores[i] = Math.min(this.countCellsReachableBeforeOpponent(neighbors[i], opponentMove), scores[i] ?? Infinity);

        console.dir(scores);
        let maxScore = Math.max(...scores);
        let bestMoves = [];
        for (let i = 0; i < neighbors.length; i++)
            if (scores[i] === maxScore)
                bestMoves.push(neighbors[i]);
        return bestMoves;
    }

    //endregion

    //region Filling algorithm

    /**
     * Recursive helper function for finding articulation points
     * @param {{x:number, y: number}} position The current position
     * @param {string} parentKey The parent key
     * @param {Object} discovery The discovery counts
     * @param {Object} low The low values
     * @param {Object} visited The visited nodes
     * @param {Set<string>} articulationPoints The articulation points
     * @param {number} count The current count
     */
    findArticulationPointsHelper(position, parentKey, discovery, low, visited, articulationPoints, count) {
        const key = `${position.x},${position.y}`;
        visited[key] = true;
        discovery[key] = low[key] = count++;

        let children = 0;
        for (let neighbor of this.getFreeNeighbors(position.x, position.y)) {
            let neighborKey = `${neighbor.x},${neighbor.y}`;
            if (!visited[neighborKey]) {
                children++;
                this.findArticulationPointsHelper(neighbor, key, discovery, low, visited, articulationPoints, count);
                low[key] = Math.min(low[key], low[neighborKey]);

                if (parentKey && low[neighborKey] >= discovery[key]) articulationPoints.add(key);

            } else low[key] = Math.min(low[key], discovery[neighborKey]);
        }

        if (parentKey === null && children > 1) articulationPoints.add(key);
    }

    /**
     * Finds the articulation points in the graph
     * @param {{x:number, y: number}} markedAsVisited The nodes to mark as visited
     * @returns {Set<string>} A set of articulation points' keys
     */
    findArticulationPoints(...markedAsVisited) {
        let discovery = {};
        let low = {};
        let visited = {};
        for (let node of markedAsVisited) visited[`${node.x},${node.y}`] = true;
        let articulationPoints = new Set();

        this.findArticulationPointsHelper(markedAsVisited[markedAsVisited.length - 1], null, discovery, low, visited, articulationPoints, 0);
        return articulationPoints;
    }

    /**
     * Recursive helper function for finding the maximum number of articulation points
     * @param {number} depth The depth of the search
     * @param {{x: number, y: number}} path The current path
     * @returns {number} The maximum number of articulation points
     */
    maxArticulationPoints(depth, ...path) {
        if (depth === 0) return 0;
        let articulationPoints = this.findArticulationPoints(...path);
        let mx = articulationPoints.size;
        let moves = this.getFreeNeighbors(path[path.length - 1].x, path[path.length - 1].y)
            .filter(move => !articulationPoints.has(`${move.x},${move.y}`) && !path.some(p => p.x === move.x && p.y === move.y));
        if (moves.length === 0) return Infinity;

        let finiteMove = false;
        for (let move of moves) {
            let maxArt = this.maxArticulationPoints(depth - 1, ...path, move);
            if (maxArt === Infinity) continue;
            mx = Math.max(mx, articulationPoints.size + maxArt);
            finiteMove = true;
        }
        return finiteMove ? mx : Infinity;
    }

    /**
     * Handles the case where multiple moves have the same number of articulation points
     * @param {{x:number, y: number}} position The position of the bot
     * @param {{x:number, y: number}[]} equalMoves The moves with the same number of articulation points
     * @returns {{x:number, y: number}[]} The best moves
     */
    handleEqualFilling(position, equalMoves) {
        let minPossibleMoves = Infinity;
        let bestMoves = [];
        for (let move of equalMoves) {
            let possibleMoves = this.getFreeNeighbors(move.x, move.y).length;
            let isWallOrTrail = this.isWallOrTrail(move.x, move.y);
            if (possibleMoves < minPossibleMoves || (possibleMoves === minPossibleMoves && isWallOrTrail)) {
                minPossibleMoves = possibleMoves;
                bestMoves = [move];
            }
        }
        return bestMoves;
    }

    /**
     * Checks if a position is next to a wall or trail
     * @param {number} x The x position (0-based)
     * @param {number} y The y position (0-based)
     * @returns {boolean} Whether the position is next to a wall or trail
     */
    isWallOrTrail(x, y) {
        if (x === 0 || y === 0 || x === this.gridWidth - 1 || y === this.gridHeight - 1) return true;
        for (let neighbor of this.getNeighbors(x, y))
            if (get(gameBoard, neighbor.x, neighbor.y))
                return true;
        return false;
    }

    /**
     * Implementation of the filling algorithm used to avoid articulation points and thus *trying* to avoid getting trapped
     * @param {{x:number, y: number}} position The position of the bot
     * @param {{x:number, y: number}[]} neighbors The neighbors to consider
     * @returns {{x:number, y: number}[]} The best moves
     */
    fillingAlgorithm(position, neighbors) {
        let articulationPoints = this.findArticulationPoints(position);
        let bestMoves = neighbors.filter(move => !articulationPoints.has(`${move.x},${move.y}`));
        if (bestMoves.length === 0) return neighbors; // All nodes are articulation points

        let maxArticulationPoints = [];
        for (let move of bestMoves) {
            maxArticulationPoints.push(this.maxArticulationPoints(4, position, move));
        }

        let minArticulationPoints = Math.min(...maxArticulationPoints);
        let equalMoves = bestMoves.filter((m, i) => maxArticulationPoints[i] === minArticulationPoints);
        return equalMoves.length > 1 ? this.handleEqualFilling(position, equalMoves) : equalMoves;
    }

    monteResults = new Map();
    monteSimCount = 0;

    /**
     * Monte Carlo search for the longest path
     * @param {number} maxTime The maximum time to run the simulation
     * @param {{x: number, y: number}[]} startPath The starting path
     * @param {{x: number, y: number}[]} neighbors The neighbors to consider
     * @returns {{x: number, y: number}[]} The longest paths
     */
    monteSearchLongestPath(maxTime, startPath, neighbors) {
        if (this.monteResults.size === 0) this.monteResults.set(startPath[startPath.length - 1], 0);
        let startTime = Date.now();

        let simulationCount = 0;
        while (Date.now() - startTime < maxTime) {
            let path = structuredClone(startPath);
            let current = startPath[startPath.length - 1];
            while (true) {
                let neighbors = this.getFreeNeighbors(current.x, current.y).filter(move => !path.some(p => p.x === move.x && p.y === move.y));

                let articulationPoints = this.findArticulationPoints(current, ...path);
                let bestMoves = neighbors.filter(move => !articulationPoints.has(`${move.x},${move.y}`));
                if (bestMoves.length > 0) neighbors = bestMoves; // All nodes are articulation points

                if (neighbors.length === 0) break;
                let next = neighbors[Math.floor(Math.random() * neighbors.length)];
                path.push(next);
                current = next;
            }
            simulationCount++;
            for (let i = startPath.length; i < path.length; i++) {
                let longestPath = path.slice(i);
                let key = `${path[i].x},${path[i].y}`;
                let prevScore = this.monteResults.get(key)?.length ?? 0;
                if (longestPath.length > prevScore) this.monteResults.set(key, longestPath);
            }
        }
        this.monteSimCount += simulationCount;

        let maxScore = 0;
        let bestPath = [];
        for (let neighbor of neighbors) {
            let path = this.monteResults.get(`${neighbor.x},${neighbor.y}`);
            if (path && path.length > maxScore) {
                maxScore = path.length;
                bestPath = path;
            }
        }
        console.log("longest_path_length:", bestPath.length, "new_sim_cnt:", simulationCount + " / " + this.monteSimCount);
        return bestPath;
    }

    //endregion

    /**
     * Prioritizes moves that are closer to the center
     * @param {{x: number, y: number}} position The position of the bot
     * @param {{x: number, y: number}[]} neighbors The neighbors to consider
     * @returns {{x: number, y: number}[]} The best moves
     */
    goToCenterAlgorithm(position, neighbors) {
        const center = {x: Math.floor(this.gridWidth / 2), y: Math.floor(this.gridHeight / 2)};

        let bestMoves = [];
        let minDistance = Infinity;
        for (let move of neighbors) {
            let distance = Math.abs(move.x - center.x) + Math.abs(move.y - center.y);
            if (distance < minDistance) {
                minDistance = distance;
                bestMoves = [move];
            } else if (distance === minDistance) bestMoves.push(move);
        }
        return bestMoves;
    }

    /**
     * Decides the next move of the bot
     * @param position The position of the bot
     * @param opponent
     * @returns {*|{x: number, y: number}|null}
     */
    nextMove(position, opponent) {
        this.pathHistory.push(position);
        this.gameTurn++;
        let playableMoves = this.getFreeNeighbors(position.x, position.y);

        if (playableMoves.length === 0) {
            console.log("Decisive condition: bot can't move");
            return null; // No playable moves
        }

        if (this.getFreeNeighbors(opponent.x, opponent.y).length === 0) {
            console.log("Decisive condition: opponent can't move");
            return playableMoves[0]; // The opponent can't move, we can play any non-killing move
        }



        let canReachOpponent = playableMoves.some(move => this.canReachPosition(move, opponent));
        if (!canReachOpponent) {
            playableMoves = this.floodingAlgorithm(playableMoves); // Only keep the moves that leads to the largest area
            if (playableMoves.length === 1) {
                console.log("Decisive condition: can't reach opponent (largest area)");
                return playableMoves[0];
            }

            console.log("Decisive condition: can't reach opponent (filling)");
            return this.fillingAlgorithm(position, playableMoves)[0];
        }

        playableMoves = this.firstArrivedAlgorithm(playableMoves, opponent);
        if (playableMoves.length === 1) {
            console.log("Decisive condition: first-arrived");
            return playableMoves[0];
        }

        let center = {x: Math.floor(this.gridWidth / 2), y: Math.floor(this.gridHeight / 2)};
        if (this.gameTurn < 10 && get(gameBoard, center.x, center.y) === 0)
            playableMoves = this.goToCenterAlgorithm(position, playableMoves);

        if (playableMoves.length === 1) {
            console.log("Decisive condition: battle for the center");
            return playableMoves[0];
        }

        console.log("Decisive condition: none (first remaining move)");
        return playableMoves[0];
    }
}

//region Exports


const moves = ["KEEP_GOING", "LIGHT_RIGHT", "HEAVY_RIGHT", "NONE", "HEAVY_LEFT", "LIGHT_LEFT"];
const allAdjacent = getAllAdjacentForGrid();

let gameBoard;
let bot;
let oldStates;

async function setup(playersState) {
    gameBoard = new Uint16Array(9);
    bot = new TronBot(16, 9);

    set(gameBoard, playersState.playerPosition.column - 1, playersState.playerPosition.row - 1, 1);
    set(gameBoard, playersState.opponentPosition.column - 1, playersState.opponentPosition.row - 1, 1);
    oldStates = null;
    return true;
}

async function nextMove(playersState) {
    const direction = getDirection(playersState.playerPosition, oldStates?.playerPosition);
    const opponentDirection = getDirection(playersState.opponentPosition, oldStates?.opponentPosition);
    oldStates = playersState;
    const playerPos = {
        x: playersState.playerPosition.column - 1,
        y: playersState.playerPosition.row - 1
    };
    const opponentPos = {
        x: playersState.opponentPosition.column - 1,
        y: playersState.opponentPosition.row - 1
    };

    set(gameBoard, playerPos.x, playerPos.y, 1);
    set(gameBoard, opponentPos.x, opponentPos.y, 1);
    console.log(toPrettyString(gameBoard, [playerPos, opponentPos], [direction, opponentDirection]));

    let nextMove = bot.nextMove(playerPos, opponentPos);
    console.dir(nextMove);
    let coord = nextMove ? allAdjacent[playerPos.y][playerPos.x]?.findIndex(m => m[0] === nextMove.x && m[1] === nextMove.y) : null;
    coord ??= -1;

    if (coord < 0) { // Shouldn't happen anymore
        console.warn("Decision making didn't return a move, falling back to any non-killing move");
        console.dir(nextMove);
        console.dir(allAdjacent[playerPos.y][playerPos.x]);

        // Do any non-killing move
        const nonKillingMove = allAdjacent[playerPos.y][playerPos.x].find(([x, y]) => isValid(x, y) && !get(gameBoard, x, y));
        if (!nonKillingMove) coord = -1; // The player is doomed, we just fall back to KEEP_GOING
        else coord = allAdjacent[playerPos.y][playerPos.x].indexOf(nonKillingMove);
    }

    const move = (coord - direction + 6) % 6;
    console.log("current_direction: ", direction, "next_hex: ", coord, "move_to_hex: ", moves[move]);
    if (coord < 0 || moves[move] === "NONE") {
        console.warn("Wrong move (coord:", coord, ", move:", move, ")");
        console.warn("adjacent_hexagons: ", allAdjacent[playerPos.y][playerPos.x]);
        return moves[0];
    }
    return moves[move];

}

exports.setup = setup;
exports.nextMove = nextMove;

//endregion


//region Board manipulation

/**
 * Is the given position valid
 * @param {number} x The x position (0-based)
 * @param {number} y The y position (0-based)
 * @returns {boolean}
 */
function isValid(x, y) {
    return y >= 0 && y < 9 && x >= 0 && x < (y % 2 === 0 ? 16 : 15);
}

/**
 * Gets the value of the cell at a given position
 * @param {Uint16Array} board The game board to look in
 * @param {number} x The x position (0-based)
 * @param {number} y The y position (0-based)
 * @returns {0|1} The value of the cell
 */
function get(board, x, y) {
    return board[y] >> x & 1;
}

/**
 * Sets the value of the cell at a given position
 * @param {Uint16Array} board The game board to modify
 * @param {number} x The x position (0-based)
 * @param {number} y The y position (0-based)
 * @param {0|1} v The value to set
 */
function set(board, x, y, v) {
    board[y] = (board[y] & ~(1 << x)) | (v << x);
}

/**
 * Gets a printable version of the board
 * @param {Uint16Array} board The game board to stringify
 * @param {{x:number, y:number}[]} positions The current positions of the players
 * @param {number[]} directions The directions of the players
 * @returns {string} The pretty string representation of the board
 */
function toPrettyString(board, positions = undefined, directions = undefined) {
    const dirSymbols = ["←", "↖", "↗", "→", "↘", "↙"];

    function cellRepr(x, y) {
        if (!get(board, x, y)) return ".";
        let index = positions.findIndex(p => p.x === x && p.y === y);
        if (index < 0) return "+";
        return directions ? dirSymbols[directions[index]] : (index + 1).toString();
    }

    let res = "";
    for (let y = 0; y < board.length; y++) {
        if (y > 0) res += "\n";
        for (let x = 0; x < (y % 2 === 0 ? 16 : 15); x++) {
            if (x > 0 || y % 2) res += " ";
            res += cellRepr(x, y);
        }
    }
    return res;
}

//endregion

function getDirection(currentPos, lastPos) {
    if (!lastPos) return currentPos.column === 1 ? 3 : 0;
    return allAdjacent[lastPos.row - 1][lastPos.column - 1].findIndex(m => m[0] === currentPos.column - 1 && m[1] === currentPos.row - 1);
}

function getAdjacent(x, y) {
    let adjacent = [];
    if (y % 2 === 0) {
        adjacent.push([x - 1, y]); // left
        adjacent.push([x - 1, y - 1]); // up_left
        adjacent.push([x, y - 1]); // up_right
        adjacent.push([x + 1, y]); // right
        adjacent.push([x, y + 1]); // down_right
        adjacent.push([x - 1, y + 1]); // down_left
    } else {
        adjacent.push([x - 1, y]); // left
        adjacent.push([x, y - 1]); // up_left
        adjacent.push([x + 1, y - 1]); // up_right
        adjacent.push([x + 1, y]); // right
        adjacent.push([x + 1, y + 1]); // down_right
        adjacent.push([x, y + 1]); // down_left
    }
    return adjacent;
}

function getAllAdjacentForGrid() {
    let allAdjacent = Array.from(Array(9), (_, i) => Array(i % 2 === 0 ? 16 : 15).fill([]));
    for (let y = 0; y < 9; y++)
        for (let x = 0; x < allAdjacent[y].length; x++)
            allAdjacent[y][x] = getAdjacent(x, y);
    return allAdjacent;
}
