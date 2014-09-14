var controls, renderer, scene, camera, stats;
var node_attr, colscale, colscale2;
var particleMaterial, barMaterial, faceMaterial, particlegeom, bargeom, particlesys, barsys, facegeom, facesys;

function init() {
    console.log("init in app_3.js");

    if (!Detector.webgl) Detector.addGetWebGLMessage();

    // currently these aren't in use
    var minaxial, maxaxial, mindeform, maxdeform;

// geometry & topology
// analysis results
    var WIDTH = window.innerWidth;
    var HEIGHT = window.innerHeight;

// generate color scale

    var tempcolscale;
    var tempcols = ['green'];
    tempcolscale = chroma.scale(['black', 'blue', 'red', 'white']).domain([0, 1], 50).colors();
    colscale2 = new chroma.scale(['black', 'blue', 'red', 'white']).domain([0, 1], 100).out('rgb');
    tempcols = tempcols.concat(tempcolscale);
    colscale = new chroma.scale(tempcols).domain([0, 0.01, 0.02, 0.04, 0.06, 0.08, 0.1, 0.12, 0.14, 0.16, 0.18, 0.2, 0.22, 0.24, 0.26, 0.28, 0.3, 0.32, 0.34,
        0.36, 0.38, 0.4, 0.42, 0.44, 0.46, 0.48, 0.5, 0.52, 0.54, 0.56, 0.58, 0.6, 0.62, 0.64, 0.66, 0.68, 0.7, 0.72, 0.74, 0.76, 0.78, 0.8, 0.82, 0.84, 0.86, 0.88, 0.9, 0.92, 0.94, 0.96, 0.98, 1.0]).out('rgb');//.mode('lab');

// create materials and geometry containers for nodes, bars, and meshes
    node_attr = {
        size: { type: 'f', value: [] },
        customColor: { type: 'c', value: [] }
    };

    var node_unif = {
        color: { type: "c", value: new THREE.Color(0xffffff) },
        texture: { type: "t", value: THREE.ImageUtils.loadTexture("/static/data/particle.png") },
    };


    particleMaterial = new THREE.ShaderMaterial({
        uniforms: node_unif,
        attributes: node_attr,
        vertexShader: document.getElementById('vertexshader').textContent,
        fragmentShader: document.getElementById('fragmentshader').textContent,
        depthTest: false,
        transparent: true
    });

    barMaterial = new THREE.LineBasicMaterial({color: 0x0000ff});

    faceMaterial = new THREE.MeshBasicMaterial({ opacity: 0.5, side: THREE.DoubleSide, vertexColors: THREE.VertexColors });

    // create scene
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 1, 3000);

    // center the camera
    camera.position.set(55, 70, 25);
    camera.up = new THREE.Vector3(0, 0, 1);
    camera.lookAt(scene.position);

    renderer = new THREE.WebGLRenderer({ antialias: true });

//scene.fog = new THREE.FogExp2( 0x000000, 0.0009 );


// create renderer
    renderer.setClearColor(0xEEEEEE, 1.0);
    renderer.setSize(WIDTH, HEIGHT);
    var container = document.createElement('div');
    document.body.appendChild(container);

    container.appendChild(renderer.domElement);
    renderer.shadowMapEnabled = true;


// create the ground plane
    var planeGeometry = new THREE.PlaneGeometry(60, 40, 1, 1);
    var planeMaterial = new THREE.MeshLambertMaterial({color: 0xffffff});
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.receiveShadow = true;

// rotate and position the plane
    plane.position.x = 8.5;
    plane.position.y = 33.5;
    plane.position.z = 0;

    scene.add(plane);


    particlegeom = new THREE.Geometry();
    bargeom = new THREE.Geometry();
    facegeom = new THREE.Geometry();

// camera controls
    controls = new THREE.TrackballControls(camera, renderer.domElement);
    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 5;
    controls.panSpeed = 0.8;
    controls.noZoom = false;
    controls.noPan = false;
    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;

// FPS stats
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    container.appendChild(stats.domElement);

