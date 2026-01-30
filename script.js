// ===============================
// CANVAS SETUP
// ===============================
const canvas = new fabric.Canvas('canvas', {
  selection: true,
  preserveObjectStacking: true
});

// ===============================
// GLOBAL STATE
// ===============================
let currentMode = null;
let drawing = false;
let points = [];
let tempLine = null;

// ===============================
// MODE SELECTION
// ===============================
function setMode(mode) {
  currentMode = mode;
  alert(
    mode === 'wall'
      ? 'Click to draw wall points. Double-click to finish wall.'
      : 'Mode selected: ' + mode
  );
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
    });
  };

  reader.readAsDataURL(file);
});

// ===============================
// FREEHAND WALL POLYGON DRAW
// ===============================
canvas.on('mouse:down', function (opt) {
  if (currentMode !== 'wall') return;

  const pointer = canvas.getPointer(opt.e);

  if (!drawing) {
    drawing = true;
    points = [{ x: pointer.x, y: pointer.y }];
  } else {
    points.push({ x: pointer.x, y: pointer.y });
  }

  if (tempLine) canvas.remove(tempLine);

  if (points.length > 1) {
    const last = points[points.length - 2];
    tempLine = new fabric.Line(
      [last.x, last.y, pointer.x, pointer.y],
      {
        stroke: '#555',
        selectable: false,
        evented: false
      }
    );
    canvas.add(tempLine);
  }
});

// Finish wall on double click
canvas.on('mouse:dblclick', function () {
  if (!drawing || points.length < 3) return;

  drawing = false;
  if (tempLine) canvas.remove(tempLine);

  const wall = new fabric.Polygon(points, {
    fill: 'rgba(0,0,0,0)',
    stroke: '#666',
    strokeWidth: 1,
    selectable: true,
    hasControls: true,
    cornerStyle: 'circle',
    transparentCorners: false,
    objectCaching: false,
    name: 'wall'
  });

  canvas.add(wall);
  points = [];
});

// ===============================
// APPLY COLOR (MULTI + REPAINT FIX)
// ===============================
function applyColor() {
  const code = document.getElementById('colorCode').value.trim();
  if (!code) {
    alert('Enter color code');
    return;
  }

  const colorMap = {
    AP101: 'rgb(150,70,50)',   // deep terracotta
    AP102: 'rgb(70,120,70)',   // dark green
    AP103: 'rgb(60,70,130)',   // deep blue
    AP104: 'rgb(100,100,100)', // cement grey
    AP105: 'rgb(120,90,60)'    // brown
  };

  const paintColor = colorMap[code] || 'rgb(140,60,60)';
  const active = canvas.getActiveObject();

  if (!active) {
    alert('Select wall area(s) first');
    return;
  }

  if (active.type === 'activeSelection') {
    active.forEachObject(obj => paintWall(obj, paintColor));
  } else {
    paintWall(active, paintColor);
  }

  // 🔥 IMPORTANT: allow painting another wall
  canvas.discardActiveObject();
  canvas.requestRenderAll();
}

// ===============================
// REALISTIC PAINT EFFECT
// ===============================
function paintWall(obj, color) {
  if (obj.name !== 'wall') return;

  obj.set({
    fill: color,
    opacity: 1,
    globalCompositeOperation: 'multiply'
  });
}

// ===============================
// UNDO / RESET / DOWNLOAD
// ===============================
function undo() {
  const active = canvas.getActiveObject();
  if (!active) return;

  if (active.type === 'activeSelection') {
    active.forEachObject(obj => obj.set('fill', 'rgba(0,0,0,0)'));
  } else {
    active.set('fill', 'rgba(0,0,0,0)');
  }
  canvas.requestRenderAll();
}

function resetCanvas() {
  canvas.clear();
}

function downloadImage() {
  const link = document.createElement('a');
  link.download = 'paint-preview.png';
  link.href = canvas.toDataURL({ format: 'png', quality: 1 });
  link.click();
}
