var particlegeom, particlesys, facegeom, facesys, node_unif, node_attr;                                                                                                                 
var respfactorData = [];                                                                                                                                                                
var resrfData = [];                                                                                                                                                                
var trnrfData = [];                                                                                                                                                                
var maxrfData = [];                                                                                                                                                                
var elemData = [];                                                                                                                                                                      
                                                                                                                                                                                       
var pacefreqcount, minfp, maxfp;                                                                                                                                                        
                                                                                                                                                                                       
                                                                                                                                                                                       
var node_size;                                                                                                                                                                          
//500000                                                                                                                                                                                
                                                                                                                                                                                       
var WIDTH = document.getElementById("container").style.width;                                                                                                                                                         
var HEIGHT = document.getElementById("main").style.height;                                                                                                                                                         
                                                                                                                                                                                       
// generate color scale                                                                                                                                                                 
                                                                                                                                                                                       
var colscale, tmprgb;                                                                                                                                                                   
var tempcolscale;                                                                                                                                                                       
var tempcols = ['green'];                                                                                                                                                               
tempcolscale = chroma.scale(['black','blue','red','white']).domain([0,1],50).colors();                                                                                                  
colscale2 = new chroma.scale(['black','blue','red','white']).domain([0,1],100).out('rgb');                                                                                                  
tempcols = tempcols.concat(tempcolscale);                                                                                                                                               
colscale = new chroma.scale(tempcols).domain([0,0.01,0.02,0.04,0.06,0.08,0.1,0.12,0.14,0.16,0.18,0.2,0.22,0.24,0.26,0.28,0.3,0.32,0.34,                                                               
0.36,0.38,0.4,0.42,0.44,0.46,0.48,0.5,0.52,0.54,0.56,0.58,0.6,0.62,0.64,0.66,0.68,0.7,0.72,0.74,0.76,0.78,0.8,0.82,0.84,0.86,0.88,0.9,0.92,0.94,0.96,0.98,1.0]).out('rgb');//.mode('lab');   
                                                                                                                                                                                       
loaddata();                                                                                                                                                                             
                                                                                                                                                                                       
// load CSV data, then load THREE scene                                                                                                                                                 
function loaddata() {                                                                                                                                                                   
    $.when(                                                                                                                                                                            
        $.ajax({                                                                                                                                                                       
            url: '140603 LE HCG Vibration Tool_nodes.csv ',                                                                                                                                                
            dataType: 'text',                                                                                                                                                          
            cache: false                                                                                                                                                               
        }),                                                                                                                                                                            
        $.ajax({                                                                                                                                                                       
            url: '140603 LE HCG Vibration Tool_resonantfactors.csv',                                                                                                                                      
            dataType: 'text',                                                                                                                                                          
            cache: false                                                                                                                                                               
        }),                                                                                                                                                                            
        $.ajax({                                                                                                                                                                       
            url: '140603 LE HCG Vibration Tool_transientfactors.csv',                                                                                                                                      
            dataType: 'text',                                                                                                                                                          
            cache: false                                                                                                                                                               
        }),                                                                                                                                                                            
        $.ajax({                                                                                                                                                                       
            url: '140603 LE HCG Vibration Tool_maxfactors.csv',                                                                                                                                      
            dataType: 'text',                                                                                                                                                          
            cache: false                                                                                                                                                               
        }),                                                                                                                                                                            
        $.ajax({                                                                                                                                                                       
            url: '140603 LE HCG Vibration Tool_elements.csv',                                                                                                                                             
            dataType: 'text',                                                                                                                                                          
            cache: false                                                                                                                                                               
        })).done(function(a1,a2,a3,a4,a5){                                                                                                                                                   
                                                                                                                                                                                       
        var tempnodes = a1[0];                                                                                                                                                         
        var tempresrf = a2[0];                                                                                                                                                         
        var temptrnrf = a3[0];                                                                                                                                                         
        var tempmaxrf = a4[0];                                                                                                                                                         
        var tempelems = a5[0];                                                                                                                                                         
                                                                                                                                                                                       
        // THREE initialisation functions - don't load scene until AJAX requests complete                                                                                              
       init(tempnodes,tempresrf, temptrnrf, tempmaxrf,tempelems);                                                                                                                                            
       animate();                                                                                                                                                                      
                                                                                                                                                                                       
        })                                                                                                                                                                             
}                                                                                                                                                                                      
                                                                                                                                                                                       
