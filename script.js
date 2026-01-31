const canvas = new fabric.Canvas('canvas', {
  selection: false,
  preserveObjectStacking: true
});

let selectedAreas = [];
let usedColors = {};

// ================= IMAGE UPLOAD =================
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
        left: 0,
        top: 0,
        selectable: false,
        evented: false
      });

      canvas.add(img);
      canvas.sendToBack(img);

      createWallAreas();
    });
  };

  reader.readAsDataURL(file);
});

// ================= WALL AREAS =================
function createWallAreas() {
  const walls = [
    { left: 80, top: 200, width: 260, height: 160 },
    { left: 360, top: 200, width: 260, height: 160 }
  ];

  walls.forEach(area => {
    const rect = new fabric.Rect({
      ...area,
      fill: 'rgba(0,0,0,0)',
      selectable: true,
      hasBorders: false,
      hasControls: false,
      hoverCursor: 'pointer'
    });

    canvas.add(rect);
  });
}

// ================= MULTI SELECTION =================
canvas.on('mouse:down', function (e) {
  if (!e.target) return;

  if (!selectedAreas.includes(e.target)) {
    selectedAreas.push(e.target);
  }
});

// ================= APPLY DARK COLOR =================
function applyColor() {
  const code = document.getElementById('colorCode').value.trim().toUpperCase();
  if (!code || selectedAreas.length === 0) return;

  const colors = {
    AP101: '#8b2f2f',
    AP102: '#2f6b3f',
    AP103: '#2f3f6b'
  };

  const color = colors[code] || '#6b2f2f';

  selectedAreas.forEach(area => {
    area.set({
      fill: color,
      globalCompositeOperation: 'multiply',
      opacity: 0.95
    });
  });

  usedColors[code] = color;
  selectedAreas = [];

  canvas.renderAll();
  updateHistory();
}

// ================= COLOR HISTORY =================
function updateHistory() {
  let history = document.getElementById('colorHistory');
  if (!history) return;

  history.innerHTML = '';
  Object.keys(usedColors).forEach(code => {
    const div = document.createElement('div');
    div.style.display = 'inline-block';
    div.style.marginRight = '10px';
    div.innerHTML = `
      <div style="width:24px;height:24px;background:${usedColors[code]};"></div>
      <small>${code}</small>
    `;
    history.appendChild(div);
  });
}

// ================= CONTROLS =================
function undo() {
  const obj = canvas.getObjects().pop();
  if (obj) canvas.remove(obj);
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
