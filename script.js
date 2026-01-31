// ===============================
// CANVAS SETUP
// ===============================
const canvas = new fabric.Canvas('canvas', {
  selection: true
});

let currentMode = null;
let selectedObject = null;
let history = [];

// ===============================
// MODE SELECTION
// ===============================
function setMode(mode) {
  currentMode = mode;
  alert("Click on a " + mode + " area to paint");
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

      createAreas();
    });
  };
  reader.readAsDataURL(file);
});

// ===============================
// CREATE PAINT AREAS
// ===============================
function createAreas() {
  const areas = [
    { name: 'wall', left: 140, top: 230, width: 320, height: 190 },
    { name: 'wall', left: 480, top: 230, width: 260, height: 190 },
    { name: 'roof', left: 180, top: 130, width: 450, height: 90 },
    { name: 'door', left: 360, top: 290, width: 80, height: 130 }
  ];

  areas.forEach(a => {
    const rect = new fabric.Rect({
      left: a.left,
      top: a.top,
      width: a.width,
      height: a.height,
      fill: 'rgba(0,0,0,0)',
      selectable: true,
      evented: true,
      name: a.name,
      hasBorders: false,
      hasControls: true,
      cornerColor: 'blue'
    });

    canvas.add(rect);
    canvas.bringToFront(rect);
  });
}

// ===============================
// SELECTION HANDLING
// ===============================
canvas.on('mouse:down', function (opt) {
  if (!opt.target || !currentMode) return;

  if (opt.target.name === currentMode) {
    selectedObject = opt.target;
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
    "AP101": "rgba(160,70,50,0.9)",
    "AP102": "rgba(70,140,80,0.9)",
    "AP103": "rgba(60,80,150,0.9)"
  };

  const color = colorMap[code] || "rgba(120,120,120,0.9)";

  selectedObject.set({
    fill: color,
    globalCompositeOperation: 'multiply',
    hasBorders: false
  });

  canvas.renderAll();

  history.push(code);
  updateHistory();

  selectedObject = null;
}

// ===============================
// HISTORY UI
// ===============================
function updateHistory() {
  const list = document.getElementById('historyList');
  list.innerHTML = '';

  [...new Set(history)].forEach(code => {
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
    obj.set('fill', 'rgba(0,0,0,0)');
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
