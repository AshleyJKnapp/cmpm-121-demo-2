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

let cursorX = 0;
let cursorY = 0;
let isDrawing = false;

canvas.addEventListener("mousedown", (event) => {
    cursorX = event.offsetX;
    cursorY = event.offsetY;
    isDrawing = true;
});

canvas.addEventListener("mousemove", (event) => {
if (isDrawing) {
    drawLine(ctx, cursorX, cursorY, event.offsetX, event.offsetY);
    cursorX = event.offsetX;
    cursorY = event.offsetY;
    }
});

canvas.addEventListener("mouseup", (event) => {
if (isDrawing) {
    drawLine(ctx, cursorX, cursorY, event.offsetX, event.offsetY);
    cursorX = 0;
    cursorY = 0;
    isDrawing = false;
    }
});

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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});
