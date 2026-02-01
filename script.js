// ===============================
// CANVAS SETUP
// ===============================
const canvas = new fabric.Canvas('canvas', {
  selection: true,
  preserveObjectStacking: true
});

let baseImage = null;
let activePaintObject = null;

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

      baseImage = img;
      canvas.add(img);
      canvas.sendToBack(img);
    });
  };
  reader.readAsDataURL(file);
});

// ===============================
// FREE POLYGON SELECTION
// ===============================
let drawing = false;
let points = [];
let tempPolyline = null;

canvas.on('mouse:down', function (opt) {
  if (!opt.e.shiftKey) return;

  const pointer = canvas.getPointer(opt.e);

  if (!drawing) {
    drawing = true;
    points = [{ x: pointer.x, y: pointer.y }];

    tempPolyline = new fabric.Polyline(points, {
      stroke: '#ff9800',
      strokeWidth: 2,
      fill: 'rgba(0,0,0,0)',
      selectable: false,
      evented: false
    });

    canvas.add(tempPolyline);
  } else {
    points.push({ x: pointer.x, y: pointer.y });
    tempPolyline.set({ points });
    canvas.renderAll();
  }
});

canvas.on('mouse:dblclick', function () {
  if (!drawing) return;

  drawing = false;
  canvas.remove(tempPolyline);

  const polygon = new fabric.Polygon(points, {
    fill: 'rgba(120,120,120,0.9)',
    selectable: true,
    objectCaching: false,
    hasBorders: false,
    hasControls: false,
    globalCompositeOperation: 'multiply',
    shadow: new fabric.Shadow({
      color: 'rgba(0,0,0,0.35)',
      blur: 15
    })
  });

  canvas.add(polygon);
  canvas.setActiveObject(polygon);
  activePaintObject = polygon;
  canvas.renderAll();
});

// ===============================
// SELECTION HANDLING
// ===============================
canvas.on('selection:created', e => {
  activePaintObject = e.selected[0];
});
canvas.on('selection:updated', e => {
  activePaintObject = e.selected[0];
});

// ===============================
// APPLY DARK REALISTIC COLOR
// ===============================
function applyColor() {
  if (!activePaintObject) {
    alert("Select or draw an area first");
    return;
  }

  const code = document.getElementById('colorCode').value.trim().toUpperCase();

  const colorMap = {
    AP101: 'rgba(160,60,50,0.95)',   // deep red
    AP102: 'rgba(60,120,60,0.95)',  // dark green
    AP103: 'rgba(60,70,140,0.95)',  // deep blue
    AP104: 'rgba(90,90,90,0.95)',   // charcoal
    AP105: 'rgba(180,150,90,0.95)'  // beige
  };

  const color = colorMap[code] || 'rgba(150,75,60,0.95)';

  activePaintObject.set({
    fill: color,
    globalCompositeOperation: 'multiply',
    opacity: 1
  });

  canvas.renderAll();
}

// ===============================
// UNDO LAST PAINT
// ===============================
function undo() {
  if (activePaintObject) {
    canvas.remove(activePaintObject);
    activePaintObject = null;
    canvas.renderAll();
  }
}

// ===============================
// RESET
// ===============================
function resetCanvas() {
  canvas.clear();
  if (baseImage) {
    canvas.add(baseImage);
    canvas.sendToBack(baseImage);
  }
}

// ===============================
// DOWNLOAD
// ===============================
function downloadImage() {
  const link = document.createElement('a');
  link.download = 'paint-preview.png';
  link.href = canvas.toDataURL({
    format: 'png',
    multiplier: 2
  });
  link.click();
}
