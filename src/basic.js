/*
 * @Author: tsingwong 
 * @Date: 2018-03-27 17:15:09 
 * @Last Modified by: tsingwong
 * @Last Modified time: 2018-03-28 15:00:44
 */
let canvas = document.querySelector('#canvas');
let stats;

/* global THREE, Stats, Detector, dat*/
let renderer, camera, scene, ambientLight, pointLight, directionalLight, spotLight;

let axisHelper, gridHelper, controls;

let sphere, cube, plane, line;

let sphereMaterial, cubeMaterial;

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
        0.1,
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
    // scene.overrideMaterial = new THREE.MeshDepthMaterial();
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
    spotLight = new THREE.SpotLight('#ffffff');
    spotLight.position.set(-40, 60, -10);


    //开启阴影投射
    spotLight.castShadow = true;
    scene.add(spotLight);

    // let debug = new THREE.CameraHelper(directionalLight.shadow.camera);

    // scene.add(debug);
}
/**
 * 初始化模型
 * 
 */
function initModel() {
    generatePoints();
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
    controls.autoRotate = true;

    stats = new Stats();
    stats.setMode(0);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '5px';
    stats.domElement.style.top = '5px';
    document.body.appendChild(stats.domElement);
}

function initDatGui() {
    gui = {
        directionalLight: '#ffffff', //点光源
        directionalLightIntensity: 1, //灯光强度
        visible: true, //是否可见
        castShadow: true,
        exponent: 30,
        target: 'plane',
        debug: false,
        groundColor: '#00ff00',
        skyColor: '#0000ff',
        hemiLightIntensity: 0.3
    };

    let datGui = new dat.GUI();

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

    render();
    controls.update();
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
    initDatGui();
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


//生成模型调用的方法

function generatePoints() {
    // 随机生成一组顶点
    var points = [];
    for (var i = 0; i < 20; i++) {
        //xyz轴的坐标点的位置会随机生成在+-150以内
        var randomX = -150 + Math.round(Math.random() * 300);
        var randomY = -150 + Math.round(Math.random() * 300);
        var randomZ = -150 + Math.round(Math.random() * 300);
        //创建一个坐标点并添加到数组当中
        points.push(new THREE.Vector3(randomX, randomY, randomZ));
    }

    //声明一个存放所有点的网格对象
    let spGroup = new THREE.Object3D();
    //声明一个网格基础材质
    var material = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: false });
    //遍历数组生成小球点并添加到对象当中
    points.forEach(function (point) {
        var spGeom = new THREE.SphereGeometry(5);
        var spMesh = new THREE.Mesh(spGeom, material);
        spMesh.position.copy(point); //将当前小球的位置设置为当前点的坐标
        scene.add(spMesh);
    });
    // 将存放所有点的对象添加到场景当中
    scene.add(spGroup);
    // 使用这些点实例化一个THREE.ConvexGeometry几何体对象
    var hullGeometry = new THREE.ConvexGeometry(points);
    //生成模型
    let hullMesh = createMesh(hullGeometry);
    //添加到场景
    scene.add(hullMesh);
}

function createMesh(geom) {
    // 实例化一个绿色的半透明的材质
    var meshMaterial = new THREE.MeshBasicMaterial({color: 0x00ff00, transparent: true, opacity: 0.2});
    meshMaterial.side = THREE.DoubleSide; //将材质设置成正面反面都可见
    var wireFrameMat = new THREE.MeshBasicMaterial();
    wireFrameMat.wireframe = true; //把材质渲染成线框

    // 将两种材质都赋给几何体
    var mesh = THREE.SceneUtils.createMultiMaterialObject(geom, [meshMaterial, wireFrameMat]);
    return mesh;
}
