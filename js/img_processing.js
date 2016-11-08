var $PP = (function(arg) {

	var Processing = arg || {};

    Processing.timeout = null;

    //=========================================================================
	Processing.grayscale = function() {
		var imgData = $F.getImgData();
		var grayscale = $F.grayscale(imgData);
		this.drawImage(grayscale, 0, 0);
	};


    //=========================================================================
	Processing.invertColor = function() {
		var imgData = $F.getImgData();
		var grayscale = $F.invertColors(imgData);
		this.drawImage(grayscale, 0, 0);
	};


    //=========================================================================
    Processing.sharpen = function() {
        var imgData = $F.getImgData();
        var sharpened = $F.filterImage($F.convolute, imgData,
            [  0, -1,  0,
              -1,  5, -1,
               0, -1,  0 ]
        );
        this.drawImage(sharpened, 0, 0);
    };


    //=========================================================================
    Processing.blur = function() {
        var imgData = $F.getImgData();
        var blurred = $F.filterImage($F.convolute, imgData,
            [ 1/9, 1/9, 1/9,
              1/9, 1/9, 1/9,
              1/9, 1/9, 1/9 ]
        );
        this.drawImage(blurred, 0, 0);
    };


    //=========================================================================
    Processing.sobel = function() {
        var imgData = $F.getImgData();
        var grayscale = $F.filterImage($F.grayscale, imgData);
        // Note that ImageData values are clamped between 0 and 255, so we need
        // to use a Float32Array for the gradient values because they
        // range between -255 and 255.
        var vertical = $F.convolute(grayscale, // Float32
            [ -1, 0, 1,
              -2, 0, 2,
              -1, 0, 1 ]);
        var horizontal = $F.convolute(grayscale,
            [ -1, -2, -1,
               0,  0,  0,
               1,  2,  1 ]);
        var final_image = $F.createImageData(vertical.width, vertical.height);
        for (var i=0; i<final_image.data.length; i+=4) {
            // make the vertical gradient red
            var v = Math.abs(vertical.data[i]);
            final_image.data[i] = v;
            // make the horizontal gradient green
            var h = Math.abs(horizontal.data[i]);
            final_image.data[i+1] = h;
            // and mix in some blue for aesthetics
            final_image.data[i+2] = (v+h)/4;
            final_image.data[i+3] = 255; // opaque alpha
        }
        this.drawImage(final_image, 0, 0);
    };


    //=========================================================================
	Processing.drawImage = function(imgData, x, y) {
		var canvas = document.querySelector("#img_canvas");
		var ctx = canvas.getContext("2d");
		ctx.putImageData(imgData, x, y);		
	};

	return Processing;

}).call( $PP || {} );
