import "./style.css";

// General Set Up
const APP_NAME = "ashley's silly little drawing app for class";
const app = document.querySelector<HTMLDivElement>("#app")!;
const header = document.createElement("h1");

document.title = APP_NAME;
app.innerHTML = APP_NAME;
header.innerHTML = "Let's get cooking (drawing)"
app.append(header);

// Canvas Set Up
const canvas = document.createElement("canvas");
const ctx = <CanvasRenderingContext2D>canvas.getContext("2d");

canvas.height = canvas.width = 256;
app.append(canvas);


// --- Displaying ---

interface Displayable {
    display(ctx: CanvasRenderingContext2D): void;
    addPoint (x: number, y: number): void;
}

function DisplayObject(): Displayable {
    const pointsArr: {x: number; y: number}[] = [];

    function addPoint(x: number, y: number){
        const point = {x, y};
        pointsArr.push(point);
    }

    function display(ctx: CanvasRenderingContext2D) {   
        // Iterate through each point in this stroke
        for (let i = 1; i < pointsArr.length; i++){
            // draw a line from the previous points (i-1) to the current point (i)
            drawLine(ctx, pointsArr[i-1].x, pointsArr[i-1].y, pointsArr[i].x, pointsArr[i].y);
        }
    }

    function drawLine(line: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
        line.beginPath();
        line.moveTo(x1, y1);
        line.lineTo(x2, y2);
        line.stroke();
        line.closePath();
    }

    return {display, addPoint};
}


// -- Drawing --
// Line Settings
ctx.strokeStyle = "black";
ctx.lineWidth = 2;

// Stroke recording and Drawing
const drawingChanged = new Event("drawing-changed");
let strokes: Displayable[] = [];
let redoStack: Displayable[] = [];
let isDrawing = false;

let currentLine: Displayable;

// Record Strokes
canvas.addEventListener("mousedown", (event) => {
    currentLine = DisplayObject();
    currentLine.addPoint(event.offsetX, event.offsetY);
    strokes.push(currentLine);
    isDrawing = true;
});

canvas.addEventListener("mousemove", (event) => {
    if (isDrawing) {
        currentLine.addPoint(event.offsetX, event.offsetY);
    canvas.dispatchEvent(drawingChanged);
    }
});

document.addEventListener("mouseup", (event) => {
    if (isDrawing) {
        currentLine.addPoint(event.offsetX, event.offsetY);
        isDrawing = false;
        canvas.dispatchEvent(drawingChanged);
        // Undo is probably available now, enable it
        redoStack = [];
        undoRedoActiveCheck();
    }
});

// Clear and redraws all lines as instructed
canvas.addEventListener("drawing-changed", function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Iterate through each stroke
    for (let i = 0; i < strokes.length; i++){
        strokes[i].display(ctx);
    }
});


// -- Buttons --

// Clear Canvas
const clrBtn = document.createElement("button");
clrBtn.innerHTML = "clear";
app.append(clrBtn);

clrBtn.addEventListener("click", function () {
    console.log(ctx);
    // Remove all recorded strokes
    strokes = [];

    // Clear the undo/redo array and disable the corresponding buttons
    redoStack = [];
    undoRedoActiveCheck();

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Undo Btn
const undoBtn = document.createElement("button");
undoBtn.innerHTML = "undo";
undoBtn.disabled = true;
app.append(undoBtn);

undoBtn.addEventListener("click", function () {
    if (strokes.length){
        redoStack.push(strokes.pop()!);
        canvas.dispatchEvent(drawingChanged);
    }
    // Check if we need to disable the buttons
    undoRedoActiveCheck();
});

// Redo Btn
const redoBtn = document.createElement("button");
redoBtn.innerHTML = "redo";
redoBtn.disabled = true;
app.append(redoBtn);

redoBtn.addEventListener("click", function () {
    if (redoStack.length){
        strokes.push(redoStack.pop()!);
        canvas.dispatchEvent(drawingChanged);
    }
    // Check if we need to disable the buttons
    undoRedoActiveCheck();
});


// --- Helper Functions ---

function undoRedoActiveCheck() {
    // Disable if there are no strokes to refer to in redoStack
    redoBtn.disabled = !redoStack.length;
    // Disable if there are no strokes to refer to in stroke
    undoBtn.disabled = !strokes.length;
}
