/*
 * @Author: tsingwong 
 * @Date: 2018-03-27 17:15:09 
 * @Last Modified by: tsingwong
 * @Last Modified time: 2018-03-27 21:47:58
 */
let canvas = document.querySelector('#canvas');
let stats;

/* global THREE, Stats, Detector*/
let renderer, camera, scene, light;

let axisHelper, gridHelper, controls;

// 兼容性检测
if ( ! Detector.webgl ) {
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
    renderer.setClearColor(0x000000, 1.0);
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
        2000
    );
    camera.position.y = 800;
    camera.lookAt(new THREE.Vector3(0, 0, 0));
}
/**
 * 初始化场景
 * 
 */
function initScene() {
    scene = new THREE.Scene();
}
/**
 * 初始化光源
 * 
 */
function initLight() {
    // 环境光
    scene.add(new THREE.AmbientLight(0x404040));
    // 平衡光
    light = new THREE.DirectionalLight(0xfffff, 1.0, 0);
    light.position.set(0, 1, 0);
    scene.add(light);
}
/**
 * 初始化模型
 * 
 */
function initModel() {

    let map = new THREE.TextureLoader()
        .load('../static/img/UV_Grid_Sm.jpg');
    // 定义纹理在水平和垂直方向简单的重复到无穷大。
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    //定义纹理的各向异性
    map.anisotropy = 16;

    // 兰伯特网孔材质
    let material = new THREE.MeshLambertMaterial({ map: map, side: THREE.DoubleSide });

    //球形网格 （半径长度，水平块的密度，垂直块的密度）
    let object = new THREE.Mesh(new THREE.SphereGeometry(75, 20, 10), material);
    object.position.set(-400, 0, 200);
    scene.add(object);

    //二十面体 （图形大小半径，大于零将不是二十面体，越大越圆滑）
    object = new THREE.Mesh(new THREE.IcosahedronGeometry(75, 0), material);
    object.position.set(-200, 0, 200);
    scene.add(object);

    //八面体（图形大小半径，大于零将不是八面体，越大越圆滑）
    object = new THREE.Mesh(new THREE.OctahedronGeometry(75, 0), material);
    object.position.set(0, 0, 200);
    scene.add(object);

    //四面体（图形大小半径，大于零将不是四面体，越大越圆滑）
    object = new THREE.Mesh(new THREE.TetrahedronGeometry(75, 0), material);
    object.position.set(200, 0, 200);
    scene.add(object);

    //长方形平面 （x轴宽度，y轴高度，x方向分段数，y方向分段数）
    object = new THREE.Mesh(new THREE.PlaneGeometry(100, 100, 1, 1), material);
    object.position.set(-400, 0, 0);
    scene.add(object);

    //立方体 （x轴宽度，y轴高度，z轴深度，沿宽面分段数，沿高度面分段数，沿深度面分段数）
    object = new THREE.Mesh(new THREE.BoxGeometry(100, 100, 100, 1, 1, 1), material);
    object.position.set(-200, 0, 0);
    scene.add(object);

    //圆形平面 （半径，顶点密度，绘制起点弧度，绘制弧度）
    object = new THREE.Mesh(new THREE.CircleGeometry(50, 20, 0, Math.PI * 2), material);
    object.position.set(0, 0, 0);
    scene.add(object);

    //空心圆平面 （内圆半径，外圆半径，分割面越大越圆滑，垂直外边分割面，开始绘制弧度，绘制弧度）
    object = new THREE.Mesh(new THREE.RingGeometry(25, 50, 10, 5, 0, Math.PI * 2), material);
    object.position.set(200, 0, 0);
    scene.add(object);

    //圆柱体 （头部圆的半径，底部圆半径，高度，上下圆顶点个数，上下面切割线条数，上下面是否显示，开始弧度，绘制弧度）
    object = new THREE.Mesh(new THREE.CylinderGeometry(25, 75, 100, 40, 5), material);
    object.position.set(400, 0, 0);
    scene.add(object);

    //车床模型
    var points = [];
    for (var i = 0; i < 50; i++) {
        points.push(new THREE.Vector2(
            Math.sin(i * 0.2) * Math.sin(i * 0.1) * 15 + 50, (i - 5) * 2));
    }

    //（一个vector2的数组分别代表xy轴，生成圆周段的数目，开始弧度，绘制弧度）
    object = new THREE.Mesh(new THREE.LatheGeometry(points, 20), material);
    object.position.set(-400, 0, -200);
    scene.add(object);

    //救生圈 （救生圈半径，管道直径，基于管道横切顶点数，救生圈横切顶点个数）
    object = new THREE.Mesh(new THREE.TorusGeometry(50, 20, 20, 20), material);
    object.position.set(-200, 0, -200);
    scene.add(object);

    //环面扭结模型 （图形半径，管道直径，基于管道横切定点数，根据图形半径横切顶点数，绕旋转对称轴的圈数，绕环面的圆的圈数）
    object = new THREE.Mesh(new THREE.TorusKnotGeometry(50, 10, 50, 20), material);
    object.position.set(0, 0, -200);
    scene.add(object);
}
/**
 * 初始化辅助系统
 * 
 */
function initAssist() {
    // 轴辅助
    axisHelper = new THREE.AxesHelper(550);
    scene.add(axisHelper);

    // // 辅助网格
    // gridHelper = new THREE.GridHelper(320, 32);
    // scene.add(gridHelper);

    let object = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 100, 0x00ffff);
    object.position.set(400, 0, -200);
    scene.add(object);


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

function render() {
    renderer.render(scene, camera);
}


/**
 * 支持拖动
 * 
 */
function animate() {
    stats.begin();
    requestAnimationFrame(animate);


    render();
    controls.update();
    
    stats.end();

}

function draw() {
    initRender();
    initScene();
    initCamera();
    initLight();
    initAssist();
    initModel();
    animate();
}
draw();


//窗口变动触发的函数
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    render();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

