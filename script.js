window.onload = function () {

  console.log("Page loaded");

  const canvas = new fabric.Canvas('canvas');
  console.log("Canvas created", canvas);

  document.getElementById('imageUpload').addEventListener('change', function (e) {

    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (event) {

      fabric.Image.fromURL(event.target.result, function (img) {

        console.log("Image loaded");

        canvas.clear();

        const scale = Math.min(
          canvas.width / img.width,
          canvas.height / img.height
        );

        img.scale(scale);
        img.set({
          left: 0,
          top: 0,
          selectable: false
        });

        canvas.add(img);
        canvas.renderAll();
      });

    };

    reader.readAsDataURL(file);
  });

};
