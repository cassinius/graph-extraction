var ROOT;
var Helper;
(function (Helper) {
    function setModule(name, mod) {
        ROOT[name] = mod;
    }
    Helper.setModule = setModule;
    function initGEObject() {
        if (typeof module !== 'undefined' && module.exports) {
            ROOT = global;
        }
        else {
            ROOT = window;
        }
    }
    initGEObject();
    setModule('setModule', setModule);
})(Helper || (Helper = {}));
/// <reference path="../typings/tsd.d.ts" />
var Matrix;
(function (Matrix) {
    var Matrix2D = (function () {
        function Matrix2D(d1, d2, fill) {
            this.d1 = d1;
            this.d2 = d2;
            this.arr_length = 0;
            this.arr_length = this.d1 * this.d2;
            this.arr = new Array(this.arr_length);
            if (fill === fill) {
                for (var i = 0; i < this.arr_length; ++i) {
                    this.arr[i] = fill;
                }
            }
        }
        Matrix2D.generateMatrix = function (arr, d1, d2) {
            if (arr.length !== d1 * d2) {
                throw "Dimensions do not agree with given array!";
            }
            var matrix = new Matrix2D(d1, d2);
            matrix.setArray(arr);
            return matrix;
        };
        Matrix2D.copyMatrix = function (source) {
            var dims = source.dim();
            var dest = new Matrix2D(dims.d1, dims.d2);
            for (var i = 0; i < dims.d1; ++i) {
                for (var j = 0; j < dims.d2; ++j) {
                    var px = source.get(i, j);
                    if (typeof px === 'number') {
                        dest.set(i, j, px);
                    }
                    else if (Array.isArray(px)) {
                        dest.set(i, j, px.slice(0));
                    }
                    else {
                        throw "Unsupported matrix field type!";
                    }
                }
            }
            return dest;
        };
        Matrix2D.prototype.getArray = function () {
            return this.arr;
        };
        Matrix2D.prototype.setArray = function (arr) {
            this.arr = arr;
        };
        Matrix2D.prototype.dim = function () {
            return { d1: this.d1, d2: this.d2 };
        };
        Matrix2D.prototype.length = function () {
            return this.arr_length;
        };
        Matrix2D.prototype.get = function (i, j) {
            var pos = j * this.d1 + i;
            if (pos >= this.length()) {
                throw "Index out of bounds";
            }
            return this.arr[pos];
        };
        Matrix2D.prototype.getIndex = function (i, j) {
            return j * this.d1 + i;
        };
        Matrix2D.prototype.set = function (i, j, val) {
            var pos = j * this.d1 + i;
            if (pos >= this.length()) {
                throw "Index out of bounds";
            }
            this.arr[pos] = val;
        };
        Matrix2D.prototype.add = function (other) {
            var dim_other = other.dim();
            if (this.d1 !== dim_other.d1 || this.d2 !== dim_other.d2) {
                throw "Refusing to add 2 matrices of different dimensions!";
            }
            var result = new Matrix2D(this.d1, this.d2);
            for (var i = 0; i < this.d1; ++i) {
                for (var j = 0; j < this.d2; ++j) {
                    result.set(i, j, this.get(i, j) + other.get(i, j));
                }
            }
            return result;
        };
        Matrix2D.prototype.sub = function (other) {
            var dim_other = other.dim();
            if (this.d1 !== dim_other.d1 || this.d2 !== dim_other.d2) {
                throw "Refusing to add 2 matrices of different dimensions!";
            }
            var result = new Matrix2D(this.d1, this.d2);
            for (var i = 0; i < this.d1; ++i) {
                for (var j = 0; j < this.d2; ++j) {
                    result.set(i, j, this.get(i, j) - other.get(i, j));
                }
            }
            return result;
        };
        Matrix2D.prototype.mult = function (other) {
            var other_dim = other.dim();
            if (this.d1 !== other_dim.d2) {
                throw "Dimensions do now allow multiplication; refusing!";
            }
            var result = new Matrix2D(other_dim.d1, this.d2);
            for (var j = 0; j < this.d2; ++j) {
                for (var i = 0; i < other_dim.d1; ++i) {
                    // result position => i, j
                    var cur_res = 0;
                    for (var k = 0; k < this.d1; ++k) {
                        // console.log("Mult: " + this.get(k,j) + " * " + other.get(i,k));
                        cur_res += this.get(k, j) * other.get(i, k);
                    }
                    result.set(i, j, cur_res);
                }
            }
            return result;
        };
        Matrix2D.prototype.getNeighbors4 = function (x, y, color) {
            if (color === void 0) { color = false; }
            var width = this.d1;
            var height = this.d2;
            var neighborsArray = [];
            if (x - 1 >= 0)
                neighborsArray.push(this.getColorDiff(x, -1, y, 0, color));
            if (x + 1 < width)
                neighborsArray.push(this.getColorDiff(x, 1, y, 0, color));
            if (y - 1 >= 0)
                neighborsArray.push(this.getColorDiff(x, 0, y, -1, color));
            if (y + 1 < height)
                neighborsArray.push(this.getColorDiff(x, 0, y, 1, color));
            return neighborsArray;
        };
        Matrix2D.prototype.getNeighbors8 = function (x, y, color) {
            if (color === void 0) { color = false; }
            var width = this.d1;
            var height = this.d2;
            var neighborsArray = [];
            for (var n = -1; n < 2; n++) {
                if (x + n < 0 || x + n >= width) {
                    continue;
                }
                for (var m = -1; m < 2; m++) {
                    if (y + m < 0 || y + m >= height) {
                        continue;
                    }
                    if (m == 0 && n == 0) {
                        continue;
                    }
                    neighborsArray.push(this.getColorDiff(x, n, y, m, color));
                }
            }
            return neighborsArray;
        };
        Matrix2D.prototype.getColorDiff = function (x, n, y, m, diff) {
            if (diff === void 0) { diff = false; }
            if (diff) {
                var here = this.get(x, y), there = this.get(x + n, y + m);
                if (typeof here === 'number') {
                    // why Math.abs ? Don't we want gradients later.. ?
                    return [x + n, y + m, Math.abs(here - there)];
                }
                else if (Array.isArray(here)) {
                    var gray_here = 0.2126 * here[0] + 0.7152 * here[1] + 0.0722 * here[2];
                    there = this.get(x + n, y + m);
                    var gray_there = 0.2126 * there[0] + 0.7152 * there[1] + 0.0722 * there[2];
                    return [x + n, y + m, Math.abs(gray_here - gray_there)];
                }
                else {
                    throw "Unsupported Matrix field type!";
                }
            }
            else {
                return [x + n, y + m, this.get(x + n, y + m)];
            }
        };
        Matrix2D.prototype.toString = function () {
            console.log("Matrix representation:\n");
            for (var j = 0; j < this.d2; ++j) {
                process.stdout.write("[");
                for (var i = 0; i < this.d1; ++i) {
                    process.stdout.write(this.get(i, j) + " ");
                }
                console.log("]");
            }
        };
        return Matrix2D;
    }());
    Matrix.Matrix2D = Matrix2D;
    setModule('Matrix', Matrix);
})(Matrix || (Matrix = {}));
/// <reference path="../typings/tsd.d.ts" />
var DJSet;
(function (DJSet) {
    var DisjointSet = (function () {
        // we make this a continuous DJSet for the moment, i.e.
        // our elements are numberd 0 .. size-1
        function DisjointSet(size) {
            this.size = size;
            this.parents = new Array(size);
            this.ranks = new Array(size);
            for (var i = 0; i < size; ++i) {
                // every region is it's own parent at the beginning
                this.parents[i] = i;
                // every region has rank = 0 (no children)
                this.ranks[i] = 0;
            }
        }
        DisjointSet.prototype.getSize = function () {
            return this.size;
        };
        DisjointSet.prototype.find = function (region) {
            var p = this.parents[region];
            if (p === region) {
                return p;
            }
            else {
                return this.find(p);
            }
        };
        DisjointSet.prototype.union = function (r1, r2) {
            if (this.ranks[r1] > this.ranks[r2]) {
                this.parents[r2] = r1;
            }
            else if (this.ranks[r2] > this.ranks[r1]) {
                this.parents[r1] = r2;
            }
            else {
                this.parents[r2] = r1;
                this.ranks[r1]++;
            }
        };
        DisjointSet.prototype.rank = function (r) {
            return this.ranks[r];
        };
        DisjointSet.prototype.parent = function (r) {
            return this.parents[r];
        };
        return DisjointSet;
    }());
    DJSet.DisjointSet = DisjointSet;
    setModule('DJSet', DJSet);
})(DJSet || (DJSet = {}));
/// <reference path="../typings/tsd.d.ts" />
var M2D = Matrix.Matrix2D;
var Images;
(function (Images) {
    var RgbImage = (function () {
        // as we are only using this with HTML canvas, we always assume rgba inputs
        function RgbImage(width, height, rgba) {
            this.width = width;
            this.height = height;
            if (rgba.length !== width * height * 4) {
                throw "Invalid dimensions or array length";
            }
            this.matrix = new M2D(width, height);
            // set each [r,g,b] array to its pixel coordinate
            for (var i = 0; i < width; ++i) {
                for (var j = 0; j < height; ++j) {
                    var p = (j * width + i) * 4;
                    var vec = [rgba[p], rgba[p + 1], rgba[p + 2]];
                    this.matrix.set(i, j, vec);
                }
            }
        }
        RgbImage.prototype.getArray = function () {
            return this.matrix.getArray();
        };
        RgbImage.prototype.toRgbaArray = function () {
            var rgba = new Array(this.width * this.height * 4);
            var rgb = this.matrix.getArray();
            var gaps = 0;
            for (var i = 0; i < rgba.length; ++i) {
                if (i % 4 === 3) {
                    ++gaps;
                    rgba[i] = 1;
                }
                else {
                    rgba[i] = rgb[i - gaps];
                }
            }
            return rgba;
        };
        RgbImage.prototype.toGrayImage = function () {
            return new GrayImage(this.width, this.height, this.toRgbaArray());
        };
        return RgbImage;
    }());
    Images.RgbImage = RgbImage;
    var GrayImage = (function () {
        // as we are only using this with HTML canvas, we always assume rgba inputs
        function GrayImage(width, height, rgba) {
            this.width = width;
            this.height = height;
            if (rgba.length !== width * height * 4) {
                throw "Invalid dimensions or array length";
            }
            this.matrix = new M2D(width, height);
            // set each [r,g,b] array to its pixel coordinate
            for (var i = 0; i < width; ++i) {
                for (var j = 0; j < height; ++j) {
                    var p = (j * width + i) * 4;
                    var graylevel = 0.2126 * rgba[p] + 0.7152 * rgba[p + 1] + 0.0722 * rgba[p + 2];
                    this.matrix.set(i, j, graylevel);
                }
            }
        }
        GrayImage.prototype.getArray = function () {
            return this.matrix.getArray();
        };
        GrayImage.prototype.getPixelIndex = function (i, j) {
            return this.matrix.getIndex(i, j);
        };
        GrayImage.prototype.toRgbaArray = function () {
            var rgba = new Uint8Array(this.width * this.height * 4);
            var pixels = this.matrix.getArray();
            var pos = 0;
            for (var i = 0; i < pixels.length; ++i) {
                rgba[pos] = rgba[pos + 1] = rgba[pos + 2] = pixels[i];
                rgba[pos + 3] = 255;
                pos += 4;
            }
            return rgba;
        };
        GrayImage.prototype.fillRgbaArray = function (rgba) {
            var pixels = this.matrix.getArray();
            var pos = 0;
            for (var i = 0; i < pixels.length; ++i) {
                rgba[pos] = rgba[pos + 1] = rgba[pos + 2] = pixels[i];
                rgba[pos + 3] = 255;
                pos += 4;
            }
        };
        GrayImage.prototype.computeNeighborhoods8 = function (color) {
            var adj_list = new Matrix.Matrix2D(this.width, this.height);
            for (var x = 0; x < this.width; ++x) {
                for (var y = 0; y < this.height; ++y) {
                    adj_list.set(x, y, this.matrix.getNeighbors8(x, y, color));
                }
            }
            return adj_list;
        };
        return GrayImage;
    }());
    Images.GrayImage = GrayImage;
    setModule('Images', Images);
})(Images || (Images = {}));
/// <reference path="../typings/tsd.d.ts" />
var M2D = Matrix.Matrix2D;
var ImgGraphs;
(function (ImgGraphs) {
    var ImgGraph = (function () {
        function ImgGraph(adj_list, sort, asc) {
            this.adj_list = adj_list;
            this.edge_list = this.computeEdgeList();
            if (sort) {
                this.sort(asc);
            }
        }
        ImgGraph.prototype.sort = function (asc) {
            if (asc === void 0) { asc = true; }
            var sortfunc;
            if (asc) {
                sortfunc = function (a, b) { return a.w - b.w; };
            }
            else {
                sortfunc = function (a, b) { return b.w - a.w; };
            }
            this.edge_list.sort(sortfunc);
        };
        ImgGraph.prototype.computeEdgeList = function () {
            var adj_tmp = this.adj_list;
            var dims = adj_tmp.dim();
            var visited = new Matrix.Matrix2D(dims.d1, dims.d2, 0);
            var edges = [];
            var neighbors;
            var nb;
            var edge;
            for (var i = 0; i < dims.d1; ++i) {
                for (var j = 0; j < dims.d2; ++j) {
                    // mark the pixel deleted (=> add no more edges to this one)
                    visited.set(i, j, 1);
                    // get connected pixels
                    neighbors = adj_tmp.get(i, j);
                    for (var k = 0; k < neighbors.length; ++k) {
                        nb = neighbors[k];
                        // this neighbor already deleted? => continue
                        if (visited.get(nb[0], nb[1])) {
                            continue;
                        }
                        edge = { p1: [i, j],
                            p2: [nb[0], nb[1]],
                            w: nb[2]
                        };
                        edges.push(edge);
                    }
                }
            }
            return edges;
        };
        return ImgGraph;
    }());
    ImgGraphs.ImgGraph = ImgGraph;
    setModule('ImgGraphs', ImgGraphs);
})(ImgGraphs || (ImgGraphs = {}));
/// <reference path="../typings/tsd.d.ts" />
var M2D = Matrix.Matrix2D;
var Regions;
(function (Regions) {
    /*
    *   @member labels
    *
    */
    var RegionMap = (function () {
        function RegionMap(width, height, img, orig_img) {
            this.regions = {};
            this.labels = new M2D(width, height);
            var arr = this.labels.getArray();
            var img_arr = img.getArray();
            var orig_img_arr = orig_img.data;
            var x, y, region;
            for (var i = 0; i < arr.length; ++i) {
                arr[i] = i;
                region = new Region(i);
                // TODO outsource this to region class
                region.size = 1;
                region.avg_color = img_arr[i];
                region.avg_orig_color = [orig_img_arr[4 * i], orig_img_arr[4 * i + 1], orig_img_arr[4 * i + 2]];
                x = i % width >>> 0;
                y = (i / width) >>> 0;
                //                region.pixels.push( [ x, y, img_arr[i] ]);
                region.centroid = [x, y];
                this.regions[i] = region;
            }
        }
        RegionMap.prototype.merge = function (r1, r2, e) {
            // Set new internal maxEdge
            r1.maxEdge = e.w;
            // Set new avg GREY color (as integer)
            r1.avg_color = ((r1.avg_color * r1.size + r2.avg_color * r2.size) / (r1.size + r2.size)) | 0;
            // Set new avg ORIGINAL color
            r1.avg_orig_color[0] = ((r1.avg_orig_color[0] * r1.size + r2.avg_orig_color[0] * r2.size) / (r1.size + r2.size)) | 0;
            r1.avg_orig_color[1] = ((r1.avg_orig_color[1] * r1.size + r2.avg_orig_color[1] * r2.size) / (r1.size + r2.size)) | 0;
            r1.avg_orig_color[2] = ((r1.avg_orig_color[2] * r1.size + r2.avg_orig_color[2] * r2.size) / (r1.size + r2.size)) | 0;
            var sum_size = r1.size + r2.size;
            // Set the centroid and update the size (we assume 2D centroids)
            r1.centroid[0] = (r1.centroid[0] * r1.size + r2.centroid[0] * r2.size) / sum_size;
            r1.centroid[1] = (r1.centroid[1] * r1.size + r2.centroid[1] * r2.size) / sum_size;
            r1.size = sum_size;
            // mark the region r2 deleted
            r2.deleted = true;
        };
        RegionMap.prototype.getRegion = function (px) {
            var key = this.labels.get(px[0], px[1]);
            return this.regions[key];
        };
        RegionMap.prototype.getRegionByIndex = function (idx) {
            return this.regions[idx];
        };
        return RegionMap;
    }());
    Regions.RegionMap = RegionMap;
    var Region = (function () {
        function Region(id) {
            this.id = id;
            // TODO: WHY OH WHY IS THE TYPE SYSTEM SO SHY ???
            this.size = 0;
            this.avg_color = 0;
            this.avg_orig_color = [0, 0, 0];
            this.centroid = [];
            this.maxEdge = 0;
            this.pixels = [];
            this.labelColor = [];
            this.deleted = false;
        }
        return Region;
    }());
    Regions.Region = Region;
    setModule('Regions', Regions);
})(Regions || (Regions = {}));
/// <reference path="../../typings/tsd.d.ts" />
var ROOT;
var Helper;
(function (Helper) {
    function setModule(name, mod) {
        ROOT[name] = mod;
    }
    Helper.setModule = setModule;
    function initGEObject() {
        if (typeof module !== 'undefined' && module.exports) {
            ROOT = global;
        }
        else {
            ROOT = window;
        }
    }
    initGEObject();
    setModule('setModule', setModule);
})(Helper || (Helper = {}));
/// <reference path="../tsrefs/node.d.ts" />
/// <reference path="./Helper.ts" />
var Matrix;
(function (Matrix) {
    var Matrix2D = (function () {
        function Matrix2D(d1, d2, fill) {
            this.d1 = d1;
            this.d2 = d2;
            this.arr_length = 0;
            this.arr_length = this.d1 * this.d2;
            this.arr = new Array(this.arr_length);
            if (fill === fill) {
                for (var i = 0; i < this.arr_length; ++i) {
                    this.arr[i] = fill;
                }
            }
        }
        Matrix2D.generateMatrix = function (arr, d1, d2) {
            if (arr.length !== d1 * d2) {
                throw "Dimensions do not agree with given array!";
            }
            var matrix = new Matrix2D(d1, d2);
            matrix.setArray(arr);
            return matrix;
        };
        Matrix2D.copyMatrix = function (source) {
            var dims = source.dim();
            var dest = new Matrix2D(dims.d1, dims.d2);
            for (var i = 0; i < dims.d1; ++i) {
                for (var j = 0; j < dims.d2; ++j) {
                    var px = source.get(i, j);
                    if (typeof px === 'number') {
                        dest.set(i, j, px);
                    }
                    else if (Array.isArray(px)) {
                        dest.set(i, j, px.slice(0));
                    }
                    else {
                        throw "Unsupported matrix field type!";
                    }
                }
            }
            return dest;
        };
        Matrix2D.prototype.getArray = function () {
            return this.arr;
        };
        Matrix2D.prototype.setArray = function (arr) {
            this.arr = arr;
        };
        Matrix2D.prototype.dim = function () {
            return { d1: this.d1, d2: this.d2 };
        };
        Matrix2D.prototype.length = function () {
            return this.arr_length;
        };
        Matrix2D.prototype.get = function (i, j) {
            var pos = j * this.d1 + i;
            if (pos >= this.length()) {
                throw "Index out of bounds";
            }
            return this.arr[pos];
        };
        Matrix2D.prototype.getIndex = function (i, j) {
            return j * this.d1 + i;
        };
        Matrix2D.prototype.set = function (i, j, val) {
            var pos = j * this.d1 + i;
            if (pos >= this.length()) {
                throw "Index out of bounds";
            }
            this.arr[pos] = val;
        };
        Matrix2D.prototype.add = function (other) {
            var dim_other = other.dim();
            if (this.d1 !== dim_other.d1 || this.d2 !== dim_other.d2) {
                throw "Refusing to add 2 matrices of different dimensions!";
            }
            var result = new Matrix2D(this.d1, this.d2);
            for (var i = 0; i < this.d1; ++i) {
                for (var j = 0; j < this.d2; ++j) {
                    result.set(i, j, this.get(i, j) + other.get(i, j));
                }
            }
            return result;
        };
        Matrix2D.prototype.sub = function (other) {
            var dim_other = other.dim();
            if (this.d1 !== dim_other.d1 || this.d2 !== dim_other.d2) {
                throw "Refusing to add 2 matrices of different dimensions!";
            }
            var result = new Matrix2D(this.d1, this.d2);
            for (var i = 0; i < this.d1; ++i) {
                for (var j = 0; j < this.d2; ++j) {
                    result.set(i, j, this.get(i, j) - other.get(i, j));
                }
            }
            return result;
        };
        Matrix2D.prototype.mult = function (other) {
            var other_dim = other.dim();
            if (this.d1 !== other_dim.d2) {
                throw "Dimensions do now allow multiplication; refusing!";
            }
            var result = new Matrix2D(other_dim.d1, this.d2);
            for (var j = 0; j < this.d2; ++j) {
                for (var i = 0; i < other_dim.d1; ++i) {
                    // result position => i, j
                    var cur_res = 0;
                    for (var k = 0; k < this.d1; ++k) {
                        // console.log("Mult: " + this.get(k,j) + " * " + other.get(i,k));
                        cur_res += this.get(k, j) * other.get(i, k);
                    }
                    result.set(i, j, cur_res);
                }
            }
            return result;
        };
        Matrix2D.prototype.getNeighbors4 = function (x, y, color) {
            if (color === void 0) { color = false; }
            var width = this.d1;
            var height = this.d2;
            var neighborsArray = [];
            if (x - 1 >= 0)
                neighborsArray.push(this.getColorDiff(x, -1, y, 0, color));
            if (x + 1 < width)
                neighborsArray.push(this.getColorDiff(x, 1, y, 0, color));
            if (y - 1 >= 0)
                neighborsArray.push(this.getColorDiff(x, 0, y, -1, color));
            if (y + 1 < height)
                neighborsArray.push(this.getColorDiff(x, 0, y, 1, color));
            return neighborsArray;
        };
        Matrix2D.prototype.getNeighbors8 = function (x, y, color) {
            if (color === void 0) { color = false; }
            var width = this.d1;
            var height = this.d2;
            var neighborsArray = [];
            for (var n = -1; n < 2; n++) {
                if (x + n < 0 || x + n >= width) {
                    continue;
                }
                for (var m = -1; m < 2; m++) {
                    if (y + m < 0 || y + m >= height) {
                        continue;
                    }
                    if (m == 0 && n == 0) {
                        continue;
                    }
                    neighborsArray.push(this.getColorDiff(x, n, y, m, color));
                }
            }
            return neighborsArray;
        };
        Matrix2D.prototype.getColorDiff = function (x, n, y, m, diff) {
            if (diff === void 0) { diff = false; }
            if (diff) {
                var here = this.get(x, y), there = this.get(x + n, y + m);
                if (typeof here === 'number') {
                    // why Math.abs ? Don't we want gradients later.. ?
                    return [x + n, y + m, Math.abs(here - there)];
                }
                else if (Array.isArray(here)) {
                    var gray_here = 0.2126 * here[0] + 0.7152 * here[1] + 0.0722 * here[2];
                    there = this.get(x + n, y + m);
                    var gray_there = 0.2126 * there[0] + 0.7152 * there[1] + 0.0722 * there[2];
                    return [x + n, y + m, Math.abs(gray_here - gray_there)];
                }
                else {
                    throw "Unsupported Matrix field type!";
                }
            }
            else {
                return [x + n, y + m, this.get(x + n, y + m)];
            }
        };
        Matrix2D.prototype.toString = function () {
            console.log("Matrix representation:\n");
            for (var j = 0; j < this.d2; ++j) {
                process.stdout.write("[");
                for (var i = 0; i < this.d1; ++i) {
                    process.stdout.write(this.get(i, j) + " ");
                }
                console.log("]");
            }
        };
        return Matrix2D;
    })();
    Matrix.Matrix2D = Matrix2D;
    setModule('Matrix', Matrix);
})(Matrix || (Matrix = {}));
/**
 * Created by bernd on 19.05.14.
 */
