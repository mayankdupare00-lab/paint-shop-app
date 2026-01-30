// ===============================
// WAIT FOR DOM
// ===============================
window.onload = () => {

  const canvas = new fabric.Canvas('canvas', {
    selection: false,
    preserveObjectStacking: true
  });

  let currentMode = 'wall';
  let selectedObjects = [];
  let usedColors = {};

  // ===============================
  // MODE SELECTION
  // ===============================
  window.setMode = function (mode) {
    currentMode = mode;
  };

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

        createAutoWallOverlays();
      });
    };

    reader.readAsDataURL(file);
  });

  // ===============================
  // AUTO WALL OVERLAYS (EASY CLICK)
  // ===============================
  function createAutoWallOverlays() {
    const areas = [
      { left: 120, top: 200, width: 260, height: 170 },
      { left: 410, top: 210, width: 260, height: 160 },
      { left: 230, top: 120, width: 320, height: 70 }
    ];

    areas.forEach(area => {
      const rect = new fabric.Rect({
        ...area,
        fill: 'rgba(0,0,0,0)',
        stroke: null,            // ❌ NO BORDER
        selectable: true,
        hasBorders: false,
        hasControls: false,
        hoverCursor: 'pointer'
      });

      canvas.add(rect);
    });
  }

  // ===============================
  // MULTI-SELECTION
  // ===============================
  canvas.on('mouse:down', (e) => {
    if (!e.target) return;

    if (!selectedObjects.includes(e.target)) {
      selectedObjects.push(e.target);
      e.target.set('opacity', 0.95);
    }
  });

  // ===============================
  // APPLY DARK REALISTIC COLOR
  // ===============================
  window.applyColor = function () {
    const code = document.getElementById('colorCode').value.toUpperCase().trim();
    if (!code || selectedObjects.length === 0) return;

    const colorMap = {
      AP101: '#9b3c2f',
      AP102: '#355e3b',
      AP103: '#2f3f6b',
      AP104: '#6b2f5b'
    };

    const color = colorMap[code] || '#8b2f2f';

    selectedObjects.forEach(obj => {
      obj.set({
        fill: color,
        globalCompositeOperation: 'multiply',
        opacity: 0.95
      });
    });

    usedColors[code] = color;
    selectedObjects = [];

    canvas.renderAll();
    updateColorHistory();
  };

  // ===============================
  // COLOR HISTORY
  // ===============================
  function updateColorHistory() {
    let history = document.getElementById('colorHistory');
    if (!history) {
      history = document.createElement('div');
      history.id = 'colorHistory';
      history.innerHTML = '<h3>Used Colors</h3>';
      document.body.appendChild(history);
    }

    history.innerHTML = '<h3>Used Colors</h3>';
    Object.keys(usedColors).forEach(code => {
      const box = document.createElement('div');
      box.style.display = 'inline-block';
      box.style.margin = '5px';
      box.innerHTML = `
        <div style="width:30px;height:30px;background:${usedColors[code]}"></div>
        <small>${code}</small>
      `;
      history.appendChild(box);
    });
  }

  // ===============================
  // CONTROLS
  // ===============================
  window.undo = function () {
    const obj = canvas.getObjects().pop();
    if (obj) canvas.remove(obj);
  };

  window.resetCanvas = function () {
    canvas.clear();
    selectedObjects = [];
  };

  window.downloadImage = function () {
    const link = document.createElement('a');
    link.download = 'paint-preview.png';
    link.href = canvas.toDataURL({ format: 'png', quality: 1 });
    link.click();
  };
};
