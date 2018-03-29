/*
 * @Author: tsingwong 
 * @Date: 2018-03-27 17:15:09 
 * @Last Modified by: tsingwong
 * @Last Modified time: 2018-03-29 15:08:41
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

let knot;

let group;

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
    // renderer.setClearColor(new THREE.Color(0xffffff));
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
    camera.position.set(0, 100, 100);
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
    pointLight = new THREE.PointLight('#ffffff');
    pointLight.position.set(15, 50, 10);


    //开启阴影投射
    pointLight.castShadow = true;
    scene.add(pointLight);
}
/**
 * 初始化模型
 * 
 */
function initModel() {
    group = new THREE.Group();
    scene.add(group);

    let sphereGeometry = new THREE.SphereGeometry(5, 200, 200);
    let sphereMaterial = new THREE.MeshLambertMaterial({
        color: '#aaaaaa'
    });

    sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.x = -5;
    sphere.position.y = 5;

    sphere.castShadow = true;
    group.add(sphere);

    let cubeGeometry = new THREE.CubeGeometry(10, 10, 8);
    cubeMaterial = new THREE.MeshLambertMaterial({
        color: '#00ff00',
        transparent: true,
        opacity: .8
    });

    cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(15, 5, -5);

    cube.castShadow = true;
    group.add(cube);

    let planeGeometry = new THREE.PlaneGeometry(100, 100);
    let PlaneMaterial = new THREE.MeshStandardMaterial({
        color: '#aaaaaa'
    });
    plane = new THREE.Mesh(planeGeometry, PlaneMaterial);

    plane.rotation.x = -.5 * Math.PI;
    plane.position.y = 0;

    plane.receiveShadow = true;

    scene.add(plane);
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
    controls.autoRotate = true;

    stats = new Stats();
    stats.setMode(0);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '20px';
    stats.domElement.style.top = '20px';
    document.body.appendChild(stats.domElement);
}

// cubeMaterial = new THREE.MeshLambertMaterial({
//     color: '#00ff00',
//     transparent: true,
//     opacity: .8
// });

function initDatGui() {
    //声明一个保存需求修改的相关数据的对象
    gui = {
        numberOfObject: 100,
        combined: false,
        redraw() {
            let arr = [];
            // 类似 forEach
            scene.traverse((e) => {
                if (e instanceof THREE.Mesh) {
                    arr.push(e);
                }
            });
            arr.forEach((value) => {
                scene.remove(value);
            });

            if (gui.combined) {
                let geometry = new THREE.Geometry();
                for (let i = 0; i < gui.numberOfObject; i++) {
                    let cube = addCube();
                    cube.updateMatrix();
                    geometry.merge(cube.geometry, cube.matrix);
                }
                scene.add(new THREE.Mesh(geometry, cubeMaterial));
            } else {
                for (let i = 0; i < gui.numberOfObject; i++) {
                    scene.add(addCube());
                }
            }
        }
    };
    let datGui = new dat.GUI();

    datGui.add(gui, 'numberOfObject', 0, 10000);
    datGui.add(gui, 'combined');
    datGui.add(gui, 'redraw');

    gui.redraw();
}

let step = 0.02;

function render() {

    if (gui.rotate) {
        if (gui.grouping) {
            group.rotation.y += step;
        } else {
            sphere.rotation.y += step;
            cube.rotation.y += step;
        }
    }

    renderer.render(scene, camera);

}

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

function addCube() {
    let cubeSize = 1.0;
    let cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

    cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.castShadow = true;

    cube.position.set(
        -100 + Math.round(Math.random() * 200),
        -100 + Math.round(Math.random() * 200),
        -100 + Math.round(Math.random() * 200)
    );
    return cube;
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
