/*
 * @Author: tsingwong 
 * @Date: 2018-03-27 17:15:09 
 * @Last Modified by: tsingwong
 * @Last Modified time: 2018-03-27 23:11:24
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
    camera.position.z = 800;
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
    let font;
    let loader = new THREE.FontLoader();
    loader.load('../static/js/lib/helvetiker_regular.typeface.json', (res) => {
        font = new THREE.TextBufferGeometry('TsingWong', {
            font: res,
            size: 100,
            height: 60
        });
        font.center();

        // let map = new THREE.TextureLoader().load('../static/img/UV_Grid_Sm.jpg');
        // let material = new THREE.MeshLambertMaterial({
        //     map: map,
        //     side: THREE.DoubleSide
        // });
        let material = new THREE.MeshBasicMaterial( {color: 0xffff00} )
        let fontModel = new THREE.Mesh(font,material);
        scene.add(fontModel);
    });
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