/// <reference path="../tsrefs/node.d.ts" />
/// <reference path="./Helper.ts" />
var DJSet;
(function (DJSet) {
    var DisjointSet = (function () {
        // we make this a continuous DJSet for the moment, i.e.
        // our elements are numberd 0 .. size-1
        function DisjointSet(size) {
            this.size = size;
            this.parents = new Array(size);
            this.ranks = new Array(size);
            for (var i = 0; i < size; ++i) {
                // every region is it's own parent at the beginning
                this.parents[i] = i;
                // every region has rank = 0 (no children)
                this.ranks[i] = 0;
            }
        }
        DisjointSet.prototype.getSize = function () {
            return this.size;
        };
        DisjointSet.prototype.find = function (region) {
            var p = this.parents[region];
            if (p === region) {
                return p;
            }
            else {
                return this.find(p);
            }
        };
        DisjointSet.prototype.union = function (r1, r2) {
            if (this.ranks[r1] > this.ranks[r2]) {
                this.parents[r2] = r1;
            }
            else if (this.ranks[r2] > this.ranks[r1]) {
                this.parents[r1] = r2;
            }
            else {
                this.parents[r2] = r1;
                this.ranks[r1]++;
            }
        };
        DisjointSet.prototype.rank = function (r) {
            return this.ranks[r];
        };
        DisjointSet.prototype.parent = function (r) {
            return this.parents[r];
        };
        return DisjointSet;
    })();
    DJSet.DisjointSet = DisjointSet;
    setModule('DJSet', DJSet);
})(DJSet || (DJSet = {}));
/// <reference path="../tsrefs/node.d.ts" />
/// <reference path="./Helper.ts" />
/// <reference path="./Matrix.ts" />
var M2D = Matrix.Matrix2D;
var Images;
(function (Images) {
    var RgbImage = (function () {
        // as we are only using this with HTML canvas, we always assume rgba inputs
        function RgbImage(width, height, rgba) {
            this.width = width;
            this.height = height;
            if (rgba.length !== width * height * 4) {
                throw "Invalid dimensions or array length";
            }
            this.matrix = new M2D(width, height);
            for (var i = 0; i < width; ++i) {
                for (var j = 0; j < height; ++j) {
                    var p = (j * width + i) * 4;
                    var vec = [rgba[p], rgba[p + 1], rgba[p + 2]];
                    this.matrix.set(i, j, vec);
                }
            }
        }
        RgbImage.prototype.getArray = function () {
            return this.matrix.getArray();
        };
        RgbImage.prototype.toRgbaArray = function () {
            var rgba = new Array(this.width * this.height * 4);
            var rgb = this.matrix.getArray();
            var gaps = 0;
            for (var i = 0; i < rgba.length; ++i) {
                if (i % 4 === 3) {
                    ++gaps;
                    rgba[i] = 1;
                }
                else {
                    rgba[i] = rgb[i - gaps];
                }
            }
            return rgba;
        };
        RgbImage.prototype.toGrayImage = function () {
            return new GrayImage(this.width, this.height, this.toRgbaArray());
        };
        return RgbImage;
    })();
    Images.RgbImage = RgbImage;
    var GrayImage = (function () {
        // as we are only using this with HTML canvas, we always assume rgba inputs
        function GrayImage(width, height, rgba) {
            this.width = width;
            this.height = height;
            if (rgba.length !== width * height * 4) {
                throw "Invalid dimensions or array length";
            }
            this.matrix = new M2D(width, height);
            for (var i = 0; i < width; ++i) {
                for (var j = 0; j < height; ++j) {
                    var p = (j * width + i) * 4;
                    var graylevel = 0.2126 * rgba[p] + 0.7152 * rgba[p + 1] + 0.0722 * rgba[p + 2];
                    this.matrix.set(i, j, graylevel);
                }
            }
        }
        GrayImage.prototype.getArray = function () {
            return this.matrix.getArray();
        };
        GrayImage.prototype.getPixelIndex = function (i, j) {
            return this.matrix.getIndex(i, j);
        };
        GrayImage.prototype.toRgbaArray = function () {
            var rgba = new Uint8ClampedArray(this.width * this.height * 4);
            var pixels = this.matrix.getArray();
            var pos = 0;
            for (var i = 0; i < pixels.length; ++i) {
                rgba[pos] = rgba[pos + 1] = rgba[pos + 2] = pixels[i];
                rgba[pos + 3] = 255;
                pos += 4;
            }
            return rgba;
        };
        GrayImage.prototype.fillRgbaArray = function (rgba) {
            var pixels = this.matrix.getArray();
            var pos = 0;
            for (var i = 0; i < pixels.length; ++i) {
                rgba[pos] = rgba[pos + 1] = rgba[pos + 2] = pixels[i];
                rgba[pos + 3] = 255;
                pos += 4;
            }
        };
        GrayImage.prototype.computeNeighborhoods8 = function (color) {
            var adj_list = new Matrix.Matrix2D(this.width, this.height);
            for (var x = 0; x < this.width; ++x) {
                for (var y = 0; y < this.height; ++y) {
                    adj_list.set(x, y, this.matrix.getNeighbors8(x, y, color));
                }
            }
            return adj_list;
        };
        return GrayImage;
    })();
    Images.GrayImage = GrayImage;
    setModule('Images', Images);
})(Images || (Images = {}));
/// <reference path="../tsrefs/node.d.ts" />
/// <reference path="./Helper.ts" />
/// <reference path="./Matrix.ts" />
/// <reference path="./Images.ts" />
var M2D = Matrix.Matrix2D;
var Graphs;
(function (Graphs) {
    var Graph = (function () {
        function Graph(adj_list, sort, up) {
            this.adj_list = adj_list;
            this.edge_list = this.computeEdgeList();
            if (sort) {
                this.sort(up);
            }
        }
        Graph.prototype.sort = function (up) {
            if (up === void 0) { up = true; }
            var sortfunc;
            if (up) {
                sortfunc = function (a, b) {
                    return a.w - b.w;
                };
            }
            else {
                sortfunc = function (a, b) {
                    return b.w - a.w;
                };
            }
            this.edge_list.sort(sortfunc);
        };
        Graph.prototype.computeEdgeList = function () {
            var adj_tmp = this.adj_list;
            var dims = adj_tmp.dim();
            var visited = new Matrix.Matrix2D(dims.d1, dims.d2, 0);
            var edges = [];
            var neighbors;
            var nb;
            var edge;
            for (var i = 0; i < dims.d1; ++i) {
                for (var j = 0; j < dims.d2; ++j) {
                    // mark the pixel deleted (=> add no more edges to this one)
                    visited.set(i, j, 1);
                    // get connected pixels
                    neighbors = adj_tmp.get(i, j);
                    for (var k = 0; k < neighbors.length; ++k) {
                        nb = neighbors[k];
                        // this neighbor already deleted? => continue
                        if (visited.get(nb[0], nb[1])) {
                            continue;
                        }
                        edge = { p1: [i, j], p2: [nb[0], nb[1]], w: nb[2] };
                        edges.push(edge);
                    }
                }
            }
            return edges;
        };
        return Graph;
    })();
    Graphs.Graph = Graph;
    setModule('Graphs', Graphs);
})(Graphs || (Graphs = {}));
/// <reference path="../tsrefs/node.d.ts" />
/// <reference path="./Helper.ts" />
/// <reference path="./Matrix.ts" />
var M2D = Matrix.Matrix2D;
var Regions;
(function (Regions) {
    /*
    *   @member labels
    *
    */
    var RegionMap = (function () {
        function RegionMap(width, height, img, orig_img) {
            this.regions = {};
            this.labels = new M2D(width, height);
            var arr = this.labels.getArray();
            var img_arr = img.getArray();
            var orig_img_arr = orig_img.data;
            var x, y, region;
            for (var i = 0; i < arr.length; ++i) {
                arr[i] = i;
                region = new Region(i);
                // TODO outsource this to region class
                region.size = 1;
                region.avg_color = img_arr[i];
                region.avg_orig_color = [orig_img_arr[4 * i], orig_img_arr[4 * i + 1], orig_img_arr[4 * i + 2]];
                x = i % width >>> 0;
                y = (i / width) >>> 0;
                //                region.pixels.push( [ x, y, img_arr[i] ]);
                region.centroid = [x, y];
                this.regions[i] = region;
            }
        }
        RegionMap.prototype.merge = function (r1, r2, e) {
            // Set new internal maxEdge
            r1.maxEdge = e.w;
            // Set new avg GREY color (as integer)
            r1.avg_color = ((r1.avg_color * r1.size + r2.avg_color * r2.size) / (r1.size + r2.size)) | 0;
            // Set new avg ORIGINAL color
            r1.avg_orig_color[0] = ((r1.avg_orig_color[0] * r1.size + r2.avg_orig_color[0] * r2.size) / (r1.size + r2.size)) | 0;
            r1.avg_orig_color[1] = ((r1.avg_orig_color[1] * r1.size + r2.avg_orig_color[1] * r2.size) / (r1.size + r2.size)) | 0;
            r1.avg_orig_color[2] = ((r1.avg_orig_color[2] * r1.size + r2.avg_orig_color[2] * r2.size) / (r1.size + r2.size)) | 0;
            var sum_size = r1.size + r2.size;
            // Set the centroid and update the size (we assume 2D centroids)
            r1.centroid[0] = (r1.centroid[0] * r1.size + r2.centroid[0] * r2.size) / sum_size;
            r1.centroid[1] = (r1.centroid[1] * r1.size + r2.centroid[1] * r2.size) / sum_size;
            r1.size = sum_size;
            // mark the region r2 deleted
            r2.deleted = true;
        };
        RegionMap.prototype.getRegion = function (px) {
            var key = this.labels.get(px[0], px[1]);
            return this.regions[key];
        };
        RegionMap.prototype.getRegionByIndex = function (idx) {
            return this.regions[idx];
        };
        return RegionMap;
    }());
    Regions.RegionMap = RegionMap;
    var Region = (function () {
        function Region(id) {
            this.id = id;
            // TODO: WHY OH WHY IS THE TYPE SYSTEM SO SHY ???
            this.size = 0;
            this.avg_color = 0;
            this.avg_orig_color = [0, 0, 0];
            this.centroid = [];
            this.maxEdge = 0;
            this.pixels = [];
            this.labelColor = [];
            this.deleted = false;
        }
        return Region;
    }());
    Regions.Region = Region;
    setModule('Regions', Regions);
})(Regions || (Regions = {}));


