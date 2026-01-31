// ===============================
// CANVAS SETUP
// ===============================
const canvas = new fabric.Canvas('canvas', {
  selection: true,
  perPixelTargetFind: true,
  targetFindTolerance: 15
});

let currentMode = null;
let selectedObject = null;
let usedColors = [];

// ===============================
// MODE
// ===============================
function setMode(mode) {
  currentMode = mode;
  alert("Tap on a " + mode + " to paint");
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
// CREATE EASY-TO-SELECT AREAS
// ===============================
function createPaintAreas() {
  const areas = [
    { name: 'wall', left: 120, top: 240, width: 300, height: 200 },
    { name: 'wall', left: 440, top: 240, width: 260, height: 200 },
    { name: 'roof', left: 180, top: 140, width: 440, height: 90 },
    { name: 'door', left: 360, top: 300, width: 80, height: 140 }
  ];

  areas.forEach(a => {
    const rect = new fabric.Rect({
      left: a.left,
      top: a.top,
      width: a.width,
      height: a.height,
      fill: 'rgba(0,0,0,0.05)', // CLICK FRIENDLY
      selectable: true,
      evented: true,
      name: a.name,
      hasBorders: false,
      hasControls: true
    });

    canvas.add(rect);
    canvas.bringToFront(rect);
  });
}

// ===============================
// EASY CLICK SELECTION
// ===============================
canvas.on('mouse:down', function (e) {
  if (!e.target || !currentMode) return;

  if (e.target.name === currentMode) {
    selectedObject = e.target;
    canvas.setActiveObject(e.target);
  }
});

// ===============================
// APPLY DARK REALISTIC COLOR
// ===============================
function applyColor() {
  if (!selectedObject) {
    alert("Select an area first");
    return;
  }

  const code = document.getElementById('colorCode').value.trim();
  if (!code) {
    alert("Enter color code");
    return;
  }

  const colorMap = {
    AP101: 'rgba(150,60,45,0.95)',
    AP102: 'rgba(60,120,70,0.95)',
    AP103: 'rgba(70,80,150,0.95)'
  };

  const color = colorMap[code] || 'rgba(120,120,120,0.95)';

  selectedObject.set({
    fill: color,
    globalCompositeOperation: 'multiply',
    hasBorders: false,
    hasControls: false
  });

  canvas.discardActiveObject();
  canvas.renderAll();

  usedColors.push(code);
  updateHistory();

  selectedObject = null;
}

// ===============================
// COLOR HISTORY
// ===============================
function updateHistory() {
  const list = document.getElementById('historyList');
  list.innerHTML = '';

  [...new Set(usedColors)].forEach(code => {
    const div = document.createElement('div');
    div.className = 'history-item';
    div.textContent = code;
    list.appendChild(div);
  });
}

// ===============================
// CONTROLS
// ===============================
function undo() {
  const obj = canvas.getActiveObject();
  if (obj) {
    obj.set('fill', 'rgba(0,0,0,0.05)');
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
