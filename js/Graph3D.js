/** 
 * @author Matthias Reischer <matthias.reischer@student.tugraz.at>, 0430677
 * @since  31.05.2014, 20:54:30
 * @copyright (c) 2014 Matthias Reischer
 * 
 * This is a Graph3D Object, that will extend Three.js and Three.FirstPersonControls
 * It will display the graph in the given canvas object
 * 
 * @filename Graph3D.js
 * 
 * @param {type} canvas the given canvas object Example: document.getElementById("canvas")
 * @param {type} color_objects        Example: 0xff0000 (red)
 * @param {type} color_found_object   Example: 0x00D66B (green)
 * @param {type} clear_color          Example: 0xbfd1e5 (light blue)
 * @param {type} stats_html the given <div></div> element (document.getElementById("stats"))
 * @param {type} graph_information    Where the Json Information should be displayed
 * @param {type} choosen_geometry posible Values:
 *               1 = new THREE.SphereGeometry(10, 10, 3);
 *               2 = new THREE.IcosahedronGeometry(10);
 *               3 = new THREE.OctahedronGeometry(10);
 *               4 = new THREE.TorusKnotGeometry(10, 3, 100, 16);
 *               5 = new THREE.CylinderGeometry(5, 5, 20, 32);
 *                
 * @param {type} json_path relative path needed; Example: "../graphs/graph_small.json"
 * @param {type} use_terran
 * @returns {Graph3D}
 */
