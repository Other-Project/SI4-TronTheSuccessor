const moves = ["KEEP_GOING", "LIGHT_RIGHT", "HEAVY_RIGHT", "NONE", "HEAVY_LEFT", "LIGHT_LEFT"];

let direction;
let gameBoard;
let allAdjacent;

// Utils

function isValid(x, y) {
    return y >= 0 && y < 9 && x >= 0 && x < (y % 2 === 0 ? 16 : 15);
}

function get(list, x, y) {
    return list[y] >> x & 1;
}

function set(list, x, y, v) {
    list[y] = (list[y] & ~(1 << x)) | (v << x);
}

function toPrettyString(list) {
    return Array.from(list)
        .map(y => y.toString(2)
            .padStart(16, "0")
            .split("")
            .reverse()
            .join(" ")
        ).map((y, i) => i % 2 === 0 ? y : " " + y.substring(0, 29))
        .join("\n");
}

// Exports

async function setup(playersState) {
    gameBoard = new Uint16Array(9);
    allAdjacent = getAllAdjacentForGrid();

    set(gameBoard, playersState.playerPosition.column - 1, playersState.playerPosition.row - 1, 1);
    set(gameBoard, playersState.opponentPosition.column - 1, playersState.opponentPosition.row - 1, 1);
    direction = playersState.playerPosition.column === 1 ? 3 : 0;

    mcts = new MonteCarlo(Math.sqrt(2));
    state = new State([
        new Play(playersState.playerPosition.row - 1, playersState.playerPosition.column - 1),
        new Play(playersState.opponentPosition.row - 1, playersState.opponentPosition.column - 1)
    ], new Uint16Array(gameBoard), -1);

    const searchStats = mcts.runSearch(state, 0.925);
    console.log("MCTS_stats:", searchStats);

    let stats = mcts.getStats(state);
    console.debug(stats);
    state = null;

    return true;
}

async function nextMove(playersState) {
    set(gameBoard, playersState.playerPosition.column - 1, playersState.playerPosition.row - 1, 1);
    set(gameBoard, playersState.opponentPosition.column - 1, playersState.opponentPosition.row - 1, 1);
    let coord = determineNextBestMoveMonte(playersState);
    if (coord < 0) {
        console.warn("Decision making didn't return a move, falling back to any non-killing move");
        // Do any non-killing move
        const nonKillingMove = getPossibleMovesArray([playersState.playerPosition.column - 1, playersState.playerPosition.row - 1], gameBoard)[0];
        if (!nonKillingMove) coord = -1; // The player is doomed, we just fall back to KEEP_GOING
        else coord = allAdjacent[playersState.playerPosition.row - 1][playersState.playerPosition.column - 1].indexOf(nonKillingMove);
    }

    const move = (coord - direction + 6) % 6;
    console.log("current_direction: ", direction, "next_hex: ", coord, "move_to_hex: ", moves[move]);
    if (coord < 0 || moves[move] === "NONE") {
        console.warn("Wrong move (coord:", coord, ", move:", move, ")");
        console.warn("adjacent_hexagons: ", allAdjacent[playersState.playerPosition.row - 1][playersState.playerPosition.column - 1]);
        return moves[0];
    }
    direction = coord;
    return moves[move];
}

if (typeof exports !== "undefined") { // CommonJS
    exports.setup = setup;
    exports.nextMove = nextMove;
}


// Decisions making

let mcts;
let state;

function determineNextBestMoveMonte(playersState) {
    if (!isValid(playersState.opponentPosition.column - 1, playersState.opponentPosition.row - 1)) return -1;

    state = nextState(
        nextState(state, new Play(playersState.playerPosition.row - 1, playersState.playerPosition.column - 1)),
        new Play(playersState.opponentPosition.row - 1, playersState.opponentPosition.column - 1));

    console.debug(toPrettyString(gameBoard));

    const searchStats = mcts.runSearch(state, 0.175);
    console.log("Search_stats:", JSON.stringify(searchStats));

    let stats = mcts.getStats(state);
    console.debug("State_stats:", stats);

    const bestMove = mcts.bestPlay(state, "robust");
    console.log("best_move:", JSON.stringify(bestMove));
    if (!bestMove) return -1;
    return allAdjacent[playersState.playerPosition.row - 1][playersState.playerPosition.column - 1].findIndex(m => m[0] === bestMove.col && m[1] === bestMove.row);
}

