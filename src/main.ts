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
ctx.fillStyle = "white";
ctx.fillRect(0, 0, 256, 256);
app.append(canvas);
