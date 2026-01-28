// ===============================
// CANVAS SETUP
// ===============================
const canvas = new fabric.Canvas('canvas', {
  selection: false
});

let currentMode = null;
let selectedArea = null;

// Paint areas
let wallArea, roofArea, doorArea;

// ===============================
// MODE SELECTION
// ===============================
function setMode(mode) {
  currentMode = mode;
  alert("Click on the " + mode + " area to paint");
}

// ===============================
// IMAGE UPLOAD
// ===============================
document.getElementById('imageUpload').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    fabric.Image.fromURL(event.target.result, function (img) {
      canvas.clear();

      const scale = Math.min(
        canvas.width / img.width,
        canvas.height / img.height
      );

      img.scale(scale);
      img.set({
        left: (canvas.width - img.width * scale) / 2,
        top: (canvas.height - img.height * scale) / 2,
        selectable: false,
        evented: false
      });

      canvas.add(img);
      canvas.sendToBack(img);

      createPaintAreas();
    });
  };

  reader.readAsDataURL(file);
});

// ===============================
// CREATE PAINT AREAS
// ===============================
function createPaintAreas() {

  wallArea = new fabric.Rect({
    left: 150,
    top: 220,
    width: 300,
    height: 180,
    fill: 'rgba(0,0,0,0)',
    selectable: true,
    name: 'wall'
  });

  roofArea = new fabric.Rect({
    left: 160,
    top: 120,
    width: 280,
    height: 80,
    fill: 'rgba(0,0,0,0)',
    selectable: true,
    name: 'roof'
  });

  doorArea = new fabric.Rect({
    left: 260,
    top: 270,
    width: 70,
    height: 130,
    fill: 'rgba(0,0,0,0)',
    selectable: true,
    name: 'door'
  });

  canvas.add(wallArea, roofArea, doorArea);
}

// ===============================
// AREA SELECTION BY CLICK
// ===============================
canvas.on('mouse:down', function (opt) {
  const obj = opt.target;
  if (!obj || !currentMode) return;

  if (obj.name === currentMode) {
    selectedArea = obj;
  } else {
    alert("Wrong area selected. Choose " + currentMode);
  }
});

// ===============================
// APPLY COLOR (REALISTIC BLEND)
// ===============================
function applyColor() {
  if (!selectedArea) {
    alert("Select an area first");
    return;
  }

  const code = document.getElementById('colorCode').value.trim();
  if (!code) {
    alert("Enter color code");
    return;
  }

  const colorMap = {
    "AP101": "rgba(255,200,150,0.55)",
    "AP102": "rgba(200,255,200,0.55)",
    "AP103": "rgba(200,200,255,0.55)"
  };

  const color = colorMap[code] || "rgba(255,0,0,0.5)";

  selectedArea.set({
    fill: color,
    globalCompositeOperation: 'multiply'
  });

  canvas.renderAll();
}

// ===============================
// UNDO / RESET / DOWNLOAD
// ===============================
function undo() {
  if (selectedArea) {
    selectedArea.set('fill', 'rgba(0,0,0,0)');
    canvas.renderAll();
  }
}

function resetCanvas() {
  canvas.clear();
}

function downloadImage() {
  const link = document.createElement('a');
  link.download = 'paint-preview.png';
  link.href = canvas.toDataURL();
  link.click();
}
