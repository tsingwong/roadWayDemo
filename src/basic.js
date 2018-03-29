/*
 * @Author: tsingwong 
 * @Date: 2018-03-27 17:15:09 
 * @Last Modified by: tsingwong
 * @Last Modified time: 2018-03-29 08:39:39
 */
let canvas = document.querySelector('#canvas');
let stats;

/* global THREE, Stats, Detector, dat, ThreeBSP*/
let renderer, camera, scene, ambientLight, pointLight, directionalLight, spotLight;

let axisHelper, gridHelper, controls;

let sphere, cube, plane, line, shape;

let sphereMaterial, cubeMaterial;

let datGui, gui, settings;

let spGroup, tubeMesh;

let text1, text2;

let cloud;

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
        10000
    );
    camera.position.set(0, 200, 500);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
}
/**
 * 初始化场景
 * 
 */
function initScene() {
    scene = new THREE.Scene();
    renderer.setClearColor(new THREE.Color(0xffffff));
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
    directionalLight = new THREE.DirectionalLight('#ffffff');
    directionalLight.position.set(-40, 60, -10);


    //开启阴影投射
    directionalLight.castShadow = true;
    scene.add(directionalLight);
}
/**
 * 初始化模型
 * 
 */
function initModel() {
    let geometry = new THREE.Geometry();
    let material = new THREE.PointsMaterial({
        size: 4,
        vertexColors: true,
        color: 0xffffff
    });
    //循环将粒子的颜色和位置添加到网格当中
    for (var x = -5; x <= 5; x++) {
        for (var y = -5; y <= 5; y++) {
            var particle = new THREE.Vector3(x * 10, y * 10, 0);
            geometry.vertices.push(particle);
            geometry.colors.push(new THREE.Color(+randomColor()));
        }
    }
    //实例化THREE.PointCloud
    cloud = new THREE.Points(geometry, material);
    scene.add(cloud);
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
        size: 4,
        transparent: true,
        opacity: .6,
        vertexColors: true,
        color: 0xffffff,
        sizeAttenuation: true,
        rotateSystem: false,
        redraw: function () {
            if (cloud) {
                scene.remove(cloud);
            }
            createParticles(gui.size, gui.transparent, gui.opacity, gui.vertexColors, gui.sizeAttenuation, gui.color);
            controls.autoRotate = gui.rotateSystem;
        }
    };
    let datGui = new dat.GUI();
    datGui.add(gui, 'size', 0, 10)
        .onChange(gui.redraw);
    datGui.add(gui, 'transparent')
        .onChange(gui.redraw);
    datGui.add(gui, 'opacity', 0, 1)
        .onChange(gui.redraw);
    datGui.add(gui, 'vertexColors')
        .onChange(gui.redraw);
    datGui.addColor(gui, 'color')
        .onChange(gui.redraw);
    datGui.add(gui, 'sizeAttenuation')
        .onChange(gui.redraw);
    datGui.add(gui, 'rotateSystem')
        .onChange(gui.redraw);

    gui.redraw();
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

function generatePoints(points, segments, radius, radiusSegments, closed) {
    //创建一个存储顶点球体的对象
    spGroup = new THREE.Object3D();
    var material = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: false }); //声明顶点球体使用的纹理
    points.forEach(function (point) {
        var spGeom = new THREE.SphereGeometry(3); //实例化球形几何体
        var spMesh = new THREE.Mesh(spGeom, material);
        spMesh.position.copy(point); //将当前顶点的坐标位置赋值给当前球体
        spGroup.add(spMesh); //添加到对象当中
    });
    // 将存储顶点球体的对象添加到场景当中
    scene.add(spGroup);

    // THREE.CatmullRomCurve3方法可以将一组顶点生成一条平滑的曲线
    let tubeGeometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), segments, radius, radiusSegments,
        closed);
    //将模型对象赋值给tubeMesh并添加到场景当中
    tubeMesh = createMesh(tubeGeometry);
    scene.add(tubeMesh);
}

