// ===============================
// CANVAS SETUP
// ===============================
const canvas = new fabric.Canvas('canvas', {
  selection: false,
  preserveObjectStacking: true
});

let currentMode = null;
let selectedArea = null;

// Paint areas
let wallArea, roofArea, doorArea;

// ===============================
// MODE SELECTION
// ===============================
function setMode(mode) {
  currentMode = mode;
  selectedArea = null;
  alert("Now click on the " + mode + " area");
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
// CREATE PAINT AREAS (EDITABLE)
// ===============================
function createPaintAreas() {

  const commonProps = {
    fill: 'rgba(0,0,0,0)',
    selectable: true,
    hasControls: true,
    hasBorders: true,
    lockRotation: false,
    cornerColor: 'blue',
    cornerSize: 10,
    transparentCorners: false
  };

  wallArea = new fabric.Rect({
    left: 150,
    top: 220,
    width: 300,
    height: 180,
    name: 'wall',
    ...commonProps
  });

  roofArea = new fabric.Rect({
    left: 160,
    top: 120,
    width: 280,
    height: 80,
    name: 'roof',
    ...commonProps
  });

  doorArea = new fabric.Rect({
    left: 260,
    top: 270,
    width: 70,
    height: 130,
    name: 'door',
    ...commonProps
  });

  canvas.add(wallArea, roofArea, doorArea);
}

// ===============================
// AREA SELECTION BY CLICK
// ===============================
canvas.on('mouse:down', function (opt) {
  const obj = opt.target;
  if (!obj || !currentMode) return;

  if (obj.name === currentMode) {
    selectedArea = obj;
    canvas.setActiveObject(obj);
  } else {
    alert("Wrong area. Please select: " + currentMode);
    canvas.discardActiveObject();
  }
});

// ===============================
// APPLY COLOR (DARK + REALISTIC)
// ===============================
function applyColor() {
  if (!selectedArea) {
    alert("Select an area first");
    return;
  }

  const code = document.getElementById('colorCode').value.trim().toUpperCase();
  if (!code) {
    alert("Enter color code");
    return;
  }

  const colorMap = {
    "AP101": "rgba(210,120,100,0.85)", // deep wall red
    "AP102": "rgba(140,190,140,0.85)", // green
    "AP103": "rgba(140,140,200,0.85)"  // blue
  };

  const color = colorMap[code] || "rgba(180,80,80,0.85)";

  selectedArea.set({
    fill: color,
    globalCompositeOperation: 'multiply',
    opacity: 0.9
  });

  canvas.renderAll();
}

// ===============================
// UNDO / RESET / DOWNLOAD
// ===============================
function undo() {
  if (selectedArea) {
    selectedArea.set('fill', 'rgba(0,0,0,0)');
    canvas.renderAll();
  }
}

function resetCanvas() {
  canvas.clear();
}

function downloadImage() {
  const link = document.createElement('a');
  link.download = 'paint-preview.png';
  link.href = canvas.toDataURL({
    format: 'png',
    quality: 1
  });
  link.click();
}
