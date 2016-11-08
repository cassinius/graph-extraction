
var MAX_WIDTH = 800;

var render = function (src){
	var image = new Image();
	image.onload = function(){
		// console.log("Image width: " + image.width + " ,height: " + image.height);

		var canvas = document.querySelector("#img_canvas");
		if(image.width > MAX_WIDTH) {
			image.height *= MAX_WIDTH / image.width;
			image.width = MAX_WIDTH;
		}
		var ctx = canvas.getContext("2d");
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

		// Display image information:
		updateImageInfo();
	};
	image.src = src;
};

var loadImage = function (src){
	//	Prevent any non-image file type from being read.
	if(!src.type.match(/image.*/)){
		console.log("The dropped file is not an image: ", src.type);
		return;
	}
	//	Create our FileReader and run the results through the render function.
	var reader = new FileReader();
	reader.onload = function(e){
		render(e.target.result);
	};
	reader.readAsDataURL(src);
};

var target = document.querySelector("#img_canvas");

target.addEventListener("dragover", function(e) {
	e.preventDefault();
	target.style.opacity = 0.7;
}, true);

target.addEventListener("dragleave", function(e) {
	e.preventDefault();
	target.style.opacity = 1;
}, true);

target.addEventListener("drop", function(e){
	e.preventDefault();
	target.style.opacity = 1;
	loadImage(e.dataTransfer.files[0]);
}, true);

var updateImageInfo = function() {
	var canvas = document.querySelector("#img_canvas");
	var ctx = canvas.getContext("2d");
	var pixels = canvas.width * canvas.height;
	document.querySelector("#img_width .value").innerHTML = canvas.width + " px";
	document.querySelector("#img_height .value").innerHTML = canvas.height + " px";
	document.querySelector("#img_pixels .value").innerHTML = formatNumber(pixels);
	document.querySelector("#img_regions .value").innerHTML = formatNumber(pixels);
};

var formatNumber = function(number, fracs) {
    number = number.toFixed(2) + '';
    var x = number.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return fracs ? x1 + x2 : x1;
};

document.querySelector("#img_canvas_box").addEventListener('click', function(event) {
    document.querySelector("#input_file").click();
});

document.querySelector("#input_file").addEventListener('change', function(event) {
    var el = event.target;
    var file = el.files[0];
    var canvas = document.querySelector("#img_canvas");
    var ctx = canvas.getContext('2d');
    var img = new Image();

    img.onload = function (e) {   
        ctx.clearRect(0, 0, canvas.width, canvas.height);         
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        updateImageInfo();
    };
    img.src = URL.createObjectURL(file);
});