///////////////////////////////////////////////////////////
/////////////// WRITE MESSAGE TO INFO BOX /////////////////
///////////////////////////////////////////////////////////
var updateProgress = function(msg) {
    var time = new Date().getTime() - start;
    var time_msg = msg + " \t :\t " + time + "ms";
    console.log(time_msg);
    document.querySelector("#progress").textContent = time_msg;
};


///////////////////////////////////////////////////////////
////////////////// SET GLOBAL VARIABLES ///////////////////
///////////////////////////////////////////////////////////
var setGlobals = function() {
    // Image Canvas
    window.canvas = document.querySelector("#img_canvas");
    window.width = canvas.width;
    window.height = canvas.height;
    window.ctx = canvas.getContext('2d');
    window.img = ctx.getImageData(0, 0, width, height);
    // Region Canvas
    window.regionCanvas = document.querySelector("#region_canvas");
    window.rctx = regionCanvas.getContext('2d');
    window.rImg = rctx.getImageData(0, 0, width, height);
    // Delaunay Canvas
    window.delcan = document.querySelector("#delaunay_canvas");
    window.delctx = delcan.getContext('2d');
    // Data Structures
    window.labelmap = [];
    window.vertices = [];
    window.vertices_map = {};
    window.triangles = [];
    window.outGraph = {};
    // Time
    window.start = new Date().getTime();
};


