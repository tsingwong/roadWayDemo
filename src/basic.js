/*
 * @Author: tsingwong 
 * @Date: 2018-03-27 17:15:09 
 * @Last Modified by: tsingwong
 * @Last Modified time: 2018-03-28 10:01:18
 */
let canvas = document.querySelector('#canvas');
let stats;

/* global THREE, Stats, Detector, dat*/
let renderer, camera, scene, ambientLight, pointLight;

let axisHelper, gridHelper, controls;

let sphere, cube;

let datGui, gui, settings;

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
        canvas: canvas,
        // 开启抗锯齿
        antialias: true,
    });
    // 开启阴影
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

}
/**
 * 初始化相机
 * 
 */
function initCamera() {
    //设置相机（视野，显示口的宽高比，近裁剪面，远裁剪面）
    camera = new THREE.PerspectiveCamera(
        45,
        canvas.width / canvas.height,
        1,
        1000
    );
    camera.position.set(0, 40, 100);
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
    // scene.overrideMaterial = new THREE.MeshStandardMaterial({ color: 0x00ffff });
}
/**
 * 初始化光源
 * 
 */
function initLight() {
    // 环境光
    ambientLight = new THREE.AmbientLight('#111111');
    scene.add(ambientLight);
    // 点光源
    pointLight = new THREE.PointLight(0xfffff);
    pointLight.position.set(15, 60, 10);
    //告诉平行光需要开启阴影投射
    pointLight.castShadow = true;
    scene.add(pointLight);

    let debug = new THREE.CameraHelper(pointLight.shadow.camera);

    scene.add(debug);
}
/**
 * 初始化模型
 * 
 */
function initModel() {

    //立方体
    // let cubeGeometry = new THREE.CubeGeometry(10, 10, 8);
    // let cubeMaterial = new THREE.MeshLambertMaterial({ color: 0x00ffff });
    // cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    // cube.position.x = 25;
    // cube.position.y = 5;
    // cube.position.z = -5;


    // 创建一个立方体
    //    v6----- v5
    //   /|      /|
    //  v1------v0|
    //  | |     | |
    //  | |v7---|-|v4
    //  |/      |/
    //  v2------v3
    let cubeGeometry = new THREE.Geometry();

    // 创建顶点位置
    let vertices = [
        new THREE.Vector3(10, 10, 10), //v0
        new THREE.Vector3(-10, 10, 10), //v1
        new THREE.Vector3(-10, -10, 10), //v2
        new THREE.Vector3(10, -10, 10), //v3
        new THREE.Vector3(10, -10, -10), //v4
        new THREE.Vector3(10, 10, -10), //v5
        new THREE.Vector3(-10, 10, -10), //v6
        new THREE.Vector3(-10, -10, -10) //v7
    ];

    cubeGeometry.vertices = vertices;

    // 如果要绘制的面是朝向相机的，那这个面的顶点的书写方式是逆时针绘制的
    // 反之是顺时针
    let faces = [
        new THREE.Face3(0, 1, 2),
        new THREE.Face3(0, 2, 3),
        new THREE.Face3(0, 3, 4),
        new THREE.Face3(0, 4, 5),
        new THREE.Face3(0, 6, 1),
        new THREE.Face3(0, 5, 6),
        new THREE.Face3(7, 1, 6),
        new THREE.Face3(7, 2, 1),
        new THREE.Face3(7, 3, 2),
        new THREE.Face3(7, 4, 3),
        new THREE.Face3(7, 6, 5),
        new THREE.Face3(7, 5, 4),
    ];
    cubeGeometry.faces = faces;

    // 生成法向量
    cubeGeometry.computeFaceNormals();

    let cubeMaterial = new THREE.MeshLambertMaterial({ color: 0x00ffff });
    cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.x = 5;
    cube.position.y = 10;
    cube.position.z = -5;

    //告诉立方体需要投射阴影
    cube.castShadow = true;
    scene.add(cube);

    //底部平面
    let planeGeometry = new THREE.PlaneGeometry(100, 100);
    let planeMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });

    let plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -0.5 * Math.PI;
    plane.position.y = -0;

    //告诉底部平面需要接收阴影
    plane.receiveShadow = true;
    scene.add(plane);
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
    gui = {
        ambientLight: '#111111',
        changeAmbient: function () {
            // let flag = false;
            // scene.children.find((element, index, arr) => {
            //     if (element === ambientLight) {
            //         flag = true;
            //     }
            // });
            // flag ? scene.remove(ambientLight) : scene.add(ambientLight);
            ambientLight.visible = !ambientLight.visible;
        },
        pointLight: '#111111',
        changePoint: function () {
            pointLight.visible = !pointLight.visible;
        },
        lightY: 60, //灯光y轴的位置
        cubeX: 5, //立方体的x轴位置
        cubeY: 10, //立方体的x轴位置
        cubeZ: -5 //立方体的z轴的位置
    };

    let datGui = new dat.GUI();
    datGui.addColor(gui,'ambientLight').onChange(function (e) {
        ambientLight.color = new THREE.Color(e);

    });
    datGui.add(gui, 'changeAmbient');

    datGui.addColor(gui,'pointLight').onChange(function (e) {
        pointLight.color = new THREE.Color(e);

    });
    datGui.add(gui, 'changePoint');
    
    
    datGui.add(gui, 'lightY', 0, 100);
    datGui.add(gui, 'cubeX', -30, 30);
    datGui.add(gui, 'cubeY', -30, 30);
    datGui.add(gui, 'cubeZ', -30, 30);

}

function render() {
    renderer.render(scene, camera);
}


/**
 * 支持拖动
 * 
 */
function animate() {
    stats.begin();


    pointLight.position.y = gui.lightY;
    cube.position.set(gui.cubeX, gui.cubeY, gui.cubeZ);

    render();
    controls.update();
    requestAnimationFrame(animate);

    stats.end();

}

function draw() {
    initDatGui();
    initRender();
    initScene();
    initCamera();
    initLight();
    initAssist();
    initModel();
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
