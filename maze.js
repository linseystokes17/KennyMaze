/*********Global Variables************** */

let startTime = Date.now();
let inputBuffer = {};
let canvas = null;
let context = null;

const COORD_SIZE = 2048;

let score = 0;
let maze = [];
let imgFloor = new Image();
imgFloor.isReady = false;
imgFloor.onload = function () {
    this.isReady = true;
};
imgFloor.src = 'floor.png';

//maze holds the edge values
//call maze[row][column]

/*********Global Variables************** */

//https://en.wikipedia.org/wiki/Breadth-first_search
function shortestPath(position) {
    var q = [];
    var results = [];
    var p = maze[position.x][position.y];

    p.discovered = true; //label as discovered
    q.push(p);
    while(q.length>0){
        for( i=0; i< q.length; i++){
            var n = q.shift();
            if(n == maze[mazeSize.size-1][mazeSize.size-1]){
                results.push(n);
                return results;
            }
            
            if(n.edges.n!=null){
                q.push(n.edges.n);
            }
            if(n.edges.e!=null){
                q.push(n.edges.e);
            }
            if(n.edges.s!=null){
                q.push(n.edges.s);
            }
            if(n.edges.w!=null){
                q.push(n.edges.w);
            }
        }
    }
    return results;
}


function genArray() {
    var walls = [];
    var cells = [];
    var inMaze = [];
    for (let row = 0; row < mazeSize.size; row++) {
        inMaze.push([]);
        for (let col = 0; col < mazeSize.size; col++) {
            inMaze[row].push({
                x: col,
                y: row,
                visited: false,
                discovered: false, 
                parent: '',
                edges: {
                    n: null,
                    s: null,
                    w: null,
                    e: null
                }
            });
        }
    }

    //pick first cell and add to inMaze, walls added to wall list
    current = inMaze[0][0];
    current.visited = true;
    cells.push(inMaze[0][1], inMaze[1][0]);
    walls.push(inMaze[0][0], inMaze[0][0]);

    //while there are walls in the list
    while (cells.length > 0 && walls.length > 0) {
        //pick a random wall
        var randomInt = Math.floor(Math.random() * cells.length);

        //if only one of 2 cells is unvisited
        if (cells[randomInt].visited == false || walls[randomInt].visited == false) {
            newx = cells[randomInt].x; //0
            newy = cells[randomInt].y; //2
            currx = walls[randomInt].x; //0
            curry = walls[randomInt].y; //1

            //make the wall a passage
            if (newx - currx == 1) {
                inMaze[curry][currx].edges.e = inMaze[newy][newx];
                inMaze[newy][newx].edges.w = inMaze[curry][currx];
            }
            if (currx - newx == 1) {
                inMaze[curry][currx].edges.w = inMaze[newy][newx];
                inMaze[newy][newx].edges.e = inMaze[curry][currx];
            }
            if (newy - curry == 1) {
                inMaze[curry][currx].edges.s = inMaze[newy][newx];
                inMaze[newy][newx].edges.n = inMaze[curry][currx];
            }
            if (curry - newy == 1) {
                inMaze[curry][currx].edges.n = inMaze[newy][newx];
                inMaze[newy][newx].edges.s = inMaze[curry][currx];
            }

            //mark the unvisited cell as visited
            cells[randomInt].visited = true;

            //add unvisited neighbor walls to wall list
            if (newx > 0 && inMaze[newy][newx - 1].visited == false) {
                cells.push(inMaze[newy][newx - 1]);
                walls.push(inMaze[newy][newx]);
            }
            if (newx < mazeSize.size - 1 && inMaze[newy][newx + 1].visited == false) {
                cells.push(inMaze[newy][newx + 1]);
                walls.push(inMaze[newy][newx]);
            }
            if (newy < mazeSize.size - 1 && inMaze[newy + 1][newx].visited == false) {
                cells.push(inMaze[newy + 1][newx]);
                walls.push(inMaze[newy][newx]);
            }
            if (newy > 0 && inMaze[newy - 1][newx].visited == false) {
                cells.push(inMaze[newy - 1][newx]);
                walls.push(inMaze[newy][newx]);
            }
        }

        //remove cells and walls from lists
        for (i = 0; i < cells.length; i++) {
            if (cells[i].visited == true) {
                cells.splice(i, 1);
                walls.splice(i, 1);
            }
        }
    }
    return inMaze;
}