///////////////////////////////////////////////////////////
/////////////// IMAGE GRAYSCALE CONVERSION ////////////////
///////////////////////////////////////////////////////////
var demoGrayScale = function() {
    window.start = new Date().getTime();

    setGlobals();
    var gray = new Images.GrayImage(canvas.width, canvas.height, img.data);
    var gray_array = gray.fillRgbaArray(img.data);

    var time = new Date().getTime() - start;
    console.log('Execution time: ' + time + 'ms');

    ctx.putImageData(img, 0, 0);
};


///////////////////////////////////////////////////////////
/////////////// ADJACENCY LIST COMPUTATION ////////////////
///////////////////////////////////////////////////////////
var computeNeighborhoods8 = function() {
    delete window.grayImg;
    delete window.adj_list;

    var start = new Date().getTime();

    setGlobals();
    window.grayImg = new Images.GrayImage(canvas.width, canvas.height, img.data);
    window.adj_list = grayImg.computeNeighborhoods8(true);

    var dims = adj_list.dim();
    console.log("Adjacency List dimensions: " + dims.d1 + ", " + dims.d2);
    var time = new Date().getTime() - start;
    console.log('Execution time: ' + time + 'ms');
};


///////////////////////////////////////////////////////////
////////////////// EDGE LIST COMPUTATION //////////////////
///////////////////////////////////////////////////////////
var computeEdgeList = function() {
    delete window.graph;

    var start = new Date().getTime();
    setGlobals();

    var grayImg = new Images.GrayImage(canvas.width, canvas.height, img.data);
    var adj_list = grayImg.computeNeighborhoods8(true);
    window.graph = new Graphs.Graph(adj_list);

    var time = new Date().getTime() - start;
    console.log('Execution time: ' + time + 'ms');
};


