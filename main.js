const canvas = document.getElementById("paper");
const ctx = paper.getContext("2d");

let vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
let vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

canvas.width = vw;
canvas.height = vh;

let startTime = new Date();

let positions;

// information about the cards
let cards = {
    width: 300,
    height: 200,
    "description": document.getElementById("description"),
    "github": document.getElementById("github"),
    "socials": document.getElementById("socials"),
}

// holds information about a point
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

// mouse coords at all times, changing when the mouse moves
let mouseCoords = new Point(0, 0);

// holds information about a rectangle
class Rectangle extends Point {
    constructor(left, top, width, height) {
        super(left, top);
        this.width = width;
        this.height = height;
    }

    // get the top left corner of the rectangle
    get topLeft() {
        return new Point(this.x, this.y);
    }

    // get the top right corner of the rectangle
    get topRight() {
        return new Point(this.x + this.width, this.y);
    }

    // get the bottom left corner of the rectangle
    get bottomLeft() {
        return new Point(this.x, this.y + this.height);
    }

    // get the bottom rightcorner of the rectangle
    get bottomRight() {
        return new Point(this.x + this.width, this.y + this.height);
    }
}

// initialize the rectangles so they're available in the global scope
let descriptionCoords = new Rectangle(0, 0, 0, 0);
let githubCoords = new Rectangle(0, 0, 0, 0);
let socialsCoords = new Rectangle(0, 0, 0, 0);

// draws a black line from (startX, startY) to (endX, endY)
function drawLine(startX, startY, endX, endY) {
    ctx.strokeStyle = "#000000";
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
}

// draws a circle with the center in (positions.centerX, positions.y) of radius positions.radius
function drawCircle() {
    ctx.strokeStyle = "#000000";
    ctx.arc(positions.centerX, positions.y, positions.radius, 0, 2 * Math.PI);
    ctx.stroke();
}

// draws a ball with the center in (x, y) and of radius radius
function drawBall(x, y, radius) {
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI)
    ctx.fill();
}

// base velocity
const standard_velocity = 0.0002;
// computed velocity (chose not to change it for now)
let velocity = standard_velocity;

// animation pause flag
let paused = false;
// the time the animation paused at
let resumedTime;
// the total accumulated delay in milliseconds by pausing
let totalDelay = 0;

function updateValues() {
    // width and height used in drawing and calculations
    vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

    // reset the canvas on every requestAnimationFrame and set its' sizes to the current width and height
    canvas.width = vw;
    canvas.height = vh;
    
    // update the time
    if (paused == true) {
        startTime = new Date(resumedTime);
    } else {
        startTime = new Date(new Date().getTime());
    }
    
    // update the positions based on the current width and height
    positions = {
        "startX": vw * 0.35,
        "endX": vw * 0.65,
        "y": vh * 0.50,

        get centerX() {
            return this.startX + (this.endX - this.startX) / 2;
        },

        get radius() {
            return (this.endX - this.startX) / 2;
        },
    }
}

// calculates the distance from (firstX, firstY) to (secondX, secondY)
function distanceToPoint(firstX, firstY, secondX, secondY) {
    return Math.sqrt((firstX - secondX) * (firstX - secondX) + (firstY - secondY) * (firstY - secondY));
}

// checks if the given point is inside the rectangle, returning true if yes, and false if not
function checkIfInsideRectangle(point, rectangle) {
    if (point.x >= rectangle.x && point.y >= rectangle.y && point.x <= rectangle.bottomRight.x && point.y <= rectangle.bottomRight.y) return true;
    return false;
}

// update the mouse's coordinates when it's moved
document.addEventListener("mousemove", (ev) => {
    mouseCoords = new Point(ev.clientX, ev.clientY);
})


function draw() {
    updateValues();

    // rectangle offsets
    let firstOffset = 2 * Math.PI / 3;
    let secondOffset = 4 * Math.PI / 3;

    // set the left and top properties for each card
    cards.description.style = `
        position: absolute;
        left: ${positions.centerX + positions.radius * Math.cos((startTime.getTime() - totalDelay) * velocity) - 150}px;
        top: ${positions.y + positions.radius * Math.sin((startTime.getTime() - totalDelay) * velocity) - 100}px;
    `

    cards.github.style = `
    position: absolute;
    left: ${positions.centerX + positions.radius * Math.cos((startTime.getTime() - totalDelay) * velocity + firstOffset) - 150}px;
    top: ${positions.y + positions.radius * Math.sin((startTime.getTime() - totalDelay) * velocity + firstOffset) - 100}px;
    `

    cards.socials.style = `
    position: absolute;
    left: ${positions.centerX + positions.radius * Math.cos((startTime.getTime() - totalDelay) * velocity + secondOffset) - 150}px;
    top: ${positions.y + positions.radius * Math.sin((startTime.getTime() - totalDelay) * velocity + secondOffset) - 100}px;
    `

    // initialize the objects with the coords for each card
    descriptionCoords = new Rectangle(parseInt(cards.description.style.left), parseInt(cards.description.style.top), cards.width, cards.height);
    githubCoords = new Rectangle(parseInt(cards.github.style.left), parseInt(cards.github.style.top), cards.width, cards.height)
    socialsCoords = new Rectangle(parseInt(cards.socials.style.left), parseInt(cards.socials.style.top), cards.width, cards.height)

    const ballRadius = 10;

    // draw the ball at the center of each card
    // drawBall(descriptionCoords.topLeft.x + cards.width/2, descriptionCoords.topLeft.y + cards.height/2, ballRadius);
    // drawBall(githubCoords.topLeft.x + cards.width/2, githubCoords.topLeft.y + cards.height/2, ballRadius);
    // drawBall(socialsCoords.topLeft.x + cards.width/2, socialsCoords.topLeft.y + cards.height/2, ballRadius);

    // draw the line from the center of the circle to the center of each card
    // drawLine(descriptionCoords.topLeft.x + cards.width/2, descriptionCoords.topLeft.y + cards.height/2, positions.centerX, positions.y);
    // drawLine(githubCoords.topLeft.x + cards.width/2, githubCoords.topLeft.y + cards.height/2, positions.centerX, positions.y);
    // drawLine(socialsCoords.topLeft.x + cards.width/2, socialsCoords.topLeft.y + cards.height/2, positions.centerX, positions.y);

    // if the mouse gets inside one of the cards, then pause the animation
    if (checkIfInsideRectangle(mouseCoords, descriptionCoords) || checkIfInsideRectangle(mouseCoords, githubCoords) ||
    checkIfInsideRectangle(mouseCoords, socialsCoords)) {
        if (paused === false) {
            paused = true;
            resumedTime = startTime.getTime();
        }
    } else {
        if (paused !== false) {
            paused = false;
            totalDelay += new Date().getTime() - resumedTime;
        }
    }

    requestAnimationFrame(draw);
}

draw();