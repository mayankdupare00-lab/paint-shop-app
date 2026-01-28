// ===============================
// CANVAS SETUP
// ===============================
const canvas = new fabric.Canvas('canvas', {
  selection: false,
  preserveObjectStacking: true
});

let currentMode = null;
let selectedArea = null;

// ===============================
// MODE SELECTION
// ===============================
function setMode(mode) {
  currentMode = mode;
  selectedArea = null;
  alert("Click on the " + mode + " area");
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
// CREATE EDITABLE PAINT AREAS
// ===============================
function createPaintAreas() {
  const common = {
    fill: 'rgba(0,0,0,0)',
    selectable: true,
    hasControls: true,
    cornerSize: 10,
    transparentCorners: false
  };

  canvas.add(
    new fabric.Rect({ left:150, top:220, width:300, height:180, name:'wall', ...common }),
    new fabric.Rect({ left:160, top:120, width:280, height:80, name:'roof', ...common }),
    new fabric.Rect({ left:260, top:270, width:70, height:130, name:'door', ...common })
  );
}

// ===============================
// SELECT AREA
// ===============================
canvas.on('mouse:down', (e) => {
  if (!currentMode || !e.target) return;
  if (e.target.name === currentMode) {
    selectedArea = e.target;
    canvas.setActiveObject(e.target);
  } else {
    alert("Wrong area selected");
  }
});

// ===============================
// APPLY DARK REALISTIC PAINT
// ===============================
function applyColor() {
  if (!selectedArea) {
    alert("Select an area first");
    return;
  }

  const code = document.getElementById('colorCode').value.trim().toUpperCase();

  const colorMap = {
    AP101: "#8B2E2E", // deep brick red
    AP102: "#2F6B3F", // dark green
    AP103: "#2C3E73"  // deep blue
  };

  const color = colorMap[code] || "#7A2E2E";

  selectedArea.set({
    fill: color,
    opacity: 1,
    globalCompositeOperation: 'overlay',
    shadow: new fabric.Shadow({
      color: 'rgba(0,0,0,0.35)',
      blur: 10,
      offsetX: 0,
      offsetY: 0
    })
  });

  canvas.renderAll();
}

// ===============================
// CONTROLS
// ===============================
function undo() {
  if (selectedArea) {
    selectedArea.set({ fill:'rgba(0,0,0,0)', shadow:null });
    canvas.renderAll();
  }
}

function resetCanvas() {
  canvas.clear();
}

function downloadImage() {
  const link = document.createElement('a');
  link.download = 'paint-preview.png';
  link.href = canvas.toDataURL({ format:'png', quality:1 });
  link.click();
}