///////////////////////////////////////////////////////////
//////////// HOUSEKEEPING AND UI PREPARATION //////////////
///////////////////////////////////////////////////////////
var startGraphExtraction = function(algo, callback) {
    delete window.grayImg;
    delete window.adj_list;
    delete window.graph;
    delete window.rMap;
    delete window.djs;
    delete window.outGraph;

    setGlobals();

    rctx.clearRect(0, 0, width, height);
    delctx.clearRect(0, 0, width, height);
    document.querySelector("#region_canvas").style.backgroundImage = "url(/imgextract/images/loading.gif)";
    document.querySelector("#progress").textContent = "Processing Image... this might take some time...";

    // now figure out which algorithm to invoke... and go!
    var algoToExecute;
    switch (algo) {
        case "kruskalrm":   algoToExecute = kruskalRegionMerging;
                            break;
        case "watershed":   algoToExecute = watershed;
                            break;
    }
    //setTimeout(function() {
        // execute Main Image Segmentation Algorithm
        // TODO: in the future, this will be handeled by a webworker
        algoToExecute();
        ///////////////////////////////////////////////////////////
        ///////// POSTPROCESSING AND UI, ALGO INDEPENDENT /////////
        ///////////////////////////////////////////////////////////
        // display the Label Map onto a canvas
        drawLabelMap();

        // we need the Delauney triangulation as precursor to the graph construction
        computeDelauney();

        // and draw it
        // drawDelauney();

        // now let's construct the graph object
        buildGraphObject();

        // and draw graph
        drawGraph();

        // finally, execute the callback if provided
        if ( callback ) {
            callback();
        }

    //}, 50);
};


