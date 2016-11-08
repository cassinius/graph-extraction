function handleFileSelect(evt) {
  var files = evt.target.files; // FileList object

  // Loop through the FileList and render image files as thumbnails.
  for (var i = 0, f; f = files[i]; i++) {

    // Only process image files.
    if (!f.type.match('image.*')) {
      continue;
    }

    var reader = new FileReader();

    // Closure to capture the file information.
    reader.onload = (function(theFile) {
      return function(e) {
        // Render thumbnail.
        var span = document.createElement('span');
        span.innerHTML = ['<img class="thumb" src="', e.target.result,
          '" title="', escape(theFile.name), '"/>'].join('');
        span.style.width = '50px';
        span.style.height = '50px';
        span.querySelector('img').onclick = function() {
          // mark active
          $("#folder-drop > span > img").removeClass('selected');
          $(this).addClass('selected');
          // render to canvas
          render(this.src);
        };
        document.getElementById('folder-drop').insertBefore(span, null);
      };
    })(f);

    // Read in the image file as a data URL.
    reader.readAsDataURL(f);
  }
}

document.getElementById('files').addEventListener('change', handleFileSelect, false);
