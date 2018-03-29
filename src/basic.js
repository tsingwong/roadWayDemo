/*
 * @Author: tsingwong 
 * @Date: 2018-03-27 17:15:09 
 * @Last Modified by: tsingwong
 * @Last Modified time: 2018-03-29 16:33:57
 */
let stats;

/* global THREE, Stats, Detector, dat, ThreeBSP*/
let renderer, camera, cameraOrtho, scene, sceneOrtho, ambientLight, pointLight, directionalLight, spotLight;

let axisHelper, gridHelper, controls;

let sphere, cube, plane, line, shape;

let sphereMaterial, cubeMaterial;

let datGui, gui, settings;

let spGroup, tubeMesh;

let text1, text2;

let cloud;

let knot, loadedMesh;

let raycaster = new THREE.Raycaster();


let mouse = new THREE.Vector2();

// 兼容性检测
if (!Detector.webgl) {
    Detector.addGetWebGLMessage();
}
/**
 * 初始化renderer
 * 
 */
function initRender() {
    renderer = new THREE.WebGLRenderer({
        // 开启抗锯齿
        antialias: true,
    });
    // 开启阴影
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(new THREE.Color(0xffffff));
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
}
/**
 * 初始化相机
 * 
 */
function initCamera() {
    //设置相机（视野，显示口的宽高比，近裁剪面，远裁剪面）
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 40, 50);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
}
/**
 * 初始化场景
 * 
 */
function initScene() {
    scene = new THREE.Scene();
    // 雾化
    // scene.fog = new THREE.Fog(0xffffff,100,120);
    // scene.fog = new THREE.FogExp2(0xffffff,0.02);
    //场景内所有模型都使用同一种材质 
    // scene.overrideMaterial = new THREE.MeshDepthMaterial();
}
/**
 * 初始化光源
 * 
 */
function initLight() {
    // 环境光
    scene.add(new THREE.AmbientLight(0x404040));
    // 点光源
    directionalLight = new THREE.DirectionalLight('#ffffff');
    directionalLight.position.set(0, 0, 100);


    //开启阴影投射
    directionalLight.castShadow = true;
    scene.add(directionalLight);
}
/**
 * 初始化模型
 * 
 */
function initModel() {
    let loader = new THREE.OBJLoader();
    loader.load('../static/js/lib/pinecone.obj', (loadedMesh) => {
        let material = new THREE.MeshLambertMaterial({
            color: '#5c3a21'
        });
        loadedMesh.children.forEach((child) => {
            child.material = material;
            child.geometry.computeFaceNormals();
            child.geometry.computeVertexNormals();
        });

        loadedMesh.scale.set(100, 100, 100);
        scene.add(loadedMesh);
    });
}

//随机生成颜色
function randomColor() {
    var arrHex = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'],
        strHex = '0x',
        index;
    for (var i = 0; i < 6; i++) {
        index = Math.round(Math.random() * 15);
        strHex += arrHex[index];
    }
    return strHex;
}
/**
 * 初始化辅助系统
 * 
 */
function initAssist() {
    // 轴辅助
    axisHelper = new THREE.AxesHelper(550);
    scene.add(axisHelper);

    // 辅助网格
    gridHelper = new THREE.GridHelper(320, 32);
    scene.add(gridHelper);

    // let object = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 100, 0x00ffff);
    // object.position.set(400, 0, -200);
    // scene.add(object);


    // 随意旋转拖动
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    // 启用阻尼惯性，更加真实的感觉
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    // 旋转的速度
    controls.rotateSpeed = 0.35;
    controls.autoRotate = false;

    stats = new Stats();
    stats.setMode(0);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '5px';
    stats.domElement.style.top = '5px';
    document.body.appendChild(stats.domElement);
}