function drawCell(cell) {

    if (imgFloor.isReady) {
        context.drawImage(imgFloor,
            cell.x * (COORD_SIZE), cell.y * (COORD_SIZE),
            COORD_SIZE + 0.5, COORD_SIZE + 0.5);
    }

    if (cell.edges.n === null) {
        context.moveTo(cell.x * (COORD_SIZE / mazeSize.size), cell.y * (COORD_SIZE / mazeSize.size));
        context.lineTo((cell.x + 1) * (COORD_SIZE / mazeSize.size), cell.y * (COORD_SIZE / mazeSize.size));
        //context.stroke();
    }

    if (cell.edges.s === null) {
        context.moveTo(cell.x * (COORD_SIZE / mazeSize.size), (cell.y + 1) * (COORD_SIZE / mazeSize.size));
        context.lineTo((cell.x + 1) * (COORD_SIZE / mazeSize.size), (cell.y + 1) * (COORD_SIZE / mazeSize.size));
        //context.stroke();
    }

    if (cell.edges.e === null) {
        context.moveTo((cell.x + 1) * (COORD_SIZE / mazeSize.size), cell.y * (COORD_SIZE / mazeSize.size));
        context.lineTo((cell.x + 1) * (COORD_SIZE / mazeSize.size), (cell.y + 1) * (COORD_SIZE / mazeSize.size));
        //context.stroke();
    }

    if (cell.edges.w === null) {
        context.moveTo(cell.x * (COORD_SIZE / mazeSize.size), cell.y * (COORD_SIZE / mazeSize.size));
        context.lineTo(cell.x * (COORD_SIZE / mazeSize.size), (cell.y + 1) * (COORD_SIZE / mazeSize.size));
        //context.stroke();
    }

    //
    // Can do all the moveTo and lineTo commands and then render them all with a single .stroke() call.
    context.stroke();
}

function renderCharacter(character) {
    if (character.image.isReady) {
        context.drawImage(character.image,
            character.location.x * (COORD_SIZE / mazeSize.size), character.location.y * (COORD_SIZE / mazeSize.size), COORD_SIZE / mazeSize.size + 0.5, COORD_SIZE / mazeSize.size + 0.5);
    }
}

function renderGoal(goal) {
    if (goal.image.isReady) {
        context.drawImage(goal.image,
            goal.location.x * (COORD_SIZE / mazeSize.size), goal.location.y * (COORD_SIZE / mazeSize.size), COORD_SIZE / mazeSize.size + 0.5, COORD_SIZE / mazeSize.size + 0.5);
    }
}

function moveCharacter(key, character, goal) {
    if (key === 'ArrowDown'||key === 's'||key === 'k') {
        if (character.location.edges.s) {
            character.location = character.location.edges.s;
        }
    }
    if (key == 'ArrowUp'|| key === 'e'||key === 'i') {
        if (character.location.edges.n) {
            character.location = character.location.edges.n;
        }
    }
    if (key == 'ArrowRight' || key === 'd' || key === 'l') {
        if (character.location.edges.e) {
            character.location = character.location.edges.e;
        }
    }
    if (key == 'ArrowLeft'||key === 'a'||key === 'j') {
        if (character.location.edges.w) {
            character.location = character.location.edges.w;
        }
    }
    if (key === 'h') {
        path = shortestPath(character.location);
        console.log(path);
    }
    if (character.location == goal.location) {

        endTime = Date.now();
        document.getElementById("timer").innerHTML += "Score: " + (score).toString() + "   Time: " + ((endTime - startTime) / 1000).toString() + "s\n";
    }
}

function renderMaze() {

    context.strokeStyle = 'rgb(0, 0, 0)';
    context.lineWidth = 6;

    for (let row = 0; row < mazeSize.size; row++) {
        for (let col = 0; col < mazeSize.size; col++) {
            // start = Date.now();
            drawCell(maze[row][col]);
            // end = Date.now();
            // console.log("Total time: "+ (end-start).toString());
        }
    }

    context.stroke();

    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(COORD_SIZE - 1, 0);
    context.lineTo(COORD_SIZE - 1, COORD_SIZE - 1);
    context.lineTo(0, COORD_SIZE - 1);
    context.closePath();
    context.strokeStyle = 'rgb(0, 0, 0)';
    //context.stroke();

}

function render() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    renderMaze();
    renderCharacter(myCharacter);
    renderGoal(myGoal);
}

function processInput() {
    for (input in inputBuffer) {
        moveCharacter(inputBuffer[input], myCharacter, myGoal);
    }
    inputBuffer = {};
}

function gameLoop() {
    processInput();
    render();

    requestAnimationFrame(gameLoop);

}

function initialize() {
    canvas = document.getElementById('canvas-main');
    context = canvas.getContext('2d');
    mazeSize.size = canvas.title;
    maze = genArray();
    //
    // Immediately invoked anonymous function
    //
    myCharacter = function (imageSource, location) {
        let image = new Image();
        image.size = 50;
        image.isReady = false;

        image.onload = function () {
            this.isReady = true;
        };
        image.src = imageSource;
        return {
            location: location,
            image: image,
        };
    }('character.png', maze[0][0]);
    myGoal = function (imageSource, location) {
        let image = new Image();
        image.size = 50;
        image.isReady = false;

        image.onload = function () {
            this.isReady = true;
        };
        image.src = imageSource;
        return {
            location: location,
            image: image,
        };
    }('goal.png', maze[mazeSize.size - 1][mazeSize.size - 1]);
    start = maze[0][0];
    end = maze[mazeSize.size - 1][mazeSize.size - 1];

    window.addEventListener('keydown', function (event) {
        inputBuffer[event.key] = event.key;
    });

    requestAnimationFrame(gameLoop);
}