var $F = (function(arg) {

	var Filters = arg || {};


    //=========================================================================
	Filters.getImgData = function() {
		var source_canvas = document.querySelector("#img_canvas");
		var dest_canvas = this.createNewCanvas(source_canvas.width, source_canvas.height);
		var ctx = dest_canvas.getContext('2d');
		ctx.drawImage(source_canvas, 0, 0);
		return ctx.getImageData(0, 0, dest_canvas.width, dest_canvas.height);
	};


    //=========================================================================
	Filters.createNewCanvas = function(w,h) {
		var canvas = document.createElement('canvas');
		canvas.width = w;
		canvas.height = h;
		return canvas;
	};


    //=========================================================================
    Filters.filterImage = function(filter, image, var_args) {
        var args = [this.getImgData()];
        for (var i=2; i<arguments.length; i++) {
            // WHY OH WHY ???
            args.push(arguments[i]);
        }
        return filter.apply(null, args);
    };


    //=========================================================================
	Filters.grayscale = function(imgData) {
		var d = imgData.data;
		for (var i = 0; i < d.length; i +=4 ) {
			var r = d[i];
			var g = d[i+1];
			var b = d[i+2];
			// CIE luminance for the RGB
			// The human eye is bad at seeing red and blue, so we de-emphasize them.
			var v = 0.2126*r + 0.7152*g + 0.0722*b;
			d[i] = d[i+1] = d[i+2] = v
		}
		return imgData;
	};


    //=========================================================================
	Filters.invertColors = function(imgData) {
		var d = imgData.data;
		// invert colors
		for (var i = 0; i < d.length; i += 4) {
			imgData.data[i] = 255 - imgData.data[i];
			imgData.data[i+1] = 255 - imgData.data[i+1];
			imgData.data[i+2] = 255 - imgData.data[i+2];
			// imgData.data[i+3] = 255;
		}
		return imgData;
	};


    // TODO UNDERSTAND WHAT THIS DOES!!

    //=========================================================================
    Filters.tmpCanvas = document.createElement('canvas');
    Filters.tmpCtx = Filters.tmpCanvas.getContext('2d');
    Filters.createImageData = function(w,h) {
        return this.tmpCtx.createImageData(w,h);
    };


    //=========================================================================
    Filters.convolute = function(pixels, weights, opaque) {
        var side = Math.round(Math.sqrt(weights.length));
        var halfSide = Math.floor(side/2);
        var src = pixels.data;
        var sw = pixels.width;
        var sh = pixels.height;
        // pad output by the convolution matrix
        var w = sw;
        var h = sh;
        var output = Filters.createImageData(w, h);
        var dst = output.data;
        // go through the destination image pixels
        var alphaFac = opaque ? 1 : 0;
        for (var y=0; y<h; y++) {
            for (var x=0; x<w; x++) {
                var sy = y;
                var sx = x;
                var dstOff = (y*w+x)*4;
                // calculate the weighed sum of the source image pixels that
                // fall under the convolution matrix
                var r=0, g=0, b=0, a=0;
                for (var cy=0; cy<side; cy++) {
                    for (var cx=0; cx<side; cx++) {
                        var scy = sy + cy - halfSide;
                        var scx = sx + cx - halfSide;
                        if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
                            var srcOff = (scy*sw+scx)*4;
                            var wt = weights[cy*side+cx];
                            r += src[srcOff] * wt;
                            g += src[srcOff+1] * wt;
                            b += src[srcOff+2] * wt;
                            a += src[srcOff+3] * wt;
                        }
                    }
                }
                dst[dstOff] = r;
                dst[dstOff+1] = g;
                dst[dstOff+2] = b;
                dst[dstOff+3] = a + alphaFac*(255-a);
            }
        }
        return output;
    };


    // return the constructed / augmented object
	return Filters;
}).call( $F || {} );