// GUI for interacting with data
    var gui = new dat.GUI({ autoPlace: false });

    var dgContainer = document.getElementById('datguiContainer');
    dgContainer.appendChild(gui.domElement);

    parameters = {
        analysis: 1.0,
        previewtype: 'Mesh',
        meshtype: 'Solid'
    };

// var currentFreq = gui.add( parameters, 'analysis' ).min(1).max(analysiscount).step(1).name('AnalysisScrubber').listen();
// currentFreq.onChange(function(value)
//                {   updatePoints(value-1, axialData);    });

    var previewType = gui.add(parameters, 'previewtype', [ 'Mesh', 'Nodes', 'Both' ]).name('Preview Type').listen();
    previewType.onChange(function () {
        if (parameters.previewtype === 'Mesh') {
            facesys.visible = true;
            particlesys.visible = false;
        } else if (parameters.previewtype === 'Nodes') {
            facesys.visible = false;
            particlesys.visible = true;
        } else if (parameters.previewtype === 'Both') {
            facesys.visible = true;
            particlesys.visible = true;
        }
        console.log("preview type onchange");
        renderer.render(scene, camera);
    });

    var meshType = gui.add(parameters, 'meshtype', [ 'Solid', 'Wireframe' ]).name('Mesh Display').listen();
    meshType.onChange(function () {
        if (parameters.meshtype === 'Solid') {
            facesys.material.setValues({ wireframe: false });
        } else if (parameters.meshtype === 'Wireframe') {
            facesys.material.setValues({ wireframe: true });
        }
        renderer.render(scene, camera);
    });

    gui.open();


// lights
    var ambient = new THREE.AmbientLight(0x101010);
    scene.add(ambient);

    var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 2).normalize();
    scene.add(directionalLight);

}

function clearScene() {
    var objsToRemove = scene.children;
    console.log("Deleting " + objsToRemove.length + " objects");
    // note: once .remove() is called it is taken out of the array, so just
    // remove the first item in the array till there are no more left
    while (objsToRemove.length > 0) {
        // console.log("Deleting uuid " + objsToRemove[0].uuid);
        scene.remove(objsToRemove[0]);
    }
    particlegeom = new THREE.Geometry();
    bargeom = new THREE.Geometry();
    facegeom = new THREE.Geometry();
    // console.log("particlegeom.vertices.length: " +  particlegeom.vertices.length);
    renderer.clear();
};