var Graph3D = function(canvas, color_objects, color_found_object, clear_color, stats_html, message, graph_information, choosen_geometry, data, use_terran) {
 
  /* base color and intersect color for graphs */
  this.base_color_ = (color_objects !== (undefined || false)) ? color_objects : 0xffffff;
  this.intersect_color_ = (color_found_object !== (undefined || false)) ? color_found_object : 0x00D66B;

  this.canvas_ = canvas;
  /*detector for errors */
  this.detector_ = Detector;

  /* camera_, scene_,projector_ and renderer_ from Three.js */
  this.camera_;

  /* create a scene */
  this.scene_ = new THREE.Scene();
  this.renderer_;
  this.projector_;

  /* stats and Three.js clock */
  this.stats_;
  this.clock_ = new THREE.Clock();

  /* used controls */
  this.controls_;

  /* later used geometry and line material */
  this.geometry_;
  this.line_material_ = new THREE.LineBasicMaterial({color: 0xcccccc, linewidth: 1});

  /* plane geometry for terran use */
  this.plane_geometry_;

  /* object array for all the objects to ray cast them and intersected var */
  this.objects_ = [];

  this.vertizes_terran_ = [];
  this.intersected_;

  /* to show fps */
  this.stats_html_ = (stats_html !== undefined) ? stats_html : false;

  /* mouse in a vector to easier calculate raycast later */
  this.mouse_ = new THREE.Vector2()

  /* chosen geometry */
  this.choosen_geometry_ = choosen_geometry;

  /* message for error output */
  this.message_ = (message !== undefined) ? message : false;

  /* where to put the graph information */
  this.graph_information_ = (graph_information !== undefined) ? graph_information : false;

  /* clear color = background color should be in normal a light color for looking */
  this.clear_color_ = (clear_color !== (undefined || false)) ? new THREE.Color(parseInt(clear_color, 16)) : new THREE.Color(parseInt(0x111111, 16));

  /* Boolean 1 = use_terran yes; 0=no*/
  this.use_terran_ = use_terran;
  /* path to json file */
  //this.json_path_ = (json_path !== undefined) ? json_path : this.message_.innerHTML = "Sorry, an error occurred: Json Path is wrong!";
  this.data_ = data;
 

  /*save the scope for later use */
  var scope = this;

  /* give user a message if something is gone wrong */
  if (!Detector.webgl)
    Detector.addGetWebGLMessage();

  /**
   * If window resize update:
   * camera.aspect
   * camera.updateProjectionMatrix()
   * controls.handleResize()
   * 
   * and call render method
   */
  this.onWindowResize = function() {
    this.camera_.aspect = this.canvas_.width / this.canvas_.height;
    this.camera_.updateProjectionMatrix();

    this.controls_.handleResize();

    render();
  }


  /**
   * Start function to get the rendering going
   * Will initialize the content by calling inti();
   */
  this.start = function() {

    if (this.stats_html_) {
      /* if stats are enabled add them to the given <div> element*/
      this.stats_ = new Stats();
      this.stats_html_.appendChild(this.stats_.domElement);
    }

    /* give the user the possibiliy to set different Gemoetry using the std of three.js*/
    if (this.choosen_geometry_ == 1)
      this.geometry_ = new THREE.SphereGeometry(2, 2, 3);
    if (this.choosen_geometry_ == 2)
      this.geometry_ = new THREE.IcosahedronGeometry(2);
    if (this.choosen_geometry_ == 3)
      this.geometry_ = new THREE.OctahedronGeometry(2);
    if (this.choosen_geometry_ == 4)
      this.geometry_ = new THREE.TorusKnotGeometry(2, 3, 100, 16);
    if (this.choosen_geometry_ == 5)
      this.geometry_ = new THREE.CylinderGeometry(2, 2, 20, 32);


    /* get the json path and initialize it */
    this.init(this.data_);

    /* sample camera position TODO: maybe later use calculated position*/
    this.camera_.position.z = 200;
    this.camera_.position.x = -300;
    this.camera_.position.y = 200;

    /* start animation and render it */
    //this.animate();
    render();
  };

  /**
   * Will be called by start
   * loads the Engine, canvas, render object and add the json objects and lines
   * 
   * @param {type} json_path
   * @returns {unresolved}
   */
  this.init = function(data) {
    try {
      if (!this.canvas_ || !this.canvas_.getContext) {
        this.message_.innerHTML =
                "Sorry, your browser doesn't support canvas graphics.";
        return;
      }

      /* create the renderer and set the canvas object */
      this.renderer_ = new THREE.WebGLRenderer({
        canvas: this.canvas_,
        antialias: false
      });

      /* create the PerspectiveCamera camera */
      this.camera_ = new THREE.PerspectiveCamera(75, this.canvas_.width / this.canvas_.height, 1, 10000);



       
      /* set the renderer size use the canvas width and height so the user could define it*/
      this.renderer_.setSize(this.canvas_.width, this.canvas_.height);
      this.renderer_.setClearColor(parseInt(0x111111), 1);


      /**
       * Read the Json File and generate the objects in the given space
       * 
       * Path will be something like (location.pathname + "../graphs/graph_small.json")
       * 
       * Estimated Time: min(O(n))
       *                 max(O(n^2)) -> if every knot has a line to every other knot 
       * use_terran = TRUE:
       * Estimated Time:   O(n)  
       */
      /* reassign this. for later use */


      var i = 0;
      if (this.use_terran_)
        this.plane_geometry_ = new THREE.PlaneGeometry(2000, 2000, Object.keys(data).length, 1);
        
      $.each(data, function(key, val) {
        /* build up the terran */
        if (scope.use_terran_) {
          /* use the z values */
          scope.plane_geometry_.vertices[i].z = val.coords.z;
          //scope.plane_geometry_.vertices[i].x = val.coords.x;
          //scope.plane_geometry_.vertices[i].y = val.coords.y;
          i++;


        } else {
          var material = new THREE.MeshLambertMaterial({color: scope.base_color_, shading: THREE.FlatShading});
          var mesh = new THREE.Mesh(scope.geometry_, material);
          mesh.position.x = val.coords.x;
          mesh.position.y = val.coords.y;
          mesh.position.z = val.coords.z;

          /* write the data to the mesh so it could easily displayed later */
          mesh.name = "Max Grad:" + val.features.maxGrad + "<br/>" + "Max MSTW:" + val.features.maxMSTW + "<br/>" + "Min Grad:" + val.features.minGrad + "<br/>" + "Min Grad:" + val.features.minMSTW + "<br/>";

          mesh.updateMatrix();
          mesh.matrixAutoUpdate = false;
          scope.scene_.add(mesh);

          /* add to objects (for later raycasting and informations) */
          scope.objects_.push(mesh);

          /* generate the geometry lines on the fly and reuse them or it will take to long */
          var geometry_lines = new THREE.Geometry();

          /* maybe more edges are given */
          $.each(data[key].edges, function(key_edges, value_edges) {

            /* draw a line between them start point: this one; end point store it in an array */
            geometry_lines.vertices.push(new THREE.Vector3(mesh.position.x, mesh.position.y, mesh.position.z));
            geometry_lines.vertices.push(new THREE.Vector3(data[value_edges].coords.x, data[value_edges].coords.y, data[value_edges].coords.z));
          });

          /* lines */
          /* funny use not initializ^e material will look just colorfull^*/
          //var line = new THREE.Line(geometry_lines, this.line_material_);
          var line = new THREE.Line(geometry_lines, scope.line_material_);
          scope.scene_.add(line);
        }
      }

      );

      if (scope.use_terran_) {

        var material = new THREE.MeshBasicMaterial({
          color: 0xdddddd,
          wireframe: true
        });
        var plane = new THREE.Mesh(scope.plane_geometry_, material);
        plane.material.side = THREE.DoubleSide;
        plane.overdraw = true;

        scope.scene_.add(plane);

      }



      /* compute the Vertex normals */
      this.geometry_.computeVertexNormals();

      /* sample position */
      this.camera_.position.z = -500;
      this.camera_.position.x = 1300;
      this.camera_.position.y = 800;

      this.projector_ = new THREE.Projector();

      /* add the mouse event listener */
      this.canvas_.addEventListener('mousemove', this.onDocumentMouseMove.bind(this), false);

      /* generate the controls and set them with some basic settings */
      this.controls_ = new THREE.FirstPersonControls(this.camera_, this.canvas_);
      
      this.controls_.movementSpeed = 1000;
      this.controls_.lookSpeed = 0.125;
      this.controls_.activeLook = true;

      /* add some light */
      this.light_ = new THREE.DirectionalLight(0xffffff);
      this.light_.position.set(1, 1, 1);
      this.scene_.add(this.light_);

      this.light_ = new THREE.DirectionalLight(0xFFFFFF);
      this.light_.position.set(-1, -1, -1);
      this.scene_.add(this.light_);

      this.light_ = new THREE.AmbientLight(0x222222);
      this.scene_.add(this.light_);

      /* add resize listener */
      window.addEventListener('resize', this.onWindowResize.bind(this), false);
    }
    catch (e) {
      document.getElementById("message").innerHTML = "Sorry, an error occurred: " + e;
    }
  };

  /* render Method
   * will call stats controls and renderer
   * Will update the camera projection Matrix  
   */
  function render() {
    requestAnimationFrame(render);
    scope.controls_.update(scope.clock_.getDelta());
    scope.renderer_.render(scope.scene_, scope.camera_);
    scope.camera_.updateProjectionMatrix();

    if (scope.stats_)
      scope.stats_.update();
  }

  /*
   * onDocumentMouseMove Function
   * 
   * Will do a raycast:
   *  take the mouse coords from the canvas object
   *  Do a raycast from camera position + vector.sub(this.camera_.position.normalize())
   *  
   *  All objects that had an intersection will be store in intersections
   * 
   */
  this.onDocumentMouseMove = function() {
    //debug mouse coords live
    //console.log(this.controls_.mouseCoordLiveX + " " + this.controls_.mouseCoordLiveY);
    /* get the mouse coordinates */
    this.mouse_.x = (this.controls_.mouseCoordLiveX / this.canvas_.width) * 2 - 1;
    this.mouse_.y = -(this.controls_.mouseCoordLiveY / this.canvas_.height) * 2 + 1;

    if (scope.use_terran_) {
    } else {
      var vector = new THREE.Vector3(this.mouse_.x, this.mouse_.y, 0.5);

      this.projector_.unprojectVector(vector, this.camera_, true);

      var raycaster = new THREE.Raycaster(this.camera_.position, vector.sub(this.camera_.position).normalize());
      var intersections;

      intersections = raycaster.intersectObjects(this.objects_);

      if (intersections.length > 0) {

        if (this.intersected_ != intersections[0].object) {

          if (this.intersected_)
            this.intersected_.material.color.setHex(this.base_color_);

          this.intersected_ = intersections[ 0 ].object;
          this.intersected_.material.color.setHex(this.intersect_color_);

          /* give the use the message behind the json */
          $(this.graph_information_).html(intersections[0].object.name);
        } else {
        }
      }
      else if (this.intersected_) {
        this.intersected_.material.color.setHex(this.base_color_);
        this.intersected_ = null;
      } else {
      }
    }
  }
}