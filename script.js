// ===============================
// CANVAS SETUP (SIMPLE SELECTION)
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
    alert('Click to draw wall shape. Double-click to finish.');
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
    stroke: '#666',
    strokeWidth: 1,
    selectable: false,
    name: 'wall',
    objectCaching: false
  });

  canvas.add(wall);
  points = [];
});

// ===============================
// AUTO WALL SELECTION (ONE CLICK)
// ===============================
canvas.on('mouse:down', function (opt) {
  if (!opt.target || opt.target.name !== 'wall') return;

  // Auto deselect previous wall
  if (activeWall) {
    activeWall.set('stroke', '#666');
  }

  activeWall = opt.target;
  activeWall.set('stroke', '#000'); // highlight selected wall
  canvas.renderAll();
});

// ===============================
// APPLY DARK REALISTIC PAINT
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
    AP101: 'rgb(145,65,45)',   // deep brick
    AP102: 'rgb(65,110,65)',   // dark green
    AP103: 'rgb(55,65,120)',   // navy blue
    AP104: 'rgb(95,95,95)',    // cement grey
    AP105: 'rgb(120,85,55)'    // brown
  };

  const paintColor = colorMap[code] || 'rgb(130,60,60)';

  activeWall.set({
    fill: paintColor,
    opacity: 1,
    globalCompositeOperation: 'multiply'
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