function load_data(nodeData, barData, elemData, defData, axialData) {
    if (typeof nodeData === 'undefined') {
        console.log("nodeData not defined");
        return;
    }
    if (typeof barData === 'undefined') {
        console.log("barData not defined");
        return;
    }
    if( typeof elemData === 'undefined') {
         console.log("elemData not defined");
        return;
    }
    if (typeof defData === 'undefined') {
          console.log("defData not defined");
        return;
    }
    if (typeof axialData === 'undefined') {
        console.log("axialData not defined");
        return;
    }

    clearScene();

    console.log("nodeDataLen: " + nodeData.length + " first: " + nodeData[0] + ", barDataLen: " + barData.length
        + ", elemDataLen: " + elemData.length + ", defData: " + defData.length + ", axialData: " + axialData.length);

    // extract max and mins
    // var mindeform = defData[defData.length - 1][0];
    var maxdeform = defData[defData.length - 1][0];
    var minaxial = axialData[axialData.length - 1][0];
    var maxaxial = axialData[axialData.length - 1][1];

    var radius;
    // // if there are multiple analysis runs, extract how many runs
    // analysiscount = axialData[0].length;
    // minanalysis = axialData[0][0];
    // maxanalysis = axialData[0][analysiscount-1];


    // process nodes
    var node_size = node_attr.size.value;
    var node_color = node_attr.customColor.value;
    for (var v = 0; v < nodeData.length; v++) {
        node_size[ v ] = 10;

        var vertex = new THREE.Vector3();
        vertex.x = nodeData[v][0];
        vertex.y = nodeData[v][1];
        vertex.z = nodeData[v][2];

        particlegeom.vertices.push(vertex);
        facegeom.vertices.push(vertex);

        tmprgb = colscale(axialData[v][0] / maxdeform);
        node_color[v] = new THREE.Color(0xffaa00);
        node_color[v].setRGB(tmprgb[0] / 255, tmprgb[1] / 255, tmprgb[2] / 255);
        //facegeom.colors.push( node_color[v] );
    }

    // process bars
    var pipes = [];
    for( var b = 0; b < barData.length; b++ ) {

        var vertex1 = new THREE.Vector3();
        var vertex2 = new THREE.Vector3();

        console.log(barData[b][0]);
        console.log(barData[b][1]);
        vertex1.x = nodeData[parseInt(barData[b][0])][0];
        vertex1.y = nodeData[parseInt(barData[b][0])][1];
        vertex1.z = nodeData[parseInt(barData[b][0])][2];

        vertex2.x = nodeData[parseInt(barData[b][1])][0];
        vertex2.y = nodeData[parseInt(barData[b][1])][1];
        vertex2.z = nodeData[parseInt(barData[b][1])][2];

        bargeom.vertices.push( vertex1 );
        bargeom.vertices.push( vertex2 );

        radius = axialData[b][1] / 2000;

        var direction = new THREE.Vector3();
        direction.x = vertex2.x - vertex1.x;
        direction.y = vertex2.y - vertex1.y;
        direction.z = vertex2.z - vertex1.z;

        var pipeGeometry = new THREE.PipeGeometry( radius, direction.length(), 8);
        pipeGeometry.applyMatrix( new THREE.Matrix4().makeRotationFromEuler( new THREE.Euler( Math.PI / 2, Math.PI, 0 ) ) );

        var pipeColor = new THREE.Color(axialData[b][2],axialData[b][3],axialData[b][4]);
        console.log(pipeColor);
        var pipeMaterial = new THREE.MeshPhongMaterial( { ambient: 0x030303, color: pipeColor, specular: 0x009900, shininess: 30, shading: THREE.SmoothShading });

        pipes[b] = new THREE.Mesh(pipeGeometry, pipeMaterial);

        pipes[b].position.x = vertex1.x;
        pipes[b].position.y = vertex1.y;
        pipes[b].position.z = vertex1.z;
        pipes[b].lookAt(vertex2);

    }


    // process Elements
    for (var f = 0; f < elemData.length; f++) {
        var face = new THREE.Face3();
        face.a = parseInt(elemData[f][0]);
        face.b = parseInt(elemData[f][1]);
        face.c = parseInt(elemData[f][2]);
        face.vertexColors[0] = node_color[elemData[f][0]];
        face.vertexColors[1] = node_color[elemData[f][1]];
        face.vertexColors[2] = node_color[elemData[f][2]];

        facegeom.faces.push(face);

        //Check if it's a 4 sided face
        if (elemData[f][3] != "#N/A") {
            var face1 = new THREE.Face3();
            face1.a = parseInt(elemData[f][2]);
            face1.b = parseInt(elemData[f][3]);
            face1.c = parseInt(elemData[f][0]);
            face1.vertexColors[0] = node_color[elemData[f][2]];
            face1.vertexColors[1] = node_color[elemData[f][3]];
            face1.vertexColors[2] = node_color[elemData[f][0]];
            facegeom.faces.push(face1);
        }

    }

    // add particle system
    console.log("First particle: (" + particlegeom.vertices[0].x + "," + particlegeom.vertices[0].y + "," + particlegeom.vertices[0].z + ")");
    particlesys = new THREE.ParticleSystem(particlegeom, particleMaterial);
    particlesys.dynamic = true;

    // add line system
    barsys = new THREE.Line(bargeom, barMaterial, THREE.LinePieces);
    barsys.dynamic = true;

    // add pipe system
    // pipe meshes created inside loop for now TODO

    // add mesh faces
    facegeom.mergeVertices();
    facegeom.computeCentroids();
    facegeom.computeFaceNormals();
    facegeom.computeVertexNormals();

    facesys = new THREE.Mesh(facegeom, faceMaterial);
    facesys.dynamic = true;

    // add all geometries to THREE scene
    scene.add(particlesys);
    scene.add(barsys);
    scene.add(facesys);
    for( var b = 1; b < barData.length; b++ ) {
        scene.add(pipes[b]);
    }

    window.addEventListener('resize', onWindowResize, false);
}

