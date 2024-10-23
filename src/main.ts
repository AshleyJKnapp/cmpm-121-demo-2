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


// -----------------------------------------------------
// --- Functions ---
// -----------------------------------------------------

interface Displayable {
    display(ctx: CanvasRenderingContext2D): void;
    addPoint(x: number, y: number): void;
    setSize(s: number): void;
}

function DisplayStroke(): Displayable {
    const pointsArr: {x: number; y: number}[] = [];
    let lineSize: number;

    function setSize(s: number){
        lineSize = s;
    }

    function addPoint(x: number, y: number){
        const point = {x, y};
        pointsArr.push(point);
    }

    function display(ctx: CanvasRenderingContext2D) {   
        // Iterate through each point in this stroke
        for (let i = 1; i < pointsArr.length; i++){     // note that i = 1
            // draw a line from the previous points (i-1) to the current point (i)
            drawStroke(ctx, lineSize, pointsArr[i-1].x, pointsArr[i-1].y, pointsArr[i].x, pointsArr[i].y);
        }
    }

    function drawStroke(line: CanvasRenderingContext2D, size: number,
        x1: number, y1: number, x2: number, y2: number) {
        line.lineWidth = size;
        line.beginPath();
        line.moveTo(x1, y1);
        line.lineTo(x2, y2);
        line.stroke();
        line.closePath();
    }

    return {display, addPoint, setSize};
}

// -----------------------------------------------------

function DisplaySticker(str: string): Displayable {
    let point: {x: number; y: number};
    let width: number;
    const sticker = str;

    function setSize(s: number){
        width = s;
    }

    // Update Point
    function addPoint(x: number, y: number){
        point = {x, y};
    }

    function display(ctx: CanvasRenderingContext2D) {
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.font = width+"px serif";
        ctx.fillText(sticker, point.x, point.y)
    }

    return {display, addPoint, setSize};
}

// -----------------------------------------------------

function DisplayCursor(): Displayable {
    let point: {x: number; y: number};
    let lineSize: number;

    function setSize(s: number){
        lineSize = s;
    }

    // Update Point
    function addPoint(x: number, y: number){
        point = {x, y};
    }

    function display(ctx: CanvasRenderingContext2D) {   
        // Draw a circle at the point, with lineSize diameter
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(point.x, point.y, lineSize/2, 0, 2 * Math.PI);
        ctx.stroke();
    }

    return {display, addPoint, setSize};
}

// -----------------------------------------------------
// -- Drawing --
// -----------------------------------------------------

// Stroke recording and Drawing
const drawingChanged = new Event("drawing-changed");
let strokes: Displayable[] = [];
let redoStack: Displayable[] = [];
let isDrawing = false;
let stickerMode = false;
let currentSize = 2;
let currentLine: Displayable;
let currentSticker = "";
const canvasCursor: Displayable = DisplayCursor();

// Record Strokes
canvas.addEventListener("mousedown", (event) => {
    if (stickerMode) {
        currentLine = DisplaySticker(currentSticker);
    } else {
        currentLine = DisplayStroke();
        isDrawing = true;
    }
    currentLine.setSize(currentSize);
    currentLine.addPoint(event.offsetX, event.offsetY);
    strokes.push(currentLine);
    // Enable Undo Btn
    redoStack = [];
    undoRedoActiveCheck();
});

canvas.addEventListener("mousemove", (event) => {
    if (isDrawing) {
        currentLine.addPoint(event.offsetX, event.offsetY);
    } else {
        const toolMovedEvent = new CustomEvent("tool-moved", {
            detail: { x: event.offsetX, y: event.offsetY }
        });
        
        canvas.dispatchEvent(toolMovedEvent);
    }
    canvas.dispatchEvent(drawingChanged);
});

canvas.addEventListener("mouseup", (event) => {
    if (isDrawing) {
        currentLine.addPoint(event.offsetX, event.offsetY);
        isDrawing = false;
        canvas.dispatchEvent(drawingChanged);
    } else if (stickerMode) {
        currentLine.display(ctx);
    }
});


// -- Custom Events --

// Clear and redraws all lines
canvas.addEventListener("drawing-changed", function () {
    ctx.clearRect(0, 0, canvas.width,canvas.height);
    // Iterate through each stroke
    for (let i = 0; i < strokes.length; i++){
        strokes[i].display(ctx);
    }

    if (!isDrawing){
        canvasCursor.display(ctx);
    }
});