function init(nodes,resrf, trnrf, maxrf, elements) {                                                                                                                                         
                                                                                                                                                                                       
    container = document.createElement( 'div' );                                                                                                                                       
    document.body.appendChild( container );                                                                                                                                            
                                                                                                                                                                                       
    camera = new THREE.PerspectiveCamera( 45, WIDTH / HEIGHT, 1, 3000 );                                                                                                               
                                                                                                                                                                                       
    // create scene                                                                                                                                                                    
                                                                                                                                                                                       
    scene = new THREE.Scene();                                                                                                                                                         
    //scene.fog = new THREE.FogExp2( 0x000000, 0.0009 );                                                                                                                               
                                                                                                                                                                                       
                                                                                                                                                                                       
    // create renderer                                                                                                                                                                 
                                                                                                                                                                                       
   renderer = new THREE.WebGLRenderer( { antialias: true } );                                                                                                                                              
    renderer.setClearColor(0xEEEEEE, 1.0);                                                                                                                                             
   renderer.setSize( WIDTH, HEIGHT );                                                                                                                                                  
   container.appendChild( renderer.domElement );                                                                                                                                       
    renderer.shadowMapEnabled = true;                                                                                                                                                  
                                                                                                                                                                                       
                                                                                                                                                                                       
    // create the ground plane                                                                                                                                                         
    var planeGeometry = new THREE.PlaneGeometry(60,40,1,1);                                                                                                                            
    var planeMaterial = new THREE.MeshLambertMaterial({color: 0xffffff});                                                                                                              
    var plane = new THREE.Mesh(planeGeometry,planeMaterial);                                                                                                                           
    plane.receiveShadow  = true;                                                                                                                                                       
                                                                                                                                                                                       
    // rotate and position the plane                                                                                                                                                   
    plane.position.x=8.5                                                                                                                                                               
    plane.position.y=33.5                                                                                                                                                              
    plane.position.z=0                                                                                                                                                                 
                                                                                                                                                                                       
    scene.add(plane);                                                                                                                                                                  
                                                                                                                                                                                       
    // load data and create geometry                                                                                                                                                   
                                                                                                                                                                                       
    nodeData = nodes.csvToArray();                                                                                                                                                     
    console.log(nodeData.length);                                                                                                                                                      
                                                                                                                                                                                       
    resrfData = resrf.csvToArray();                                                                                                                                     
    console.log(resrfData.length);                                                                                                                                                
    trnrfData = trnrf.csvToArray();                                                                                                                                     
    console.log(trnrfData.length);                                                                                                                                                
    maxrfData = maxrf.csvToArray();                                                                                                                                     
    console.log(maxrfData.length);                                                                                                                                                
    respfactorData = maxrfData;                                                                                                                                     
                                                                                                                                                                                       
    elemData = elements.csvToArray();                                                                                                                                                  
    console.log(elemData.length);                                                                                                                                                      
                                                                                                                                                                                       
    pacefreqcount = respfactorData[0].length;                                                                                                                                          
    minfp = respfactorData[0][0];                                                                                                                                                      
    maxfp = respfactorData[0][pacefreqcount-1];                                                                                                                                        
                                                                                                                                                                                       
    console.log(pacefreqcount);                                                                                                                                                        
    console.log(minfp);                                                                                                                                                                
    console.log(maxfp);                                                                                                                                                                
                                                                                                                                                                                       
                                                                                                                                                                                       
   node_attr = {                                                                                                                                                                       
                                                                                                                                                                                       
       size: { type: 'f', value: [] },                                                                                                                                                 
       customColor: { type: 'c', value: [] }                                                                                                                                           
                                                                                                                                                                                       
   };                                                                                                                                                                                  
                                                                                                                                                                                       
   node_unif = {                                                                                                                                                                       
                                                                                                                                                                                       
       color:     { type: "c", value: new THREE.Color( 0xffffff ) },                                                                                                                 
       texture:   { type: "t", value: THREE.ImageUtils.loadTexture( "particle.png" ) },                                                                           
                                                                                                                                                                                       
   };                                                                                                                                                                                  
                                                                                                                                                                                       
   //node_unif.texture.value.wrapS = node_unif.texture.value.wrapT = THREE.RepeatWrapping;                                                                                             
                                                                                                                                                                                       
   var particleMaterial = new THREE.ShaderMaterial( {                                                                                                                                  
                                                                                                                                                                                       
       uniforms:       node_unif,                                                                                                                                                      
       attributes:     node_attr,                                                                                                                                                      
       vertexShader:   document.getElementById( 'vertexshader' ).textContent,                                                                                                          
       fragmentShader: document.getElementById( 'fragmentshader' ).textContent,                                                                                                        
                                                                                                                                                                                       
       //blending:         THREE.AdditiveBlending,                                                                                                                                     
       depthTest:      false,                                                                                                                                                          
       transparent:    true                                                                                                                                                            
                                                                                                                                                                                       
   });                                                                                                                                                                                 
                                                                                                                                                                                       
   // var faceMaterial = new THREE.MeshPhongMaterial( {                                                                                                                                
   //          color: 0xffffff, ambient: 0xaaaaaa, specular: 0xffffff, shininess: 250,                                                                                                 
   //          side: THREE.DoubleSide,                                                                                                                                                 
   //          vertexColors: THREE.VertexColors                                                                                                                                        
   //  } );//new THREE.MeshLambertMaterial({color: 0x7777ff});                                                                                                                         
   var faceMaterial = new THREE.MeshBasicMaterial( { opacity: 0.5, side: THREE.DoubleSide, vertexColors: THREE.VertexColors } );                                                       
                                                                                                                                                                                       
   var radius = 200;                                                                                                                                                                   
                                                                                                                                                                                       
   particlegeom = new THREE.Geometry();                                                                                                                                                
   facegeom = new THREE.Geometry();                                                                                                                                                    
                                                                                                                                                                                       
   // geometry = new THREE.BufferGeometry();                                                                                                                                           
                                                                                                                                                                                       
   // geometry.addAttribute( 'position', Float32Array, nodeData.length - 1, 3 );                                                                                                       
   // geometry.addAttribute( 'customColor', Float32Array, nodeData.length - 1, 3 );                                                                                                    
   // geometry.addAttribute( 'size', Float32Array, nodeData.length - 1, 1 );                                                                                                           
                                                                                                                                                                                       
   // node_size = geometry.node_attr.size.array;                                                                                                                                       
   // var positions = geometry.node_attr.position.array;                                                                                                                               
   // var node_color = geometry.node_attr.customColor.array;                                                                                                                           
                                                                                                                                                                                       
   var node_size = node_attr.size.value;                                                                                                                                               
   var node_color = node_attr.customColor.value;                                                                                                                                       
                                                                                                                                                                                       
                                                                                                                                                                                       
   for( var v = 0; v < nodeData.length; v++ ) {                                                                                                                                        
                                                                                                                                                                                       
       node_size[ v ] = 10;                                                                                                                                                            
                                                                                                                                                                                       
       var vertex = new THREE.Vector3();                                                                                                                                               
       vertex.x = nodeData[v][1];                                                                                                                                                      
       vertex.y = nodeData[v][2];                                                                                                                                                      
       vertex.z = nodeData[v][3];                                                                                                                                                      
       particlegeom.vertices.push( vertex );                                                                                                                                           
       facegeom.vertices.push( vertex );                                                                                                                                               
                                                                                                                                                                                       
       tmprgb = colscale(respfactorData[v][0] / 49.6086102009798);                                                                                                                                
                                                                                                                                                                                       
       // if( v<4353 && v>4333 ) {                                                                                                                                                     
       //  console.log(tmprgb);                                                                                                                                                        
       // }                                                                                                                                                                            
                                                                                                                                                                                       
       node_color[v] = new THREE.Color( 0xffaa00 );                                                                                                                                    
       node_color[v].setRGB( tmprgb[0]/255, tmprgb[1]/255, tmprgb[2]/255);                                                                                                             
                                                                                                                                                                                       
       //facegeom.colors.push( node_color[v] );                                                                                                                                        
   }                                                                                                                                                                                   
                                                                                                                                                                                       
   for (var f = 0; f < elemData.length; f++ ){                                                                                                                                         
                                                                                                                                                                                       
       var face = new THREE.Face3();                                                                                                                                                   
       face.a = parseInt(elemData[f][0]);                                                                                                                                              
       face.b = parseInt(elemData[f][1]);                                                                                                                                              
       face.c = parseInt(elemData[f][2]);                                                                                                                                              
       face.vertexColors[0] = node_color[elemData[f][0]];                                                                                                                              
       face.vertexColors[1] = node_color[elemData[f][1]];                                                                                                                              
       face.vertexColors[2] = node_color[elemData[f][2]];                                                                                                                              
                                                                                                                                                                                       
       // if( f<1003 && f>1000 ) {                                                                                                                                                     
       //  console.log(elemData[f][0]);                                                                                                                                                
       //  console.log(node_color[elemData[f][0]]);                                                                                                                                    
       //  console.log(face.vertexColors[0]);                                                                                                                                          
       // }                                                                                                                                                                            
       //console.log("THREE node #: " + elemData[f][0] + " x: " + nodeData[elemData[f][0]][1]);                                                                                    
       facegeom.faces.push( face );                                                                                                                                                    
                                                                                                                                                                                       
       //Check if it's a 4 sided face                                                                                                                                                  
       if (elemData[f][3] != "#N/A") {                                                                                                                                               
           var face1 = new THREE.Face3();                                                                                                                                              
           face1.a = parseInt(elemData[f][2]);                                                                                                                                         
           face1.b = parseInt(elemData[f][3]);                                                                                                                                         
           face1.c = parseInt(elemData[f][0]);                                                                                                                                         
           face1.vertexColors[0] = node_color[elemData[f][2]];                                                                                                                         
           face1.vertexColors[1] = node_color[elemData[f][3]];                                                                                                                         
           face1.vertexColors[2] = node_color[elemData[f][0]];                                                                                                                         
           facegeom.faces.push( face1 );                                                                                                                                               
       }                                                                                                                                                                               
                                                                                                                                                                                       
   }                                                                                                                                                                                   
                                                                                                                                                                                       
   // add particle system                                                                                                                                                              
   particlesys = new THREE.ParticleSystem( particlegeom, particleMaterial );                                                                                                           
   // sphere.sortParticles = true;                                                                                                                                                     
   particlesys.dynamic = true;                                                                                                                                                         
                                                                                                                                                                                       
   // add mesh faces                                                                                                                                                                   
   facegeom.mergeVertices();                                                                                                                                                           
   facegeom.computeCentroids();                                                                                                                                                           
   facegeom.computeFaceNormals();                                                                                                                                                           
   facegeom.computeVertexNormals();                                                                                                                                                           
   facesys = new THREE.Mesh( facegeom, faceMaterial);                                                                                                                                  
   facesys.dynamic = true;                                                                                                                                                         
                                                                                                                                                                                       
   scene.add( particlesys );                                                                                                                                                           
   scene.add( facesys );                                                                                                                                                               
                                                                                                                                                                                       
    // lights                                                                                                                                                                          
                                                                                                                                                                                       
    var ambient = new THREE.AmbientLight( 0x101010 );                                                                                                                                  
    scene.add( ambient );                                                                                                                                                              
                                                                                                                                                                                       
    var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );                                                                                                                  
    directionalLight.position.set( 1, 1, 2 ).normalize();                                                                                                                              
    scene.add( directionalLight );                                                                                                                                                     
                                                                                                                                                                                       
                                                                                                                                                                                       
    // center the camera                                                                                                                                                               
    camera.position.set(55,70,25);                                                                                                                                                     
    camera.up = new THREE.Vector3(0,0,1);                                                                                                                                              
    camera.lookAt( scene.position );                                                                                                                                                   
                                                                                                                                                                                       
                                                                                                                                                                                       
    // camera controls                                                                                                                                                                 
                                                                                                                                                                                       
    controls = new THREE.TrackballControls( camera, renderer.domElement );                                                                                                             
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
   container.appendChild( stats.domElement );                                                                                                                                          
                                                                                                                                                                                       
                                                                                                                                                                                       
                                                                                                                                                                                       
    // GUI for interacting with data                                                                                                                                                   
                                                                                                                                                                                       
    gui = new dat.GUI({ autoPlace: false });                                                                                                                                           
                                                                                                                                                                                       
    var dgContainer = document.getElementById('datguiContainer');                                                                                                                      
    dgContainer.appendChild( gui.domElement );                                                                                                                                         
                                                                                                                                                                                       
    parameters =                                                                                                                                                                       
        {                                                                                                                                                                              
        pacefrequency: 1.0,                                                                                                                                                             
        respfactortype: 'Max',                                                                                                                                                             
        previewtype: 'Mesh',                                                                                                                                                             
        meshtype: 'Solid'                                                                                                                                                             
    };                                                                                                                                                                                 
                                                                                                                                                                                       
                                                                                                                                                                                       
    var currentFreq = gui.add( parameters, 'pacefrequency' ).min(1).max(pacefreqcount).step(1).name('Pace Frequency').listen();                                                        
    currentFreq.onChange(function(value)                                                                                                                                               
                   {   updatePoints(value-1, respfactorData);    });                                                                                                                   
                                                                                                                                                                                       
    var RFType = gui.add( parameters, 'respfactortype', [ 'Resonant','Transient','Max' ] ).name('RF Type').listen();            RFType.onChange( function() {                                                                                                                   
     if ( parameters.respfactortype === 'Resonant' ) {                                                                                                                   
         respfactorData = resrfData;                                                                                                                   
     } else if ( parameters.respfactortype === 'Transient' ) {                                                                                                                   
         respfactorData = trnrfData;                                                                                                                  
     } else if ( parameters.respfactortype === 'Max' ) {                                                                                                                   
         respfactorData = maxrfData;                                                                                                                   
     }                                                                                                                                                
     updatePoints(parameters.pacefrequency-1, respfactorData);                                                                                                                   
    } );                                                                                                                                                   
                                                                                                                                                                                       
    var previewType = gui.add( parameters, 'previewtype', [ 'Mesh','Nodes','Both' ] ).name('Preview Type').listen();            previewType.onChange( function() {                                                                                                                   
     if ( parameters.previewtype === 'Mesh' ) {                                                                                                                   
         facesys.visible = true;                                                                                                                   
         particlesys.visible = false;                                                                                                                   
     } else if ( parameters.previewtype === 'Nodes' ) {                                                                                                                   
         facesys.visible = false;                                                                                                                   
         particlesys.visible = true;                                                                                                                   
     } else if ( parameters.previewtype === 'Both' ) {                                                                                                                   
         facesys.visible = true;                                                                                                                   
         particlesys.visible = true;                                                                                                                   
     }                                                                                                                                                
     renderer.render( scene, camera );                                                                                                                   
    } );                                                                                                                                                   
                                                                                                                                                                                       
    var meshType = gui.add( parameters, 'meshtype', [ 'Solid','Wireframe' ] ).name('Mesh Display').listen();            meshType.onChange( function() {                                                                                                                   
     if ( parameters.meshtype === 'Solid' ) {                                                                                                                   
         facesys.material.setValues( { wireframe: false } );                                                                                                                   
     } else if ( parameters.meshtype === 'Wireframe' ) {                                                                                                                   
         facesys.material.setValues( { wireframe: true } );                                                                                                                   
     }                                                                                                                                                
     renderer.render( scene, camera );                                                                                                                   
    } );                                                                                                                                                   
                                                                                                                                                                                       
    gui.open();                                                                                                                                                                        
                                                                                                                                                                                       
                                                                                                                                                                                       
   //                                                                                                                                                                                  
                                                                                                                                                                                       
   window.addEventListener( 'resize', onWindowResize, false );                                                                                                                         
                                                                                                                                                                                       
}                                                                                                                                                                                       
                                                                                                                                                                                       
