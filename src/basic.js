/*
 * @Author: tsingwong 
 * @Date: 2018-03-27 17:15:09 
 * @Last Modified by: tsingwong
 * @Last Modified time: 2018-03-29 12:53:30
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
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 0, 50);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    cameraOrtho = new THREE.OrthographicCamera(0, window.innerWidth, window.innerHeight, 0, -10, 10);
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
    sceneOrtho = new THREE.Scene();
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
    directionalLight.position.set(1, 1, 1);


    //开启阴影投射
    directionalLight.castShadow = true;
    scene.add(directionalLight);
}
/**
 * 初始化模型
 * 
 */
function initModel() {
    //场景添加一个球型
    let material = new THREE.MeshNormalMaterial();
    let geom = new THREE.SphereGeometry(15, 200, 200);
    let mesh = new THREE.Mesh(geom, material);
    scene.add(mesh);
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
        size: 50,
        spirte: 0,
        transparent: true,
        opacity: .6,
        color: 0xffffff,
        rotateSystem: false,
        redraw: function () {
            sceneOrtho.children.forEach(function (child) {
                if (child instanceof THREE.Sprite) sceneOrtho.remove(child);
            });
            createSprite(gui.size, gui.transparent, gui.opacity, gui.color, gui.sprite);
            // controls.autoRotate = gui.rotateSystem;
        }
    };
    let datGui = new dat.GUI();

    datGui.add(gui, 'size', 0, 120)
        .onChange(gui.redraw);
    datGui.add(gui, 'spirte', 0, 4)
        .step(1)
        .onChange(gui.redraw);
    datGui.add(gui, 'transparent')
        .onChange(gui.redraw);
    datGui.add(gui, 'opacity', 0, 1)
        .onChange(gui.redraw);

    datGui.addColor(gui, 'color')
        .onChange(gui.redraw);
    datGui.add(gui, 'rotateSystem')
        .onChange(gui.redraw);

    gui.redraw();
}

let step = 0;

function render() {

    camera.position.y = Math.sin(step += 0.01) * 20;

    sceneOrtho.children.forEach(function (e) {
        if (e instanceof THREE.Sprite) {
            // move the sprite along the bottom
            e.position.x = e.position.x + e.velocityX;
            if (e.position.x > window.innerWidth) {
                e.velocityX = -5;
                gui.sprite++;
                e.material.map.offset.set(1 / 5 * (gui.sprite % 4), 0);
            }
            if (e.position.x < 0) {
                e.velocityX = 5;
            }
        }
    });
    renderer.render(scene, camera);
    renderer.autoClear = false;
    renderer.render(sceneOrtho, cameraOrtho);

}

function animate() {
    // stats.begin();

    render();


    // controls.update();
    requestAnimationFrame(animate);

    // stats.end();

}

function draw() {
    initRender();
    initScene();
    initCamera();
    initLight();
    // initAssist();
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

function getTexture() {
    let texture = new THREE.TextureLoader()
        .load('../static/img/sprite-sheet.png');
    return texture;
}

function createSprite(size, transparent, opacity, color, spriteNumber) {
    let spriteMaterial = new THREE.SpriteMaterial({
        opacity: opacity,
        color: color,
        transparent: transparent,
        map: getTexture(),
        // 深度测试
        depthTest: false,
        // 使用何种混合模式
        blending: THREE.AdditiveBlending
    });

    // 图片上面有五张图片，我们只需要显示其中一张
    spriteMaterial.map.offset = new THREE.Vector2(0.2 * spriteNumber, 0);
    spriteMaterial.map.repeat = new THREE.Vector2(1 / 5, 1);

    var sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(size, size, size);
    sprite.position.set(1000, size / 2, 0);
    sprite.velocityX = 5;
    sceneOrtho.add(sprite);
}
