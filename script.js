// Create Fabric canvas
const canvas = new fabric.Canvas('canvas', {
  selection: false
});

// Track mode
let currentMode = null;

// Paint areas
let wallArea = null;
let roofArea = null;
let doorArea = null;

/* ===============================
   MODE SELECTION
================================ */
function setMode(mode) {
  currentMode = mode;
  alert("Mode selected: " + mode);
}

/* ===============================
   IMAGE UPLOAD
================================ */
document.getElementById('imageUpload').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (event) {
    fabric.Image.fromURL(event.target.result, function (img) {

      canvas.clear();

      // Resize image
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

/* ===============================
   CREATE PAINT AREAS
================================ */
function createPaintAreas() {
  wallArea = new fabric.Rect({
    left: 150,
    top: 220,
    width: 300,
    height: 180,
    fill: 'rgba(0,0,0,0)',
    selectable: false
  });

  roofArea = new fabric.Rect({
    left: 160,
    top: 120,
    width: 280,
    height: 80,
    fill: 'rgba(0,0,0,0)',
    selectable: false
  });

  doorArea = new fabric.Rect({
    left: 260,
    top: 270,
    width: 70,
    height: 130,
    fill: 'rgba(0,0,0,0)',
    selectable: false
  });

  canvas.add(wallArea, roofArea, doorArea);
}

/* ===============================
   APPLY COLOR
================================ */
function applyColor() {
  const code = document.getElementById('colorCode').value.trim();
  if (!code || !currentMode) {
    alert("Select mode & enter color code");
    return;
  }

  const colorMap = {
    "AP101": "rgba(255,200,150,0.6)",
    "AP102": "rgba(200,255,200,0.6)",
    "AP103": "rgba(200,200,255,0.6)"
  };

  const color = colorMap[code] || "rgba(255,0,0,0.5)";

  if (currentMode === 'wall') wallArea.set('fill', color);
  if (currentMode === 'roof') roofArea.set('fill', color);
  if (currentMode === 'door') doorArea.set('fill', color);

  canvas.renderAll();
}

/* ===============================
   UNDO / RESET / DOWNLOAD
================================ */
function undo() {
  if (currentMode === 'wall') wallArea.set('fill', 'rgba(0,0,0,0)');
  if (currentMode === 'roof') roofArea.set('fill', 'rgba(0,0,0,0)');
  if (currentMode === 'door') doorArea.set('fill', 'rgba(0,0,0,0)');
  canvas.renderAll();
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