function updatePoints(value){                                                                                                                                                           
   var tmprgb;                                                                                                                                                                         
   var tmprspf;                                                                                                                                                                        
   var tmptest;                                                                                                                                                                        
   var colors = [];                                                                                                                                                                    
   var facecount = 0;                                                                                                                                                                  
   for( var v = 0; v < node_attr.customColor.value.length; v++ ) { //node_attr.customColor.value.length                                                                                
       tmprspf = respfactorData[v+1][value];                                                                                                                                           
       tmprgb = colscale2( tmprspf / 49.6086102009798 );                                                                                                                                           
       colors[v] = new THREE.Color;                                                                                                                                                    
       colors[v].setRGB(tmprgb[0]/255, tmprgb[1]/255, tmprgb[2]/255);                                                                                                                  
       node_attr.customColor.value[ v ].setRGB( tmprgb[0]/255, tmprgb[1]/255, tmprgb[2]/255 );                                                                                         
       //facegeom.colors[v] = node_color[v] );                                                                                                                                         
   }                                                                                                                                                                                   
                                                                                                                                                                                       
   for (var f = 0; f < elemData.length; f++ ){                                                                                                                                         
                                                                                                                                                                                       
       facesys.geometry.colors[f+0] = colors[elemData[f][0]];                                                                                                                          
       facesys.geometry.colors[f+1] = colors[elemData[f][1]];                                                                                                                          
       facesys.geometry.colors[f+2] = colors[elemData[f][2]];                                                                                                                          
                                                                                                                                                                                       
       //Check if it's a 4 sided face                                                                                                                                                  
   renderer.render( scene, camera );                                                                                                                                                   
}                                                                                                                                                                                       
                                                                                                                                                                                       
function onWindowResize() {                                                                                                                                                             
                                                                                                                                                                                       
   camera.aspect = window.innerWidth / window.innerHeight;                                                                                                                             
   camera.updateProjectionMatrix();                                                                                                                                                    
                                                                                                                                                                                       
   renderer.setSize( window.innerWidth, window.innerHeight );                                                                                                                          
                                                                                                                                                                                       
}                                                                                                                                                                                       
                                                                                                                                                                                       
function animate() {                                                                                                                                                                    
   requestAnimationFrame( animate );                                                                                                                                                   
   render();                                                                                                                                                                           
   stats.update();                                                                                                                                                                     
}                                                                                                                                                                                       
                                                                                                                                                                                       
function render() {                                                                                                                                                                     
    controls.update();                                                                                                                                                                 
   renderer.render( scene, camera );                                                                                                                                                   
}                                                                                                                                                                                       
                                                                                                                                                                                       