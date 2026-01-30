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
let drawingPolygon = false;
let polygonPoints = [];
let tempLine;

// ===============================
// MODE SELECTION
// ===============================
function setMode(mode) {
  currentMode = mode;
  alert(
    mode === 'wall'
      ? 'Draw wall areas (click multiple points, double-click to finish)'
      : `Mode selected: ${mode}`
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
// FREEHAND POLYGON WALL DRAW
// ===============================
canvas.on('mouse:down', function (opt) {
  if (currentMode !== 'wall') return;

  const pointer = canvas.getPointer(opt.e);

  if (!drawingPolygon) {
    drawingPolygon = true;
    polygonPoints = [{ x: pointer.x, y: pointer.y }];
  } else {
    polygonPoints.push({ x: pointer.x, y: pointer.y });
  }

  // Draw temp line
  if (tempLine) canvas.remove(tempLine);

  tempLine = new fabric.Line(
    [
      polygonPoints[polygonPoints.length - 2]?.x || pointer.x,
      polygonPoints[polygonPoints.length - 2]?.y || pointer.y,
      pointer.x,
      pointer.y
    ],
    {
      stroke: '#555',
      selectable: false,
      evented: false
    }
  );

  canvas.add(tempLine);
});

// Finish polygon on double click
canvas.on('mouse:dblclick', function () {
  if (!drawingPolygon || polygonPoints.length < 3) return;

  drawingPolygon = false;
  if (tempLine) canvas.remove(tempLine);

  const polygon = new fabric.Polygon(polygonPoints, {
    fill: 'rgba(0,0,0,0)',
    stroke: '#666',
    strokeWidth: 1,
    objectCaching: false,
    selectable: true,
    hasControls: true,
    cornerStyle: 'circle',
    transparentCorners: false,
    name: 'wall'
  });

  canvas.add(polygon);
  polygonPoints = [];
});

// ===============================
// APPLY COLOR (MULTI-SELECTION)
// ===============================
function applyColor() {
  const code = document.getElementById('colorCode').value.trim();
  if (!code) {
    alert('Enter color code');
    return;
  }

  const colorMap = {
    AP101: 'rgb(170,90,70)',   // deep terracotta
    AP102: 'rgb(90,140,90)',   // strong green
    AP103: 'rgb(85,90,150)',   // deep blue
    AP104: 'rgb(120,120,120)', // cement grey
    AP105: 'rgb(140,110,70)'   // brown
  };

  const paintColor = colorMap[code] || 'rgb(160,80,80)';

  const active = canvas.getActiveObject();

  if (!active) {
    alert('Select one or more wall areas');
    return;
  }

  // MULTI-SELECTION SUPPORT
  if (active.type === 'activeSelection') {
    active.forEachObject(obj => applyPaint(obj, paintColor));
  } else {
    applyPaint(active, paintColor);
  }

  canvas.renderAll();
}

// ===============================
// REALISTIC PAINT EFFECT
// ===============================
function applyPaint(obj, color) {
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
  canvas.renderAll();
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
