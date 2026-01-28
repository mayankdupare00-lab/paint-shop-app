window.onload = function () {

  // Create Fabric canvas AFTER page is ready
  const canvas = new fabric.Canvas('canvas');

  let currentMode = 'wall';

  // Expose canvas globally (important)
  window.canvas = canvas;

  // Set mode (wall / roof / door)
  window.setMode = function (mode) {
    currentMode = mode;
    alert("Selected: " + mode);
  };

  // Handle image upload
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
          selectable: false,
          evented: false
        });

        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
      });
    };

    reader.readAsDataURL(file);
  });

  // Apply color overlay
  window.applyColor = function () {
    const code = document.getElementById('colorCode').value.trim();
    if (!code) {
      alert("Enter color code first");
      return;
    }

    const colorMap = {
      "AP101": "rgba(255, 200, 150, 0.45)",
      "AP102": "rgba(200, 255, 200, 0.45)",
      "AP103": "rgba(200, 200, 255, 0.45)"
    };

    const color = colorMap[code] || "rgba(255, 0, 0, 0.4)";

    const rect = new fabric.Rect({
      left: 120,
      top: 120,
      width: 350,
      height: 220,
      fill: color,
      selectable: true
    });

    canvas.add(rect);
  };

  // Undo last action
  window.undo = function () {