// Sets the cursor up to be drawn
canvas.addEventListener('tool-moved', (event) => {
    const detail = (event as CustomEvent).detail;
    const {x,y} = detail;

    // Sets the cursor to mouse position and current pen size
    canvasCursor.addPoint(x, y);
    canvasCursor.setSize(currentSize);
});


// -----------------------------------------------------
// ---- Buttons ----
// -----------------------------------------------------

// -- Initializations --
// Clear Canvas
const clrBtn = document.createElement("button");
clrBtn.innerHTML = "clear";
app.append(clrBtn);
// Undo Btn - - - - - - - - - - - - - - - - - - - -
const undoBtn = document.createElement("button");
undoBtn.innerHTML = "undo";
undoBtn.disabled = true;
app.append(undoBtn);
// Redo Btn - - - - - - - - - - - - - - - - - - - -
const redoBtn = document.createElement("button");
redoBtn.innerHTML = "redo";
redoBtn.disabled = true;
app.append(redoBtn);
// Thin Btn - - - - - - - - - - - - - - - - - - - -
const thinBtn = document.createElement("button");
thinBtn.innerHTML = "Thin";
app.append(thinBtn);
// Thick Btn - - - - - - - - - - - - - - - - - - - -
const thickBtn = document.createElement("button");
thickBtn.innerHTML = "Thick";
app.append(thickBtn);
// Sticker1 - - - - - - - - - - - - - - - - - - - -
const sticker1 = document.createElement("button");
sticker1.innerHTML = "😂";
app.append(sticker1);
// Sticker 2 - - - - - - - - - - - - - - - - - - - -
const sticker2 = document.createElement("button");
sticker2.innerHTML = "💩";
app.append(sticker2);
// Sticker 3 - - - - - - - - - - - - - - - - - - - -
const sticker3 = document.createElement("button");
sticker3.innerHTML = "👹";
app.append(sticker3);

// Prep
const toggleButtons: HTMLButtonElement[] = [thinBtn, thickBtn, sticker1, sticker2, sticker3]
selectTool(thinBtn);


// -- Event Listeners --
// Clear Canvas
clrBtn.addEventListener("click", function () {
    // Remove all recorded strokes
    strokes = [];

    // Clear the undo/redo array and disable the corresponding buttons
    redoStack = [];
    undoRedoActiveCheck();

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Undo Btn
undoBtn.addEventListener("click", function () {
    if (strokes.length){
        redoStack.push(strokes.pop()!);
        canvas.dispatchEvent(drawingChanged);
    }
    undoRedoActiveCheck();
});

// Redo Btn
redoBtn.addEventListener("click", function () {
    if (redoStack.length){
        strokes.push(redoStack.pop()!);
        canvas.dispatchEvent(drawingChanged);
    }
    undoRedoActiveCheck();
});

// -- Different Pens --
// Thin Btn
thinBtn.addEventListener("click", function () {
    currentSize = 2;
    selectTool(thinBtn);
    stickerMode = false;
});

// Thick Btn
thickBtn.addEventListener("click", function () {
    currentSize = 5;
    selectTool(thickBtn);
    stickerMode = false;
});

// -- Stickers --
// Sticker1
sticker1.addEventListener("click", function () {
    currentSticker = sticker1.innerHTML;
    currentSize = 50;
    stickerMode = true;
    selectTool(sticker1);
});

// Sticker 2
sticker2.addEventListener("click", function () {
    currentSticker = sticker2.innerHTML;
    currentSize = 50;
    stickerMode = true;
    selectTool(sticker2);
});

// Sticker 3
sticker3.addEventListener("click", function () {
    currentSticker = sticker3.innerHTML;
    currentSize = 50;
    stickerMode = true;
    selectTool(sticker3);
});


// -----------------------------------------------------
// --- Helper Functions ---
// -----------------------------------------------------

// For highlighting the currently selected tool
function selectTool(selectedButton: HTMLElement): void {
    // Clear the selected state from the buttons
    for (const button of toggleButtons){
        button.classList.remove('selectedTool');
    }
  
    // Apply the selected state to the active button
    selectedButton.classList.add('selectedTool');
  }

function undoRedoActiveCheck() {
    // Disable if there are no strokes to refer to in redoStack
    redoBtn.disabled = !redoStack.length;
    // Disable if there are no strokes to refer to in stroke
    undoBtn.disabled = !strokes.length;
}
