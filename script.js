// ===============================
// CANVAS SETUP
// ===============================
const canvas = new fabric.Canvas('canvas', {
  selection: false,
  preserveObjectStacking: true,
  hoverCursor: 'pointer'
});

let activeWall = null;
let currentMode = 'wall';
let drawing = false;
let points = [];

// Store applied colors
const paintHistory = [];

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
      paintHistory.length = 0;
      updateHistoryUI();

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
    });
  };
  reader.readAsDataURL(file);
});

// ===============================
// DRAW WALL POLYGON
// ===============================
canvas.on('mouse:down', function (opt) {
  if (currentMode !== 'wall') return;

  const p = canvas.getPointer(opt.e);

  if (!drawing) {
    drawing = true;
    points = [{ x: p.x, y: p.y }];
  } else {
    points.push({ x: p.x, y: p.y });
  }
});

canvas.on('mouse:dblclick', function () {
  if (!drawing || points.length < 3) return;
  drawing = false;

  const wall = new fabric.Polygon(points, {
    fill: 'rgba(0,0,0,0)',
    stroke: 'rgba(0,0,0,0)', // 👈 invisible by default
    strokeWidth: 3,
    selectable: true,
    hasControls: true,
    cornerStyle: 'circle',
    cornerColor: '#ffcc00',
    borderColor: '#ffcc00',
    objectCaching: false,
    name: 'wall'
  });

  canvas.add(wall);
  points = [];
});

// ===============================
// EASY SELECTION (TEMPORARY BORDER)
// ===============================
canvas.on('mouse:over', function (e) {
  if (e.target && e.target.name === 'wall') {
    e.target.set({
      stroke: '#ffcc00',
      strokeWidth: 4
    });
    canvas.renderAll();
  }
});

canvas.on('mouse:out', function (e) {
  if (e.target && e.target !== activeWall) {
    e.target.set({
      stroke: 'rgba(0,0,0,0)'
    });
    canvas.renderAll();
  }
});

canvas.on('mouse:down', function (e) {
  if (!e.target || e.target.name !== 'wall') return;

  if (activeWall && activeWall !== e.target) {
    activeWall.set({
      stroke: 'rgba(0,0,0,0)',
      shadow: null
    });
  }

  activeWall = e.target;
});

// ===============================
// APPLY DARK REALISTIC PAINT
// ===============================
function applyColor() {
  if (!activeWall) {
    alert('Select a wall first');
    return;
  }

  const code = document.getElementById('colorCode').value.trim().toUpperCase();

  const colorMap = {
    AP101: '#7a2f20',
    AP102: '#355f35',
    AP103: '#2f3f7a',
    AP104: '#4f4f4f',
    AP105: '#6b4b2a'
  };

  const color = colorMap[code] || '#6a2a2a';

  activeWall.set({
    fill: color,
    opacity: 1,
    stroke: 'rgba(0,0,0,0)', // 👈 REMOVE BORDER AFTER PAINT
    globalCompositeOperation: 'source-over'
  });

  paintHistory.push({ code, color });
  updateHistoryUI();

  canvas.renderAll();
}

// ===============================
// COLOR HISTORY UI
// ===============================
function updateHistoryUI() {
  const container = document.getElementById('colorHistory');
  if (!container) return;

  container.innerHTML = '';

  paintHistory.forEach(item => {
    const div = document.createElement('div');
    div.style.display = 'flex';
    div.style.alignItems = 'center';
    div.style.marginBottom = '6px';

    const swatch = document.createElement('div');
    swatch.style.width = '22px';
    swatch.style.height = '22px';
    swatch.style.background = item.color;
    swatch.style.marginRight = '8px';
    swatch.style.border = '1px solid #333';

    const label = document.createElement('span');
    label.textContent = item.code;

    div.appendChild(swatch);
    div.appendChild(label);
    container.appendChild(div);
  });
}

// ===============================
// CONTROLS
// ===============================
function undo() {
  if (!activeWall) return;
  activeWall.set('fill', 'rgba(0,0,0,0)');
  canvas.renderAll();
}

function resetCanvas() {
  canvas.clear();
  paintHistory.length = 0;
  updateHistoryUI();
}

function downloadImage() {
  const a = document.createElement('a');
  a.download = 'paint-preview.png';
  a.href = canvas.toDataURL({ quality: 1 });
  a.click();
}