///////////////////////////////////////////////////////////
/////////////// DATASTRUCTURE PREPROCESSING ///////////////
///////////////////////////////////////////////////////////

// TODO: this function should be passed a configuration object
// so it can determine on its own which datastructures to compute
var prepareDataStructures = function() {
    window.grayImg = new Images.GrayImage(width, height, img.data);
    var msg = "Converted to Gray Image...";
    updateProgress(msg);

    window.adj_list = grayImg.computeNeighborhoods8(true);
    msg = "Constructed Adjacency List...";
    updateProgress(msg);


    window.graph = new Graphs.Graph(adj_list, true); // sort the Edge List
    msg = "Instantiated original Graph...";
    updateProgress(msg);

    window.rMap = new Regions.RegionMap(width, height, grayImg, img);
    window.djs = new DJSet.DisjointSet(width * height);
    msg = "Constructed Region Map...\n STARTING REGION MERGING...";
    updateProgress(msg);
};


///////////////////////////////////////////////////////////
//////////////// WATERSHED TRANSFORMATION /////////////////
///////////////////////////////////////////////////////////
var watershed = function() {
    var step1 = function(p) {
      if (v[p] != 1)  {
        var nbs = al[p];
        for (var i = 0; i < nbs.length; ++i) {
          if (nbs[i][2] < f[p]) {
            v[p] = 1;
          }
        }
      }
    };

    var step2 = function(p) {
      var changed = 0;
      if (v[p] != 1)  {
        var min = vmax;
        var nbs = al[p];

        for (var i = 0; i < nbs.length; ++i) {
          var n_i = grayImg.getPixelIndex(nbs[i][0], nbs[i][1]);
          if (f[n_i] == f[p] && v[n_i] > 0 && v[n_i] < min) {
            min = v[n_i];
          }
        }

        if ( min != vmax && v[p] != min+1) {
          v[p] = min+1;
          changed = 1;
        }
      }
      return changed;
    };

    var step3 = function(p) {
      var lmin = lmax,
          fmin = f[p],
          nbs = al[p],
          changed = 0,
          n_i = 0,
          i = 0;

      if (v[p] == 0) {
        for (i = 0; i < nbs.length; ++i) {
          n_i = grayImg.getPixelIndex(nbs[i][0], nbs[i][1]);
          if (f[n_i] == f[p] && l[n_i] > 0 && l[n_i] < lmin) {
            lmin = l[n_i];
          }
        }
        if (lmin == lmax && l[p] == 0) {
          lmin = ++new_label;
          numb_regions++;
        }
      }
      else if (v[p] == 1) {
        for (i = 0; i < nbs.length; ++i) {
          n_i = grayImg.getPixelIndex(nbs[i][0], nbs[i][1]);
          if (f[n_i] < fmin) {
            fmin = f[n_i];
          }
        }
        for (var i = 0; i < nbs.length; ++i) {
          n_i = grayImg.getPixelIndex(nbs[i][0], nbs[i][1]);
          if (f[n_i] == fmin && l[n_i] > 0 && l[n_i] < lmin) {
            lmin = l[n_i];
          }
        }
      }
      else {
        for (i = 0; i < nbs.length; ++i) {
          n_i = grayImg.getPixelIndex(nbs[i][0], nbs[i][1]);
          if (f[n_i] == f[p] && v[n_i] == v[p]-1 && l[n_i] > 0 && l[n_i] < lmin) {
            lmin = l[n_i];
          }
        }
      }
      if (lmin != lmax && lmin != l[p]) {
        l[p] = lmin;
        changed = 1;
      }
      return changed;
    };


    window.grayImg = new Images.GrayImage(width, height, img.data);
    var msg = "Converted to Gray Image...";
    updateProgress(msg);

    window.adj_list = grayImg.computeNeighborhoods8();
    msg = "Constructed Adjacency List...";
    updateProgress(msg);

    window.f = grayImg.getArray();
    window.v = [];
    window.l = [];
    window.al = adj_list.getArray();
    window.vmax = width + height;
    window.lmax = window.l_thres;
    window.new_label = 0;
    window.numb_regions = 0;

    var i = width*height,
        scan_step2 = 1,
        scan_step3 = 1,
        p;

    while(i) {
      v[--i] = 0;
      l[i] = 0;
    }

    for( p = 0; p < width*height; ++p) {
        step1(p);
    }
    while(scan_step2) {
      scan_step2 = 0;
      for( p = 0; p < width*height; ++p) {
        if(step2(p)) {
          scan_step2 = 1;
        }
      }
      if(scan_step2) {
        scan_step2 = 0;
        for( p = width*height; p;) {
          if(step2(--p)) {
          scan_step2 = 1;
          }
        }
      }
   }
   while(scan_step3) {
     scan_step3 = 0;
     for( p = 0; p < width*height; ++p) {
       if(step3(p) == 1) {
         scan_step3 = 1;
       }
     }
     if(scan_step3) {
       scan_step3 = 0;
       for( p = width*height; p;) {
         if(step3(--p) == 1) {
           scan_step3 = 1;
         }
       }
     }
   }

   window.rMap = new Regions.RegionMap(width, height, grayImg);
   console.log("computing rMap");

   window.labelmap = l;
   var r, orig_region, x, y;
   var img_arr = grayImg.getArray();

   for ( var i = 0; i < labelmap.length; ++i ) {
        if ( labelmap[i] !== i ) { // original region merged into another
            r = rMap.getRegionByIndex( labelmap[i] );
            // Set new avg color (as integer)
            r.avg_color = ( ( r.avg_color * r.size + img_arr[i] ) / ( r.size + 1 ) ) | 0;
            // Set new centroid
            x = i % width >>> 0;
            y = (i / width) >>> 0;
            r.centroid[0] = ( r.centroid[0] * r.size + x ) / ( r.size + 1 );
            r.centroid[1] = ( r.centroid[1] * r.size + y ) / ( r.size + 1 );
            r.size++;

            // set original region to deleted
            // rMap.getRegionByIndex( i ).deleted = true;
        }
   }

    // set the right size threshold parameter
    window.size_threshold = window.ws_size_threshold;
};



