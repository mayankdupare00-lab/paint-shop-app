// ===============================
// CANVAS SETUP
// ===============================
const canvas = new fabric.Canvas('canvas', {
  selection: false,
  preserveObjectStacking: true
});

let currentMode = null;
let activeWall = null;
let drawing = false;
let points = [];
let tempLine = null;

// ===============================
// MODE SELECTION
// ===============================
function setMode(mode) {
  currentMode = mode;
  if (mode === 'wall') {
    alert('Click to draw wall. Double-click to finish.');
  }
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
// DRAW WALL POLYGONS
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

// Finish wall
canvas.on('mouse:dblclick', function () {
  if (!drawing || points.length < 3) return;

  drawing = false;
  if (tempLine) canvas.remove(tempLine);

  const wall = new fabric.Polygon(points, {
    fill: 'rgba(0,0,0,0)',
    stroke: '#ffcc00',       // visible outline
    strokeWidth: 2,
    selectable: false,
    name: 'wall',
    objectCaching: false
  });

  canvas.add(wall);
  points = [];
});

// ===============================
// AUTO WALL SELECTION (CLEAR)
// ===============================
canvas.on('mouse:down', function (opt) {
  if (!opt.target || opt.target.name !== 'wall') return;

  // reset previous
  if (activeWall) {
    activeWall.set({
      stroke: '#ffcc00',
      strokeWidth: 2
    });
  }

  activeWall = opt.target;

  activeWall.set({
    stroke: '#000000',
    strokeWidth: 3
  });

  canvas.renderAll();
});

// ===============================
// APPLY STRONG REALISTIC PAINT
// ===============================
function applyColor() {
  if (!activeWall) {
    alert('Click on a wall first');
    return;
  }

  const code = document.getElementById('colorCode').value.trim();
  if (!code) {
    alert('Enter color code');
    return;
  }

  const colorMap = {
    AP101: '#8f3d2d', // deep brick red
    AP102: '#3f6f3f', // dark green
    AP103: '#36408f', // deep blue
    AP104: '#5f5f5f', // cement
    AP105: '#7a5636'  // brown
  };

  const paintColor = colorMap[code] || '#7d2f2f';

  activeWall.set({
    fill: paintColor,
    opacity: 0.95,
    globalCompositeOperation: 'source-over' // 🔥 FIX: no fade
  });

  canvas.renderAll();
}

// ===============================
// UNDO / RESET / DOWNLOAD
// ===============================
function undo() {
  if (!activeWall) return;
  activeWall.set('fill', 'rgba(0,0,0,0)');
  canvas.renderAll();
}

function resetCanvas() {
  canvas.clear();
  activeWall = null;
}

function downloadImage() {
  const link = document.createElement('a');
  link.download = 'paint-preview.png';
  link.href = canvas.toDataURL({ format: 'png', quality: 1 });
  link.click();
}
