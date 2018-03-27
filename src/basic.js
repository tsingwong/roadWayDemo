/*
 * @Author: tsingwong 
 * @Date: 2018-03-27 17:15:09 
 * @Last Modified by: tsingwong
 * @Last Modified time: 2018-03-27 20:16:26
 */
let canvas = document.querySelector('#canvas');
let stats;

/* global THREE, Stats*/
let renderer, camera, scene, light;

let axisHelper, gridHelper, controls;
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
    renderer.setClearColor(0xffffff, 1.0);
}
/**
 * 初始化相机
 * 
 */
function initCamera() {
    //设置相机（视野，显示口的宽高比，近裁剪面，远裁剪面）
    camera = new THREE.PerspectiveCamera(
        75,
        canvas.width / canvas.height,
        .1,
        1000
    );
    camera.position.set(0, 900, 0);
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
    light = new THREE.DirectionalLight(0xFF0000, 1.0, 0);
    light.position.set(100, 100, 200);
    scene.add(light);
}
/**
 * 初始化模型
 * 
 */
function initModel() {
    var geometry = new THREE.Geometry();

    geometry.vertices.push(new THREE.Vector3(-500, 0, 0));

    geometry.vertices.push(new THREE.Vector3(500, 0, 0));

    for (var i = 0; i <= 20; i++) {

        let line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: randomColor(), opacity: 1 }));

        line.position.z = (i * 50) - 500;

        scene.add(line);




        line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: randomColor(), opacity: 1 }));

        line.position.x = (i * 50) - 500;

        line.rotation.y = 90 * Math.PI / 180;

        scene.add(line);

    }
    // console.log(scene);
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

    // 随意旋转拖动
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    // 启用阻尼惯性，更加真实的感觉
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    // 旋转的速度
    controls.rotateSpeed = 0.35;

    stats = new Stats();
    stats.setMode(0);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '5px';
    stats.domElement.style.top = '5px';
    document.body.appendChild(stats.domElement);
}


/**
 * 支持拖动
 * 
 */
function animate () {
    stats.begin();
    //一秒钟调用60次，也就是以每秒60帧的频率来绘制场景。

    requestAnimationFrame(animate);



    //console.log(cube.rotation);

    //每次调用模型的沿xy轴旋转0.01

    // cube.rotation.x += 0.01;

    // cube.rotation.y += 0.01;  

    //使用渲染器把场景和相机都渲染出来

    renderer.render(scene, camera);
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


//生成随机颜色

function randomColor() {

    var arrHex = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'],

        strHex = '0x',

        index;

    for (var i = 0; i < 6; i++) {

        index = Math.round(Math.random() * 15);

        strHex += arrHex[index];

    }

    return eval(strHex);

}
