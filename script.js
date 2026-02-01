// ===============================
// CANVAS SETUP (STABLE)
// ===============================
const canvas = new fabric.Canvas('canvas', {
  selection: false,
  skipTargetFind: false,
  perPixelTargetFind: false,
  targetFindTolerance: 25 // VERY IMPORTANT for easy selection
});

let currentMode = null;
let selectedObject = null;
let usedColors = [];

// ===============================
// MODE SELECTION
// ===============================
function setMode(mode) {
  currentMode = mode;
  selectedObject = null;
  alert("Click on a " + mode + " to paint");
}

// ===============================
// IMAGE UPLOAD (SAFE)
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
      canvas.renderAll();
    });
  };
  reader.readAsDataURL(file);
});

// ===============================
// CREATE CLICK-FRIENDLY AREAS
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
      fill: 'rgba(0,0,0,0.08)', // invisible but VERY clickable
      selectable: true,
      evented: true,
      name: a.name,
      hasBorders: false,
      hasControls: false,
      hoverCursor: 'pointer'
    });

    canvas.add(rect);
    canvas.bringToFront(rect);
  });
}

// ===============================
// EASY & SAFE SELECTION (NO ERROR)
// ===============================
canvas.on('mouse:down', function (e) {
  if (!currentMode) return;
  if (!e.target) return;

  if (e.target.name === currentMode) {
    selectedObject = e.target;
  } else {
    selectedObject = null;
  }
});

// ===============================
// APPLY DARK REALISTIC COLOR
// ===============================
function applyColor() {
  if (!selectedObject) {
    alert("Please select an area first");
    return;
  }

  const code = document.getElementById('colorCode').value.trim();
  if (!code) {
    alert("Enter color code");
    return;
  }

  const colorMap = {
    AP101: 'rgba(145,55,45,0.95)',
    AP102: 'rgba(55,110,65,0.95)',
    AP103: 'rgba(60,70,140,0.95)'
  };

  const color = colorMap[code] || 'rgba(120,120,120,0.95)';

  selectedObject.set({
    fill: color,
    globalCompositeOperation: 'multiply'
  });

  canvas.renderAll();

  usedColors.push(code);
  updateHistory();

  // IMPORTANT: reset selection cleanly
  selectedObject = null;
}

// ===============================
// COLOR HISTORY
// ===============================
function updateHistory() {
  const list = document.getElementById('historyList');
  if (!list) return;

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
function undo() {
  // simple safe undo
  canvas.getObjects().forEach(obj => {
    if (obj.name && obj.fill && obj.fill !== 'rgba(0,0,0,0.08)') {
      obj.set('fill', 'rgba(0,0,0,0.08)');
      canvas.renderAll();
      return;
    }
  });
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
