// CREATE CANVAS
const canvas = new fabric.Canvas('canvas');
let currentMode = 'wall';
let history = [];

// SAVE STATE FOR UNDO
function saveState() {
  history.push(JSON.stringify(canvas));
  if (history.length > 20) history.shift();
}

// UNDO FUNCTION
function undo() {
  if (history.length > 0) {
    const state = history.pop();
    canvas.loadFromJSON(state, canvas.renderAll.bind(canvas));
  }
}

// RESET CANVAS
function resetCanvas() {
  if (confirm("Clear the canvas?")) {
    canvas.clear();
    document.getElementById("usedColors").innerHTML = "";
    history = [];
  }
}

// MODE SELECTION
function setMode(mode) {
  currentMode = mode;
  alert("Painting mode: " + mode.toUpperCase());
}

// IMAGE UPLOAD
document.getElementById("imageUpload").addEventListener("change", function (e) {
  const reader = new FileReader();
  reader.onload = function (event) {
    fabric.Image.fromURL(event.target.result, function (img) {
      canvas.clear();
      img.scaleToWidth(canvas.width);
      canvas.add(img);
      canvas.sendToBack(img);
      saveState();
    });
  };
  reader.readAsDataURL(e.target.files[0]);
});

// APPLY COLOR
function applyColor() {
  const code = document.getElementById("colorCode").value.trim();
  if (!code) {
    alert("Enter color code first");
    return;
  }

  // TEMP COLOR GENERATOR (we replace with real colors in Step 4)
  const color = "#" + Math.floor(Math.random() * 16777215).toString(16);

  const rect = new fabric.Rect({
    left: 100,
    top: 100,
    width: 200,
    height: 150,
    fill: color,
    opacity: 0.5,
    selectable: true
  });

  canvas.add(rect);
  saveState();
  addUsedColor(code, color);
}

// SHOW USED COLORS
function addUsedColor(code, color) {
  const div = document.createElement("div");
  div.style.background = color;
  div.innerText = code;
  document.getElementById("usedColors").appendChild(div);
}

// DOWNLOAD IMAGE
function downloadImage() {
  const link = document.createElement("a");
  link.download = "paint-preview.png";
  link.href = canvas.toDataURL({
    format: "png",
    quality: 1
  });
  link.click();
}