/** Class representing a game state. */
class State {
    constructor(playHistory, board, player) {
        this.playHistory = playHistory;
        this.board = board;
        this.player = player;
    }

    isPlayer(player) {
        return (player === this.player);
    }

    getMove() {
        return this.playHistory[this.playHistory.length - 1];
    }

    getOpponentMove() {
        return this.playHistory[this.playHistory.length - 2];
    }

    hash() {
        return JSON.stringify(this.playHistory);
    }
}

/** Class representing a state transition. */
class Play {
    constructor(row, col) {
        this.row = row;
        this.col = col;
    }

    hash() {
        return this.row.toString() + "," + this.col.toString();
    }
}

/**
 * Class representing a node in the search tree.
 * Stores tree search stats for UCB1.
 */
class MonteCarloNode {
    /**
     * Create a new MonteCarloNode in the search tree.
     * @param {MonteCarloNode} parent - The parent node.
     * @param {Play} play - Last play played to get to this state.
     * @param {State} state - The corresponding state.
     * @param {Play[]} unexpandedPlays - The node's unexpanded child plays.
     */
    constructor(parent, play, state, unexpandedPlays) {
        this.play = play;
        this.state = state;

        // Monte Carlo stuff
        this.n_plays = 0;
        this.n_wins = 0;

        // Tree stuff
        this.parent = parent;
        this.children = new Map();
        for (let play of unexpandedPlays) {
            this.children.set(play.hash(), {play: play, node: null});
        }
    }

    /**
     * Get the MonteCarloNode corresponding to the given play.
     * @param {Play} play - The play leading to the child node.
     * @return {MonteCarloNode} The child node corresponding to the play given.
     */
    childNode(play) {
        let child = this.children.get(play.hash());
        if (child === undefined) {
            throw new Error("No such play!");
        } else if (child.node === null) {
            throw new Error("Child is not expanded!");
        }
        return child.node;
    }

    /**
     * Expand the specified child play and return the new child node.
     * Add the node to the array of children nodes.
     * Remove the play from the array of unexpanded plays.
     * @param {Play} play - The play to expand.
     * @param {State} childState - The child state corresponding to the given play.
     * @param {Play[]} unexpandedPlays - The given child's unexpanded child plays; typically all of them.
     * @return {MonteCarloNode} The new child node.
     */
    expand(play, childState, unexpandedPlays) {
        if (!this.children.has(play.hash())) throw new Error("No such play!");
        let childNode = new MonteCarloNode(this, play, childState, unexpandedPlays);
        this.children.set(play.hash(), {play: play, node: childNode});
        return childNode;
    }

    /**
     * Get all legal plays from this node.
     * @return {Play[]} All plays.
     */
    allPlays() {
        let ret = [];
        for (let child of this.children.values()) {
            ret.push(child.play);
        }
        return ret;
    }

    /**
     * Get all unexpanded legal plays from this node.
     * @return {Play[]} All unexpanded plays.
     */
    unexpandedPlays() {
        let ret = [];
        for (let child of this.children.values()) {
            if (child.node === null) ret.push(child.play);
        }
        return ret;
    }

    /**
     * Whether this node is fully expanded.
     * @return {boolean} Whether this node is fully expanded.
     */
    isFullyExpanded() {
        for (let child of this.children.values()) {
            if (child.node === null) return false;
        }
        return true;
    }

    /**
     * Whether this node is terminal in the game tree, NOT INCLUSIVE of termination due to winning.
     * @return {boolean} Whether this node is a leaf in the tree.
     */
    isLeaf() {
        return this.children.size === 0;
    }

    /**
     * Get the UCB1 value for this node.
     * @param {number} biasParam - The square of the bias parameter in the UCB1 algorithm, defaults to 2.
     * @return {number} The UCB1 value of this node.
     */
    getUCB1(biasParam) {
        return (this.n_wins / this.n_plays) + Math.sqrt(biasParam * Math.log(this.parent.n_plays) / this.n_plays);
    }
}