function createMesh(geom) {

    // geom.applyMatrix(new THREE.Matrix4()
    //     .makeTranslation(-250, -100, 0));

    var meshMaterial = new THREE.MeshNormalMaterial({
        flatShading: THREE.FlatShading,
        transparent: true,
        opacity: 0.9
    });
    meshMaterial.side = THREE.BothSide; //将材质设置成里面都可见
    var wireFrameMat = new THREE.MeshBasicMaterial();
    wireFrameMat.wireframe = true; //把材质渲染成线框

    // 将两种材质都赋给几何体
    // var mesh = THREE.SceneUtils.createMultiMaterialObject(geom, [meshMaterial, wireFrameMat]);
    var mesh = new THREE.Mesh(geom, wireFrameMat);
    return mesh;
}

function createParticles(size, transparent, opacity, vertexColors, sizeAttenuation, color) {
    let geom = new THREE.Geometry();
    //样式化粒子的THREE.PointCloudMaterial材质
    var material = new THREE.PointsMaterial({
        size: size,
        transparent: transparent,
        opacity: opacity,
        vertexColors: vertexColors,
        sizeAttenuation: sizeAttenuation,
        color: color,
        map: getTexture(),
        depthTest: false  //设置解决透明度有问题的情况
    });

    var range = 500;
    for (var i = 0; i < 15000; i++) {
        var particle = new THREE.Vector3(
            Math.random() * range - range / 2,
            Math.random() * range - range / 2,
            Math.random() * range - range / 2);
        geom.vertices.push(particle);
        let color = new THREE.Color(+randomColor());
        //.setHSL ( h, s, l ) h — 色调值在0.0和1.0之间 s — 饱和值在0.0和1.0之间 l — 亮度值在0.0和1.0之间。 使用HSL设置颜色。
        //随机当前每个粒子的亮度
        // color.setHSL(color.getHSL({ h: 0, s: 0, l: 0 })
        //     .h, color.getHSL({ h: 0, s: 0, l: 0 })
        //     .s, Math.random() * color.getHSL({ h: 0, s: 0, l: 0 })
        //     .l);
        geom.colors.push(color);
    }
    cloud = new THREE.Points(geom, material);
    scene.add(cloud);
}

function getTexture() {
    let canvas = document.createElement('canvas');
    canvas.width = canvas.height = 32;
    let ctx = canvas.getContext('2d');

    // 绘制身体
    ctx.translate(-81, -84);
    ctx.fillStyle = 'orange';
    ctx.beginPath();
    ctx.moveTo(83, 116);
    ctx.lineTo(83, 102);
    ctx.bezierCurveTo(83, 94, 89, 88, 97, 88);
    ctx.bezierCurveTo(105, 88, 111, 94, 111, 102);
    ctx.lineTo(111, 116);
    ctx.lineTo(106.333, 111.333);
    ctx.lineTo(101.666, 116);
    ctx.lineTo(97, 111.333);
    ctx.lineTo(92.333, 116);
    ctx.lineTo(87.666, 111.333);
    ctx.lineTo(83, 116);
    ctx.fill();

    // 绘制眼睛
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(91, 96);
    ctx.bezierCurveTo(88, 96, 87, 99, 87, 101);
    ctx.bezierCurveTo(87, 103, 88, 106, 91, 106);
    ctx.bezierCurveTo(94, 106, 95, 103, 95, 101);
    ctx.bezierCurveTo(95, 99, 94, 96, 91, 96);
    ctx.moveTo(103, 96);
    ctx.bezierCurveTo(100, 96, 99, 99, 99, 101);
    ctx.bezierCurveTo(99, 103, 100, 106, 103, 106);
    ctx.bezierCurveTo(106, 106, 107, 103, 107, 101);
    ctx.bezierCurveTo(107, 99, 106, 96, 103, 96);
    ctx.fill();
    // 绘制眼球
    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.arc(101, 102, 2, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(89, 102, 2, 0, Math.PI * 2, true);
    ctx.fill();
    let texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
}
