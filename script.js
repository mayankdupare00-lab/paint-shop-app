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
// MODE
// ===============================
function setMode(mode) {
  currentMode = mode;
  selectedArea = null;
  alert("Click on " + mode);
}

// ===============================
// IMAGE UPLOAD
// ===============================
document.getElementById('imageUpload').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    fabric.Image.fromURL(event.target.result, img => {
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
// PAINT AREAS (EDITABLE)
// ===============================
function createPaintAreas() {
  const base = {
    fill: 'rgba(0,0,0,0)',
    selectable: true,
    hasControls: true,
    cornerSize: 10,
    transparentCorners: false
  };

  canvas.add(
    new fabric.Rect({ left:150, top:220, width:300, height:180, name:'wall', ...base }),
    new fabric.Rect({ left:160, top:120, width:280, height:80, name:'roof', ...base }),
    new fabric.Rect({ left:260, top:270, width:70, height:130, name:'door', ...base })
  );
}

// ===============================
// SELECT AREA
// ===============================
canvas.on('mouse:down', e => {
  if (!currentMode || !e.target) return;
  if (e.target.name === currentMode) {
    selectedArea = e.target;
    canvas.setActiveObject(e.target);
  } else {
    alert("Wrong area selected");
  }
});

// ===============================
// APPLY ULTRA DARK REAL PAINT
// ===============================
function applyColor() {
  if (!selectedArea) {
    alert("Select area first");
    return;
  }

  const code = document.getElementById('colorCode').value.trim().toUpperCase();

  // VERY DARK PAINT COLORS
  const colorMap = {
    AP101: "#6A1F1F", // deep brick red
    AP102: "#1F4F2F", // forest green
    AP103: "#1F2F5A"  // navy blue
  };

  const paintColor = colorMap[code] || "#5A1F1F";

  selectedArea.set({
    fill: paintColor,
    opacity: 1,
    globalCompositeOperation: 'source-atop',
    shadow: new fabric.Shadow({
      color: 'rgba(0,0,0,0.45)',
      blur: 18
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