///////////////////////////////////////////////////////////
//////////// KRUSKAL REGION MERGING ALGORITHM /////////////
///////////////////////////////////////////////////////////
var kruskalRegionMerging = function() {
    // prepare the necessary datastructures
    // TODO: in the future this will be algorithm independent!!!
    prepareDataStructures();


    var edges = graph.edge_list,
        px_i,                       // Pixel i (as index)
        px_j,                       // Pixel j (as index)
        r1,                         // Region i (as number)
        r2,                         // Region j (as number)
        ro1,                        // Region object 1
        ro2,                        // Region object 2
        e,                          // current edge
        tau1,                       // tau value for r1
        tau2,                       // tau value for r2
        mInt,                       // min internal diff r1 - r2
        mergers = 0;                // amount of merged regions

    for( var i = 0; i < edges.length; ++i ) {
        e = edges[i];
        px_i = grayImg.getPixelIndex(e.p1[0], e.p1[1]);
        px_j = grayImg.getPixelIndex(e.p2[0], e.p2[1]);
        r1 = djs.find(px_i);
        r2 = djs.find(px_j);

        // get regions to compute diff values
        ro1 = rMap.getRegionByIndex( r1 );
        ro2 = rMap.getRegionByIndex( r2 );

        if ( r1 === r2 || ro1.size + ro2.size > region_max_merge_size ) {
            // already merged those regions => edge would introduce cycle...
            continue;
        }

        tau1 = k / ro1.size;
        tau2 = k / ro2.size;
        mInt = Math.min(ro1.maxEdge + tau1, ro2.maxEdge + tau2);

        if( mInt > e.w ) {
            djs.union(r1, r2); // will automatically merge into the larger region

            // which region to merge into the other? => rank
            if ( djs.rank(r1) > djs.rank(r2) ) {
                rMap.merge(ro1, ro2, e);
            }
            else {
                rMap.merge(ro2, ro1, e);
            }
            ++mergers;
        }
    }
    var nr_regions = width * height - mergers;
    msg = "Merged " + mergers + " regions... \n" + nr_regions + " regions remain.";
    updateProgress(msg);

    // set the right size threshold parameter
    window.size_threshold = window.rm_size_threshold;

    // compute label array from disjoint set forest
    for( var i = 0; i < djs.size; ++i ) {
        window.labelmap[i] = djs.find(i);
    }
};


///////////////////////////////////////////////////////////
///////////////// DRAWING THE LABEL MAP ///////////////////
///////////////////////////////////////////////////////////
var drawLabelMap = function() {
    for (i = 0; i < width * height * 4; ) {
        var region = rMap.getRegionByIndex( labelmap[i / 4] );

        if ( region.size < window.size_threshold ) {
            rImg.data[i++] = 255;
            rImg.data[i++] = 255;
            rImg.data[i++] = 255;
            rImg.data[i++] = 255;
            continue;
        }

        if ( region.labelColor.length !== 3) {
            region.labelColor[0] = ( ( Math.random() * 256 ) | 0 );
            region.labelColor[1] = ( ( Math.random() * 256 ) | 0 );
            region.labelColor[2] = ( ( Math.random() * 256 ) | 0 );
        }
        rImg.data[i++] = region.labelColor[0];
        rImg.data[i++] = region.labelColor[1];
        rImg.data[i++] = region.labelColor[2];
        rImg.data[i++] = 255;
    }

    // remove Spinner image
    document.querySelector("#region_canvas").style.backgroundImage = null;
    rctx.putImageData(rImg, 0, 0);
};


