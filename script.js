window.onload = function () {

  const canvas = new fabric.Canvas('canvas');

  let currentMode = 'wall';

  function setMode(mode) {
    currentMode = mode;
    alert("Selected: " + mode);
  }

  document.getElementById('imageUpload').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (event) {
      fabric.Image.fromURL(event.target.result, function (img) {

        canvas.clear();

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

  window.applyColor = function () {
    const code = document.getElementById('colorCode').value.trim();
    if (!code) {
      alert("Enter color code first");
      return;
    }

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
      fill: color
    });

    canvas.add(rect);
  };

  window.undo = function () {
    const obj = canvas._objects.pop();
    if (obj) canvas.renderAll();
  };

  window.resetCanvas = function () {
    canvas.clear();
  };

  window.downloadImage = function () {
    const link = document.createElement('a');
    link.download = 'paint-preview.png';
    link.href = canvas.toDataURL();
    link.click();
  };

};
