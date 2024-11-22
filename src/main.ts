import "./style.css";

// General Set Up
const APP_NAME = "let's get cooking (drawing)";
const app = document.querySelector<HTMLDivElement>("#app")!;
const header = document.createElement("h1");

// Image setup
const img = document.createElement("img");
img.src = "https://preview.redd.it/my-attempt-at-improving-sans-head-in-his-battle-sprite-v0-o5lr3vku0vac1.png?width=512&format=png&auto=webp&s=58c62927deca7791c1035bee4913863e0ba4a7b3";
img.width = 512/5;
img.height = 480/5;

document.title = APP_NAME;
app.innerHTML = APP_NAME;
const headerDiv = document.createElement("div");
const audio = document.getElementById('audio') as HTMLAudioElement;
audio.volume = 0.3;
audio.play();
app.append(headerDiv);
app.append(img);
header.innerHTML = "human i remember your drawings"
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
    setSize(size: number): void;
    scale(size: number, ctx: CanvasRenderingContext2D): void;
}

function DisplayStroke(): Displayable {
    const pointsArr: {x: number; y: number}[] = [];
    let lineSize: number;

    function setSize(size: number){
        lineSize = size;
    }

    function addPoint(x: number, y: number){
        const point = {x, y};
        pointsArr.push(point);
    }

    function display(ctx: CanvasRenderingContext2D, ) {   
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

    // Scales the object by s and displays to ctx
    function scale(size: number, ctx: CanvasRenderingContext2D) {
        const scaledArr: {x: number; y: number}[] = [];
        const scaledLine: number = lineSize * size;
        for (let i = 0; i < pointsArr.length; i++){
            const x = pointsArr[i].x * size;
            const y = pointsArr[i].y * size;
            const tempPoint = {x, y};
            scaledArr.push(tempPoint);
        }

        // Iterate through each point in this stroke
        for (let i = 1; i < scaledArr.length; i++){     // note that i = 1
            // Draw a line from the previous points (i-1) to the current point (i)
            drawStroke(ctx, scaledLine, scaledArr[i-1].x, scaledArr[i-1].y, scaledArr[i].x, scaledArr[i].y);
        }
    }

    return {display, addPoint, setSize, scale};
}

// -----------------------------------------------------

function DisplaySticker(str: string): Displayable {
    let point: {x: number; y: number};
    let width: number;
    const sticker = str;

    function setSize(size: number){
        width = size;
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

    // Scales the object by s and displays to ctx
    function scale(size: number, ctx: CanvasRenderingContext2D) {
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.font = size*width+"px serif";
        ctx.fillText(sticker, point.x*size, point.y*size)
    }

    return {display, addPoint, setSize, scale};
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

    // Scales the object by s and displays to ctx
    function scale(size: number, ctx: CanvasRenderingContext2D) {
        // currently there is no intention of displaying a cursor
        // Draw a circle at the point, with lineSize diameter
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(point.x*size, point.y*size, size*(lineSize/2), 0, 2 * Math.PI);
        ctx.stroke();
    }

    return {display, addPoint, setSize, scale};
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

    audio.play();
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

    audio.play();
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
const stickerArr = ["🌭","💩","🎺"]
const exportDiv = document.createElement("div");
app.append(exportDiv);
const btnDiv = document.createElement("div");
app.append(btnDiv);
const toolDiv = document.createElement("div");
app.append(toolDiv);
const stickerDiv = document.createElement("div");
app.append(stickerDiv);

// Size Slider  - - - - - - - - - - - - - - - - - - - -
const sizeLabel = document.createElement("label");
sizeLabel.innerHTML = "size";
app.append(sizeLabel);

const sizeSlider = document.createElement("input");
sizeSlider.type = "range";
sizeSlider.name = "size";
sizeSlider.min = "1";
sizeSlider.max = "50";
sizeSlider.id = "sizeSlide";
app.append(sizeSlider);

const sizeNumLabel = document.createElement("label");
sizeSlider.valueAsNumber = currentSize;
sizeNumLabel.innerHTML = ""+sizeSlider.valueAsNumber;
app.append(sizeNumLabel);

sizeSlider.addEventListener('input', function () {
    currentSize = sizeSlider.valueAsNumber;
    sizeNumLabel.innerHTML = ""+sizeSlider.valueAsNumber;
});
//  - - - - - - - - - - - - - - - - - - - - - - - - - -


// Export Btn - - - - - - - - - - - - - - - - - - - -
const exportBtn = document.createElement("button");
exportBtn.innerHTML = "export";
exportDiv.append(exportBtn);
// Clear Canvas - - - - - - - - - - - - - - - - - - - -
const clrBtn = document.createElement("button");
clrBtn.innerHTML = "clear";
btnDiv.append(clrBtn);
// Undo Btn - - - - - - - - - - - - - - - - - - - -
const undoBtn = document.createElement("button");
undoBtn.innerHTML = "undo";
undoBtn.disabled = true;
btnDiv.append(undoBtn);
// Redo Btn - - - - - - - - - - - - - - - - - - - -
const redoBtn = document.createElement("button");
redoBtn.innerHTML = "redo";
redoBtn.disabled = true;
btnDiv.append(redoBtn);
// Thin Btn - - - - - - - - - - - - - - - - - - - -
const thinBtn = document.createElement("button");
thinBtn.innerHTML = "thin";
toolDiv.append(thinBtn);
// Thick Btn - - - - - - - - - - - - - - - - - - - -
const thickBtn = document.createElement("button");
thickBtn.innerHTML = "thick";
toolDiv.append(thickBtn);
// Add Sticker Btn - - - - - - - - - - - - - - - - - - - -
const addStickerBtn = document.createElement("button");
addStickerBtn.innerHTML = "+";
stickerDiv.append(addStickerBtn);


// Prep
const toggleButtons: HTMLButtonElement[] = [thinBtn, thickBtn]
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

    audio.play();
});

// Undo Btn
undoBtn.addEventListener("click", function () {
    if (strokes.length){
        redoStack.push(strokes.pop()!);
        canvas.dispatchEvent(drawingChanged);
    }
    undoRedoActiveCheck();

    audio.play();
});

// Redo Btn
redoBtn.addEventListener("click", function () {
    if (redoStack.length){
        strokes.push(redoStack.pop()!);
        canvas.dispatchEvent(drawingChanged);
    }
    undoRedoActiveCheck();

    audio.play();
});

// -- Different Pens --
// Thin Btn
thinBtn.addEventListener("click", function () {
    currentSize = 2;
    selectTool(thinBtn);
    stickerMode = false;

    audio.play();
});

// Thick Btn
thickBtn.addEventListener("click", function () {
    currentSize = 5;
    selectTool(thickBtn);
    stickerMode = false;

    audio.play();
});

// Add Sticker Btn
addStickerBtn.addEventListener("click", function () {
    const text = prompt("Custom sticker text","💀");
    if (text){
        createStickerBtn(text!);
    }

    audio.play();
});

// Create Sticker Buttons
for (const i in stickerArr){
    createStickerBtn(stickerArr[i]);

    audio.play();
}

// Export Btn
exportBtn.addEventListener("click", function () {
    const canvasEx = document.createElement("canvas");
    const ctxEx = <CanvasRenderingContext2D>canvasEx.getContext("2d");
    canvasEx.height = canvasEx.width = 1024;
    
    for (let i = 0; i < strokes.length; i++){
        strokes[i].scale(4, ctxEx);
    }

    const anchor = document.createElement("a");
    anchor.href = canvasEx.toDataURL("image/png");
    anchor.download = "sketchpad.png";
    anchor.click();

    audio.play();
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

function createStickerBtn(sticker: string) {
    const stickerBtn = document.createElement("button");
    stickerBtn.innerHTML = sticker;
    stickerDiv.prepend(stickerBtn);
    toggleButtons.push(stickerBtn);

    stickerBtn.addEventListener("click", function () {
        currentSticker = stickerBtn.innerHTML;
        currentSize = 50;
        stickerMode = true;
        selectTool(stickerBtn);
    });
}
