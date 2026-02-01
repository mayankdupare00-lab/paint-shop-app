// ===============================
// CANVAS SETUP
// ===============================
const canvas = new fabric.Canvas('canvas', {
  selection: false
});

let imgObject = null;
let points = [];
let tempPolygon = null;
let selectedPolygon = null;
let usedColors = [];

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
      imgObject = img;
    });
  };
  reader.readAsDataURL(file);
});

// ===============================
// DRAW POLYGON (CLICK / SHIFT+CLICK)
// ===============================
canvas.on('mouse:down', function (opt) {
  const pointer = canvas.getPointer(opt.e);

  // SHIFT + CLICK → start new selection
  if (opt.e.shiftKey) {
    clearTemp();
    addPoint(pointer);
    return;
  }

  // Normal click → add point
  addPoint(pointer);
});

// ===============================
// DOUBLE CLICK → FINISH SELECTION
// ===============================
canvas.on('mouse:dblclick', function () {
  if (points.length < 3) return;

  const polygon = new fabric.Polygon(points, {
    fill: 'rgba(0,0,0,0.1)',
    selectable: true,
    hasBorders: false,
    hasControls: false
  });

  canvas.add(polygon);
  canvas.setActiveObject(polygon);
  selectedPolygon = polygon;

  clearTemp();
});

// ===============================
// ADD POINT
// ===============================
function addPoint(pointer) {
  points.push({ x: pointer.x, y: pointer.y });

  if (tempPolygon) {
    canvas.remove(tempPolygon);
  }

  tempPolygon = new fabric.Polygon(points, {
    fill: 'rgba(0,0,0,0.05)',
    selectable: false,
    evented: false
  });

  canvas.add(tempPolygon);
}

// ===============================
// CLEAR TEMP SHAPE
// ===============================
function clearTemp() {
  points = [];
  if (tempPolygon) {
    canvas.remove(tempPolygon);
    tempPolygon = null;
  }
}

// ===============================
// APPLY DARK REALISTIC COLOR
// ===============================
function applyColor() {
  if (!selectedPolygon) {
    alert("Select or draw an area first");
    return;
  }

  const code = document.getElementById('colorCode').value.trim();
  if (!code) {
    alert("Enter color code");
    return;
  }

  const colorMap = {
    AP101: 'rgba(140,45,35,0.97)',
    AP102: 'rgba(45,110,60,0.97)',
    AP103: 'rgba(55,65,135,0.97)'
  };

  const color = colorMap[code] || 'rgba(100,100,100,0.97)';

  selectedPolygon.set({
    fill: color,
    globalCompositeOperation: 'multiply'
  });

  canvas.renderAll();

  usedColors.push(code);
  updateHistory();

  selectedPolygon = null;
}

// ===============================
// COLOR HISTORY
// ===============================
function updateHistory() {
  const list = document.getElementById('historyList');
  list.innerHTML = '';

  [...new Set(usedColors)].forEach(code => {
    const div = document.createElement('div');
    div.textContent = code;
    list.appendChild(div);
  });
}

// ===============================
// CONTROLS
// ===============================
function resetCanvas() {
  canvas.clear();
}

function downloadImage() {
  const link = document.createElement('a');
  link.download = 'paint-preview.png';
  link.href = canvas.toDataURL();
  link.click();
}