function initDatGui() {
    //声明一个保存需求修改的相关数据的对象
    gui = {
        // 环形结半径
        radius: 13,
        // 环形节弯道
        tube: 1.7,
        // 环形结圆周上细分线段数
        radialSegments: 156,
        // 环形结弯管圆周细分线段数
        tubularSegments: 12,
        // 控制曲线路径缠绕圈数，P 决定垂直方向的参数
        p: 3,
        // 控制曲线路径缠绕圈数，Q 决定垂直方向的参数
        q: 4,
        // 环形结高方向上的缩进
        heightScale: 3.5,
        asParticles: false,
        rotate: false,
        redraw: function () {
            if (knot) scene.remove(knot);
            // controls.autoRotate = gui.rotateSystem;
            let geom = new THREE.TorusKnotGeometry(
                gui.radius,
                gui.tube,
                Math.round(gui.radialSegments),
                Math.round(gui.tubularSegments),
                Math.round(gui.p),
                Math.round(gui.q)
            );
            geom.scale(1, gui.heightScale, 1);

            // 判断绘制模型
            if (gui.asParticles) {
                knot = createPoints(geom);
            } else {
                knot = createMesh(geom);
            }

            scene.add(knot);
        },
        save() {
            let result = knot.toJSON();
            window.localStorage.setItem('knot', JSON.stringify(result));
        },
        load() {
            scene.remove(loadedMesh);

            let json = localStorage.getItem('knot');

            if (json) {
                let loadedGeometry = JSON.parse(json);
                let loader = new THREE.ObjectLoader();

                loadedMesh = loader.parse(loadedGeometry);
                loadedMesh.position.x = -50;
                scene.add(loadedMesh);
            }
        },
        exportScene() {
            let sceneJson = JSON.stringify(scene.toJSON());
            localStorage.setItem('scene', sceneJson);
        },
        clearScene() {
            scene = new THREE.Scene();
        },
        importScene() {
            let json = localStorage.getItem('scene');

            if (json) {
                let loadedGeometry = JSON.parse(json);
                let loader = new THREE.ObjectLoader();
                scene = loader.parse(loadedGeometry);
            }
        }
    };
    let datGui = new dat.GUI();

    datGui.add(gui, 'radius', 0, 40)
        .onChange(gui.redraw);
    datGui.add(gui, 'tube', 0, 40)
        .onChange(gui.redraw);
    datGui.add(gui, 'radialSegments', 0, 400)
        .step(1)
        .onChange(gui.redraw);
    datGui.add(gui, 'tubularSegments', 1, 20)
        .step(1)
        .onChange(gui.redraw);
    datGui.add(gui, 'p', 1, 10)
        .step(1)
        .onChange(gui.redraw);
    datGui.add(gui, 'q', 1, 15)
        .step(1)
        .onChange(gui.redraw);
    datGui.add(gui, 'heightScale', 0, 5)
        .step(1)
        .onChange(gui.redraw);
    datGui.add(gui, 'asParticles')
        .onChange(gui.redraw);
    datGui.add(gui, 'rotate')
        .onChange(gui.redraw);

    let loadFolder = datGui.addFolder('S/L');
    loadFolder.add(gui, 'save');
    loadFolder.add(gui, 'load');

    let adminFolder = datGui.addFolder('管理');
    adminFolder.add(gui, 'exportScene');
    adminFolder.add(gui, 'clearScene');
    adminFolder.add(gui, 'importScene');


    gui.redraw();
}

let step = 0;

function render() {

    // if (gui.rotate) {
    //     knot.rotation = step += .01;
    // }

    renderer.render(scene, camera);

}

function animate() {
    stats.begin();

    render();


    // controls.update();
    requestAnimationFrame(animate);

    stats.end();

}

function draw() {
    initRender();
    initScene();
    initCamera();
    initLight();
    initAssist();
    initModel();
    // initDatGui();
    animate();

    window.onresize = onWindowResize;
}
draw();


//窗口变动触发的函数
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    render();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function getTexture() {
    let texture = new THREE.TextureLoader()
        .load('../static/img/sprite-sheet.png');
    return texture;
}

function generateSprite() {
    let canvas = document.createElement('canvas');
    canvas.width = canvas.height = 16;

    let context = canvas.getContext('2d');
    let gradient = context.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 2
    );
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.2, 'rgba(0,255,255,1)');
    gradient.addColorStop(0.4, 'rgba(0,0,64,1)');
    gradient.addColorStop(1, 'rgba(0,0,0,1)');

    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    let texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
}

function createPoints(geom) {
    let material = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 3,
        transparent: true,
        blending: THREE.AdditiveBlending,
        map: generateSprite(),
        depthTest: false,
    });
    let cloud = new THREE.Points(geom, material);
    cloud.sortParticles = true;
    return cloud;
}

function createMesh(geom) {
    let meshMaterial = new THREE.MeshNormalMaterial({});
    meshMaterial.side = THREE.DoubleSide;

    let wireFrameMat = new THREE.MeshBasicMaterial();
    wireFrameMat.wireframe = true; //把材质渲染成线框

    // 将两种材质都赋给几何体
    let mesh = THREE.SceneUtils.createMultiMaterialObject(geom, [meshMaterial, wireFrameMat]);
    return mesh;
}