/**
 * Class representing the Monte Carlo search tree.
 * Handles the four MCTS steps: selection, expansion, simulation, backpropagation.
 * Handles best-move selection.
 */
class MonteCarlo {
    /** @type {Map<string, MonteCarloNode>} */ nodes;

    /**
     * Create a Monte Carlo search tree.
     * @param {number} UCB1ExploreParam - The square of the bias parameter in the UCB1 algorithm; defaults to 2.
     */
    constructor(UCB1ExploreParam = 2) {
        this.UCB1ExploreParam = UCB1ExploreParam;
        this.nodes = new Map();
    }

    /**
     * If state does not exist, create dangling node.
     * @param {State} state - The state to make a dangling node for; its parent is set to null.
     */
    makeNode(state) {
        if (!this.nodes.has(state.hash())) {
            let unexpandedPlays = legalPlays(state).slice();
            let node = new MonteCarloNode(null, null, state, unexpandedPlays);
            this.nodes.set(state.hash(), node);
        }
    }

    /**
     * From given state, run as many simulations as possible until the time limit, building statistics.
     * @param {State} state - The state to run the search from.
     * @param {number} timeout - The time to run the simulations for, in seconds.
     * @return {Object} Search statistics.
     */
    runSearch(state, timeout = 1) {
        this.makeNode(state);

        let draws = 0;
        let totalSims = 0;

        let end = Date.now() + timeout * 1000;

        while (Date.now() < end) {
            let node = this.select(state);
            let winner = getWinner(node.state);

            if (node.isLeaf() === false && winner === null) {
                node = this.expand(node);
                winner = this.simulate(node);
            }
            this.backpropagate(node, winner);

            if (winner === 0) draws++;
            totalSims++;
        }

        return {target_runtime: timeout, real_runtime: timeout + (Date.now() - end) / 1000, simulations: totalSims, draws: draws};
    }

    /**
     * From the available statistics, calculate the best move from the given state.
     * @param {State} state - The state to get the best play from.
     * @param {"robust"|"max"} policy - The selection policy for the "best" play.
     * @return {Play} The best play, according to the given policy.
     */
    bestPlay(state, policy = "robust") {
        this.makeNode(state);

        // If not all children are expanded, not enough information
        if (this.nodes.get(state.hash()).isFullyExpanded() === false) {
            console.warn("Not enough information!");
            return null;
        }

        let node = this.nodes.get(state.hash());
        let allPlays = node.allPlays();
        let bestPlay;

        // Most visits (robust child)
        if (policy === "robust") {
            let max = -Infinity;
            for (let play of allPlays) {
                let childNode = node.childNode(play);
                if (childNode.n_plays > max) {
                    bestPlay = play;
                    max = childNode.n_plays;
                }
            }
        }

        // Highest winrate (max child)
        else if (policy === "max") {
            let max = -Infinity;
            for (let play of allPlays) {
                let childNode = node.childNode(play);
                let ratio = childNode.n_wins / childNode.n_plays;
                if (ratio > max) {
                    bestPlay = play;
                    max = ratio;
                }
            }
        }

        return bestPlay;
    }

    /**
     * Phase 1: Selection
     * Select until EITHER not fully expanded OR leaf node
     * @param {State} state - The root state to start selection from.
     * @return {MonteCarloNode} The selected node.
     */
    select(state) {
        let node = this.nodes.get(state.hash());
        while (node.isFullyExpanded() && !node.isLeaf()) {
            let plays = node.allPlays();
            let bestPlay = null;
            let bestUCB1 = -Infinity;
            for (let play of plays) {
                let childUCB1 = node.childNode(play).getUCB1(this.UCB1ExploreParam);
                if (childUCB1 > bestUCB1) {
                    bestPlay = play;
                    bestUCB1 = childUCB1;
                }
            }
            node = node.childNode(bestPlay);
        }
        return node;
    }

