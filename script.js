// Create Fabric canvas
const canvas = new fabric.Canvas('canvas');

// Track current mode
let currentMode = 'wall';

// Set mode (wall / roof / door)
function setMode(mode) {
  currentMode = mode;
  alert("Selected: " + mode);
}

// Handle image upload
document.getElementById('imageUpload').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (event) {
    fabric.Image.fromURL(event.target.result, function (img) {

      // Clear old canvas
      canvas.clear();

      // Resize image to fit canvas
      const scaleX = canvas.width / img.width;
      const scaleY = canvas.height / img.height;
      const scale = Math.min(scaleX, scaleY);

      img.scale(scale);
      img.set({
        left: (canvas.width - img.width * scale) / 2,
        top: (canvas.height - img.height * scale) / 2,
        selectable: false
      });

      canvas.add(img);
      canvas.sendToBack(img);
    });
  };

  reader.readAsDataURL(file);
});

// Apply color overlay
function applyColor() {
  const code = document.getElementById('colorCode').value.trim();
  if (!code) {
    alert("Enter color code first");
    return;
  }

  // Temporary color mapping (demo)
  const colorMap = {
    "AP101": "rgba(255, 200, 150, 0.5)",
    "AP102": "rgba(200, 255, 200, 0.5)",
    "AP103": "rgba(200, 200, 255, 0.5)"
  };

  const color = colorMap[code] || "rgba(255, 0, 0, 0.4)";

  const rect = new fabric.Rect({
    left: 100,
    top: 100,
    width: 300,
    height: 200,
    fill: color,
    selectable: true
  });

  canvas.add(rect);
}

// Undo last action
function undo() {
  const obj = canvas._objects.pop();
  if (obj) canvas.renderAll();
}

// Reset canvas
function resetCanvas() {
  canvas.clear();
}

// Download image
function downloadImage() {
  const link = document.createElement('a');
  link.download = 'paint-preview.png';
  link.href = canvas.toDataURL();
  link.click();
}