function updateGeom(value) {
    var tmprgb;
    var tmprspf;
    var tmptest;
    var colors = [];
    var facecount = 0;
    for (var v = 0; v < node_attr.customColor.value.length; v++) { //node_attr.customColor.value.length
        tmprspf = axialData[v + 1][value];
        tmprgb = colscale2(tmprspf / 49.6086102009798);
        colors[v] = new THREE.Color;
        colors[v].setRGB(tmprgb[0] / 255, tmprgb[1] / 255, tmprgb[2] / 255);
        node_attr.customColor.value[ v ].setRGB(tmprgb[0] / 255, tmprgb[1] / 255, tmprgb[2] / 255);
        //facegeom.colors[v] = node_color[v] );
    }

    for (var f = 0; f < elemData.length; f++) {

        facesys.geometry.colors[f + 0] = colors[elemData[f][0]];
        facesys.geometry.colors[f + 1] = colors[elemData[f][1]];
        facesys.geometry.colors[f + 2] = colors[elemData[f][2]];

        //Check if it's a 4 sided face
        if (elemData[f][3] != "#N/A") {
            facesys.geometry.colors[f + 0] = colors[elemData[f][2]];
            facesys.geometry.colors[f + 1] = colors[elemData[f][3]];
            facesys.geometry.colors[f + 2] = colors[elemData[f][0]];
        }

    }

    node_attr.customColor.needsUpdate = true;
    facesys.geometry.mergeVertices();
    facesys.geometry.colorsNeedUpdate = true;
    document.getElementById('pacefreq').innerHTML = 'Pace Frequency = <b>' + Math.round(axialData[0][value] * 100) / 100 + '</b> Hz, Response Factor Analysis Type = <b>' + parameters.respfactortype + '</b>';
    renderer.render(scene, camera);
}

function updatePoints(value) {
    var tmprgb;
    var tmprspf;
    var tmptest;
    var colors = [];
    var facecount = 0;
    for (var v = 0; v < node_attr.customColor.value.length; v++) { //node_attr.customColor.value.length
        tmprspf = axialData[v + 1][value];
        tmprgb = colscale2(tmprspf / 49.6086102009798);
        colors[v] = new THREE.Color;
        colors[v].setRGB(tmprgb[0] / 255, tmprgb[1] / 255, tmprgb[2] / 255);
        node_attr.customColor.value[ v ].setRGB(tmprgb[0] / 255, tmprgb[1] / 255, tmprgb[2] / 255);
        //facegeom.colors[v] = node_color[v] );
    }

    for (var f = 0; f < elemData.length; f++) {

        facesys.geometry.colors[f + 0] = colors[elemData[f][0]];
        facesys.geometry.colors[f + 1] = colors[elemData[f][1]];
        facesys.geometry.colors[f + 2] = colors[elemData[f][2]];

        //Check if it's a 4 sided face
        if (elemData[f][3] != "#N/A") {
            facesys.geometry.colors[f + 0] = colors[elemData[f][2]];
            facesys.geometry.colors[f + 1] = colors[elemData[f][3]];
            facesys.geometry.colors[f + 2] = colors[elemData[f][0]];
        }

    }

    node_attr.customColor.needsUpdate = true;
    facesys.geometry.mergeVertices();
    facesys.geometry.colorsNeedUpdate = true;
    document.getElementById('pacefreq').innerHTML = 'Pace Frequency = <b>' + Math.round(axialData[0][value] * 100) / 100 + '</b> Hz, Response Factor Analysis Type = <b>' + parameters.respfactortype + '</b>';
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    controls.update();
    renderer.render(scene, camera);
    stats.update();
};

init();
animate();