    /**
     * Phase 2: Expansion
     * Of the given node, expand a random unexpanded child node
     * @param {MonteCarloNode} node - The node to expand from. Assume not leaf.
     * @return {MonteCarloNode} The new expanded child node.
     */
    expand(node) {
        let plays = node.unexpandedPlays();
        let index = Math.floor(Math.random() * plays.length);
        let play = plays[index];

        let childState = nextState(node.state, play);
        let childUnexpandedPlays = legalPlays(childState);
        let childNode = node.expand(play, childState, childUnexpandedPlays);
        this.nodes.set(childState.hash(), childNode);

        return childNode;
    }

    /**
     * Phase 3: Simulation
     * From given node, play the game until a terminal state, then return winner
     * @param {MonteCarloNode} node - The node to simulate from.
     * @return {number} The winner of the terminal game state.
     */
    simulate(node) {
        let state = node.state;
        let winner = getWinner(state);

        while (winner === null) {
            let plays = legalPlays(state);
            let play = plays[Math.floor(Math.random() * plays.length)];
            if (!state || !play) {
                console.warn(state, plays, "\n", toPrettyString(state.board));
                break;
            }
            state = nextState(state, play);
            winner = getWinner(state);
        }

        return winner;
    }

    /**
     * Phase 4: Backpropagation
     * From given node, propagate plays and winner to ancestors' statistics
     * @param {MonteCarloNode} node - The node to backpropagate from. Typically, leaf.
     * @param {number} winner - The winner to propagate.
     */
    backpropagate(node, winner) {
        while (node !== null) {
            node.n_plays += 1;
            // Parent's choice
            if (node.state.isPlayer(winner)) {
                node.n_wins += 1;
            }
            node = node.parent;
        }
    }

    // Utility & debugging methods

    /**
     * Return MCTS statistics for this node and children nodes
     * @param {State} state - The state to get statistics for.
     * @return {Object} The MCTS statistics.
     */
    getStats(state) {
        let node = this.nodes.get(state.hash()).parent;
        if (!node) return null;
        let stats = {n_plays: node.n_plays, n_wins: node.n_wins, children: []};
        for (let child of node.children.values()) {
            if (child.node === null) stats.children.push({play: child.play, n_plays: null, n_wins: null});
            else stats.children.push({play: child.play, n_plays: child.node.n_plays, n_wins: child.node.n_wins});
        }
        return stats;
    }
}

/** Advance the given state and return it. */
function nextState(state, play) {
    if (!state) return new State([play], new Uint16Array(gameBoard), 1);

    let newHistory = state.playHistory.slice(); // shallow copy
    newHistory.push(play);
    let newBoard = new Uint16Array(state.board);
    set(newBoard, play.col, play.row, 1);
    let newPlayer = -state.player;
    return new State(newHistory, newBoard, newPlayer);
}

function legalPlays(state) {
    const move = state.getOpponentMove();
    const playerMoves = getPossibleMovesArray([move.col, move.row], state.board);
    return playerMoves.map(move => new Play(move[1], move[0]));
}

/**
 *
 * @param {State} state
 * @returns {number|null}
 */
function getWinner(state) {
    const move = state.getMove();
    const opponentMove = state.getOpponentMove();
    const playerMoves = getPossibleMovesArray([move.col, move.row], state.board);
    const opponentMoves = getPossibleMovesArray([opponentMove.col, opponentMove.row], state.board);
    if (playerMoves.length === 0 && opponentMoves.length === 0) return 0;
    if (playerMoves.length === 0) return -state.player;
    if (opponentMoves.length === 0) return state.player;
    else return null;
}

// Grid management

function getPossibleMovesArray(playerPosition, board) {
    let adjacentHex = allAdjacent[playerPosition[1]][playerPosition[0]];
    return adjacentHex.filter(([x, y]) => isValid(x, y) && !get(board, x, y));
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
    allAdjacent = Array.from(Array(9), (_, i) => Array(i % 2 === 0 ? 16 : 15).fill([]));
    for (let y = 0; y < 9; y++)
        for (let x = 0; x < 16; x++)
            allAdjacent[y][x] = getAdjacent(x, y);
    return allAdjacent;
}
