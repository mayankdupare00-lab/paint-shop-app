document.addEventListener("DOMContentLoaded", () => {

  const canvas = new fabric.Canvas('canvas', {
    selection: true,
    preserveObjectStacking: true
  });

  let baseImage = null;
  let activePaintObject = null;
  const usedColors = new Map(); // colorCode → colorValue

  // ===============================
  // IMAGE UPLOAD
  // ===============================
  document.getElementById('imageUpload').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      fabric.Image.fromURL(ev.target.result, img => {

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
        canvas.renderAll();
      });
    };
    reader.readAsDataURL(file);
  });

  // ===============================
  // FREE POLYGON DRAW (SHIFT + CLICK)
  // ===============================
  let drawing = false;
  let points = [];
  let tempLine = null;

  canvas.on('mouse:down', opt => {
    if (!opt.e.shiftKey) return;

    const p = canvas.getPointer(opt.e);

    if (!drawing) {
      drawing = true;
      points = [{ x: p.x, y: p.y }];

      tempLine = new fabric.Polyline(points, {
        stroke: '#ff9800',
        strokeWidth: 2,
        selectable: false,
        evented: false
      });

      canvas.add(tempLine);
    } else {
      points.push({ x: p.x, y: p.y });
      tempLine.set({ points });
      canvas.renderAll();
    }
  });

  canvas.on('mouse:dblclick', () => {
    if (!drawing) return;

    drawing = false;
    canvas.remove(tempLine);

    const polygon = new fabric.Polygon(points, {
      fill: 'rgba(0,0,0,0.15)',
      selectable: true,
      hasBorders: false,
      hasControls: false,
      globalCompositeOperation: 'multiply'
    });

    canvas.add(polygon);
    canvas.setActiveObject(polygon);
    activePaintObject = polygon;
    canvas.renderAll();
  });

  canvas.on('selection:created', e => activePaintObject = e.selected[0]);
  canvas.on('selection:updated', e => activePaintObject = e.selected[0]);

  // ===============================
  // APPLY COLOR + HISTORY
  // ===============================
  window.applyColor = () => {
    if (!activePaintObject) {
      alert("Draw or select an area first");
      return;
    }

    const code = document.getElementById('colorCode').value.trim().toUpperCase();

    const colorMap = {
      AP101: 'rgb(110,30,25)',
      AP102: 'rgb(40,80,40)',
      AP103: 'rgb(40,50,100)',
      AP104: 'rgb(55,55,55)',
      AP105: 'rgb(140,110,65)'
    };

    const color = colorMap[code] || 'rgb(120,60,50)';

    activePaintObject.set({
      fill: color,
      opacity: 1,
      globalCompositeOperation: 'multiply',
      shadow: new fabric.Shadow({
        color: 'rgba(0,0,0,0.6)',
        blur: 24
      })
    });

    canvas.renderAll();

    // SAVE TO HISTORY
    if (!usedColors.has(code)) {
      usedColors.set(code, color);
      renderHistory();
    }
  };

  function renderHistory() {
    const container = document.getElementById('historyItems');
    container.innerHTML = '';

    usedColors.forEach((color, code) => {
      const item = document.createElement('div');
      item.className = 'history-item';

      const box = document.createElement('div');
      box.className = 'color-box';
      box.style.background = color;

      const label = document.createElement('span');
      label.textContent = code;

      item.appendChild(box);
      item.appendChild(label);
      container.appendChild(item);
    });
  }

  // ===============================
  // TOOLS
  // ===============================
  window.undo = () => {
    if (activePaintObject) {
      canvas.remove(activePaintObject);
      activePaintObject = null;
      canvas.renderAll();
    }
  };

  window.resetCanvas = () => {
    canvas.clear();
    usedColors.clear();
    renderHistory();
    if (baseImage) {
      canvas.add(baseImage);
      canvas.sendToBack(baseImage);
    }
  };

  window.downloadImage = () => {
    const link = document.createElement('a');
    link.download = 'paint-preview.png';
    link.href = canvas.toDataURL({ multiplier: 2 });
    link.click();
  };

});
