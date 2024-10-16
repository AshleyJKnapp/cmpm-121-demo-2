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

canvas.height = canvas.width = 256;
app.append(canvas);

// -- Drawing --
const ctx = <CanvasRenderingContext2D>canvas.getContext("2d");
// Line Settings
ctx.strokeStyle = "black";
ctx.lineWidth = 2;

// Stroke recording and Drawing
const drawingChanged = new Event("drawing-changed");
let strokes: number[][][] = [[]];
let numStroke = 0;
let isDrawing = false;

// Record Strokes
canvas.addEventListener("mousedown", (event) => {
    strokes[numStroke].push([event.offsetX, event.offsetY]);
    isDrawing = true;
    console.log("mouseDown");
});

canvas.addEventListener("mousemove", (event) => {
    if (isDrawing) {
        strokes[numStroke].push([event.offsetX, event.offsetY]);
        canvas.dispatchEvent(drawingChanged);
    }
});

canvas.addEventListener("mouseup", (event) => {
    if (isDrawing) {
        strokes[numStroke].push([event.offsetX, event.offsetY]);
        isDrawing = false;
        strokes.push([]);
        numStroke++;
    }
});

// Clear and redraws all lines as instructed
canvas.addEventListener("drawing-changed", function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < strokes.length; i++){
        for (let j = 1; j < strokes[i].length; j++){
            drawLine(ctx, strokes[i][j-1][0], strokes[i][j-1][1], strokes[i][j][0], strokes[i][j][1]);
        }
    }
});

// Draws a line from (x1, y1) to (x2, y2)
function drawLine(line: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
    line.beginPath();
    line.moveTo(x1, y1);
    line.lineTo(x2, y2);
    line.stroke();
    line.closePath();
}

// -- Buttons --

// Clear Canvas
const clrBtn = document.createElement("button");
clrBtn.innerHTML = "clear";
app.append(clrBtn);

clrBtn.addEventListener("click", function () {
    strokes = [[]];
    numStroke = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});
