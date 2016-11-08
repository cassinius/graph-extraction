
window.onload = function() {
    document.querySelector("#proc_grayscale").addEventListener('click', function() {
        $PP.grayscale();
    });

    document.querySelector("#proc_invert").addEventListener('click', function() {
        $PP.invertColor();
    });

    document.querySelector("#proc_sharpen").addEventListener('click', function() {
        $PP.sharpen();
    });

    document.querySelector("#proc_blur").addEventListener('click', function() {
        $PP.blur();
    });

    document.querySelector("#proc_sobel").addEventListener('click', function() {
        $PP.sobel();
    });

    document.querySelector("#img_canvas_box").addEventListener('mouseover', function() {
        document.querySelector("#click_text").style.top = 340;
    });

    document.querySelector("#img_canvas_box").addEventListener('mouseout', function() {
        document.querySelector("#click_text").style.top = 582;
    });

    window.updateKThres = function(value) {
        window.k = value;
        document.querySelector("#k-threshold-info").textContent = value;
    };

    window.updateRMSizeThres = function(value) {
        window.rm_size_threshold = value;
        document.querySelector("#rm-size-threshold-info").textContent = value;
    };

    window.updateMaxMerge = function(value) {
        value = value < 3000 ? value : Number.POSITIVE_INFINITY;
        window.region_max_merge_size = value;
        document.querySelector("#max-merge-info").textContent = value;
    };

    window.updateLThres = function(value) {
        window.l_thres = value;
        document.querySelector("#l-threshold-info").textContent = value;
    };

    window.updateWSSizeThres = function(value) {
        window.ws_size_threshold = value;
        document.querySelector("#ws-size-threshold-info").textContent = value;
    };

    window.k = document.querySelector("#k-threshold").value;
    document.querySelector("#k-threshold-info").textContent = k;

    window.rm_size_threshold = document.querySelector("#rm-size-threshold").value;
    document.querySelector("#rm-size-threshold-info").textContent = rm_size_threshold;

    window.region_max_merge_size = document.querySelector("#max-merge").value;
    document.querySelector("#max-merge-info").textContent = region_max_merge_size;

    window.l_thres = document.querySelector("#l-threshold").value;
    document.querySelector("#l-threshold-info").textContent = l_thres;

    window.ws_size_threshold = document.querySelector("#ws-size-threshold").value;
    document.querySelector("#ws-size-threshold-info").textContent = ws_size_threshold;

    updateMaxMerge(Number.POSITIVE_INFINITY);


    //
    window.batchKruskal = function() {
        console.log('Starting batch Kruskal...');

        //async.eachSeries($("#folder-drop > span > img"), function(img, callback) {
        //    console.log(img);
        //    callback();
        //});

        async.eachSeries($("#folder-drop > span > img"), function(img, done) {
          console.log('Starting graph extraction on single image.');

            window.graphs = [];
            // mark active
            $("#folder-drop > span > img").removeClass('selected');
            $(img).addClass('selected');

            // read image into the image canvas
            // it's async => so give the next operation a timeout
            render(img.src);

            setTimeout(function() {
                // execute Kruskal with timeout, so render can finish
                startGraphExtraction("kruskalrm", function() {
                    
                    var json_graph = window.graphs[img.title] = JSON.parse(JSON.stringify(window.outGraph));                    
                    json_graph['name'] = img.title;
                    var filename = img.title.split('.')[0] + '.json';
                    var uriContent = "data:application/octet-stream, " + encodeURIComponent(JSON.stringify(json_graph));
                    
                    download(uriContent, filename, "data:application/octet-stream");                   
                    
                    
                    // var link = $("#hidden-download")[0];
                    // $(link).attr("href", uriContent).attr("download", filename);

                    // // NOW immediately download this stuff...
                    // $(link)[0].click();

                    // console.log("Finished graph extraction on single image.");

                    done()
                });
            }, 100);
        });
    };


    // document.querySelector("#start_visualization").addEventListener('click', function(e) {
    //     e.preventDefault();
    //     var divText = document.querySelector("#graph_visualization").outerHTML;
    //     var vizWindow = window.open('','','width=1200,height=1000');
    //     vizWindow.$ = $;
    //     vizWindow.Detector = Detector;
    //     vizWindow.THREE = THREE;
    //     vizWindow.THREE.FirstPersonControls = THREE.FirstPersonControls;
    //     vizWindow.Graph3D = Graph3D;
    //     var doc = vizWindow.document;
    //     doc.open();
    //     doc.write(divText);
    //     var graphviz = new Graph3D( doc.querySelector("#vis_canvas"),
    //                                 false,
    //                                 false,
    //                                 0x111111,
    //                                 doc.querySelector("#stats"),
    //                                 doc.querySelector("#message"),
    //                                 doc.querySelector("#info"),
    //                                 1,
    //                                 outGraph,
    //                                 0
    //                                );
    //     graphviz.start();
    //     doc.close();
    //     return false;
    // });


    // document.querySelector("#start_visualization").addEventListener('click', function(e) {
    //     e.preventDefault();

    //     var doc = document;
    //     doc.querySelector("#graph_visualization").style.display = "block";
    //     var graphviz = new Graph3D( doc.querySelector("#vis_canvas"),
    //                                 false,
    //                                 false,
    //                                 0x111111,
    //                                 doc.querySelector("#stats"),
    //                                 doc.querySelector("#message"),
    //                                 doc.querySelector("#info"),
    //                                 1,
    //                                 outGraph,
    //                                 0
    //                                );
    //     graphviz.start();
    //     doc.close();
    //     return false;
    // });

};