///////////////////////////////////////////////////////////
///////////////// DELAUNEY TRIANGULATION //////////////////
///////////////////////////////////////////////////////////
var computeDelauney = function() {
    ///////////////////////////////////////////////////////////
    /////// PREPARE VERTICES DATASTRUCTURE FOR DELAUNEY ///////
    ///////////////////////////////////////////////////////////
    var regKeys = Object.keys(rMap.regions);
    var minSize = Number.POSITIVE_INFINITY,
        maxSize = Number.NEGATIVE_INFINITY,
        belowThreshold = 0,
        r,
        coords,
        vert_idx = 0;

    for (i = 0; i < regKeys.length; ++i) {
        r = rMap.regions[regKeys[i]];
        minSize = minSize > r.size ? r.size : minSize;
        maxSize = maxSize < r.size ? r.size : maxSize;
        if (!r.deleted && r.size < size_threshold) {
            ++belowThreshold;
        }
        else if (!r.deleted && r.size >= size_threshold) {
            coords = [ r.centroid[0], r.centroid[1] ];
            vertices[vert_idx] = coords;
            vertices_map[vert_idx++] = r;
        }
    }

    msg = "Regions vary in size from: " + minSize + " to " + maxSize + " pixels\n" +
        "There are: " + belowThreshold + " regions below the size threshold of " + window.size_threshold;
    updateProgress(msg);


    ///////////////////////////////////////////////////////////
    /////////////////// EXECUTE DELAUNEY //////////////////////
    ///////////////////////////////////////////////////////////
    triangles = Delaunay.triangulate( vertices );
};



///////////////////////////////////////////////////////////
/////////////// BUILDING THE GRAPH OBJECT /////////////////
///////////////////////////////////////////////////////////
var buildGraphObject = function() {

    window.outGraph.data = {};
    var nr_edges = 0;
    var region,
				nr_nodes = 0,
        tri,
        i;
    for( i = 0; i < triangles.length - 1; i++ ) {
        tri = triangles[i];
        region = vertices_map[tri];
        if ( typeof outGraph.data[tri] === 'undefined' ) {
            outGraph.data[tri] = {
                features: {
                  color: {
                    r: region.avg_orig_color[0],
                    g: region.avg_orig_color[1],
                    b: region.avg_orig_color[2]
                  }
                },
                node: tri,
                coords: {
                    x: parseFloat(region.centroid[0].toFixed(2)),
                    y: parseFloat(region.centroid[1].toFixed(2)),
                    z: parseFloat(region.avg_color.toFixed(2))
                },
                edges: []
            };
						nr_nodes++;
        }

        var edges = [],
            i_1,
            i_2,
            r_i_1,
            r_i_2,
            i_1_col_diff,
            i_2_col_diff;

        if (i % 3 === 0) {
            i_1 = triangles[i+1];
            i_2 = triangles[i+2];
            r_i_1 = vertices_map[i_1];
            r_i_2 = vertices_map[i_2];
            i_1_col_diff = ( parseFloat(region.avg_color.toFixed(2)) - parseFloat(r_i_1.avg_color.toFixed(2)) ).toFixed(2);
            i_2_col_diff = ( parseFloat(region.avg_color.toFixed(2)) - parseFloat(r_i_2.avg_color.toFixed(2)) ).toFixed(2);
            edges = [
              {
                to: i_1,
                directed: false,
                weight: Math.abs(i_1_col_diff)
              },
              {
                to: i_2,
                directed: false,
                weight: Math.abs(i_2_col_diff)
              }
            ];
        }
        else if (i % 3 === 1) {
            i_1 = triangles[i+1];
            r_i_1 = vertices_map[i_1];
            i_1_col_diff = parseFloat(region.avg_color.toFixed(2)) - parseFloat(r_i_1.avg_color.toFixed(2));
            edges = [
              {
                to: i_1,
                directed: false,
                weight: Math.abs(i_1_col_diff)
              }
            ];
        }
        else if (i % 3 === 2) {
            edges = [];
        }

        for (var n = 0; n < edges.length; n++) {
            var edge = edges[n],
            tri_node = edge.to;
            // other node must not be same node
            if (tri_node === tri) {
                continue;
            }

            if ( !isEdgeDuplicate(tri, edge) ) {
                outGraph.data[tri].edges.push(edge);
                nr_edges++;
            }
        }
    }

    outGraph.nodes = nr_nodes;
    outGraph.edges = nr_edges;

    document.querySelector("#img_regions .value").textContent = "" + vertices.length;
    msg = "Nodes: " + nr_nodes + ", Edges: " + nr_edges + " Time: ";
    updateProgress(msg);
};


var isEdgeDuplicate = function(tri, edge) {
  var tri_node = edge.to,
      duplicate_edge = false;

  // Check if I already hold this edge (for whatever reason??)
  var my_edges = outGraph.data[tri].edges;
  for (var my_edge in my_edges) {
    if ( my_edges[my_edge].to === tri_node ) {
        duplicate_edge = true;
    }
  }

  // Check if the target node already holds an edge towards me...
  if (typeof outGraph.data[tri_node] !== 'undefined') {
      var other_edges = outGraph.data[tri_node].edges;

      for ( var other_edge in other_edges) {
        if ( other_edges[other_edge].to === tri ) {
          duplicate_edge = true;
        }
      }

  }

  return duplicate_edge;
}


///////////////////////////////////////////////////////////
////////////////// DRAW DELAUNEY TO UI ////////////////////
///////////////////////////////////////////////////////////
var drawDelauney = function() {
    delctx.clearRect(0, 0, canvas.width, canvas.height);
    for(i = triangles.length; i; ) {
        delctx.beginPath();
        --i; delctx.moveTo(vertices[triangles[i]][0], vertices[triangles[i]][1]);
        --i; delctx.lineTo(vertices[triangles[i]][0], vertices[triangles[i]][1]);
        --i; delctx.lineTo(vertices[triangles[i]][0], vertices[triangles[i]][1]);
        delctx.closePath();
        delctx.stroke();
    }
};


//-------------------------------------------------------
//                  DRAW GRAPH TO UI
//-------------------------------------------------------
var drawGraph = function() {
    delctx.clearRect(0, 0, canvas.width, canvas.height);

    var node_keys = Object.keys(outGraph.data);
    for ( var i = 0; i < node_keys.length; i++ ) {
        var node = outGraph.data[node_keys[i]];
        for (var e = 0; e < node.edges.length; e++) {
            var target = node.edges[e].to;
            delctx.beginPath();
            delctx.moveTo(node.coords.x, node.coords.y);
            delctx.lineTo(outGraph.data[target].coords.x, outGraph.data[target].coords.y);
            delctx.stroke();
        }
    }
};


//-------------------------------------------------------
//                 ARRAY INCLUDES HELPER
//-------------------------------------------------------
if (![].includes) {
    Array.prototype.includes = function(searchElement /*, fromIndex*/ ) {
        'use strict';
        var O = Object(this);
        var len = parseInt(O.length) || 0;
        if (len === 0) {
            return false;
        }
        var n = parseInt(arguments[1]) || 0;
        var k;
        if (n >= 0) {
            k = n;
        } else {
            k = len + n;
            if (k < 0) {k = 0;}
        }
        var currentElement;
        while (k < len) {
            currentElement = O[k];
            if (searchElement === currentElement ||
                (searchElement !== searchElement && currentElement !== currentElement)) {
                return true;
            }
            k++;
        }
        return false;
    };
}
