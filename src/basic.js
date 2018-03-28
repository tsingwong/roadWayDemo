/*
 * @Author: tsingwong 
 * @Date: 2018-03-27 17:15:09 
 * @Last Modified by: tsingwong
 * @Last Modified time: 2018-03-28 19:59:34
 */
let canvas = document.querySelector('#canvas');
let stats;

/* global THREE, Stats, Detector, dat*/
let renderer, camera, scene, ambientLight, pointLight, directionalLight, spotLight;

let axisHelper, gridHelper, controls;

let sphere, cube, plane, line, shape;

let sphereMaterial, cubeMaterial;

let datGui, gui, settings;

let spGroup, tubeMesh;

// 兼容性检测
if (!Detector.webgl) {
    Detector.addGetWebGLMessage();
}


//创建平面模型的方法
plane = function (u, v) {
    var x = u * 50;
    var y = 0;
    var z = v * 50;
    return new THREE.Vector3(x, y, z);
};

//创建波浪图形的方法
var radialWave = function (u, v) {
    var r = 50;
    var x = Math.sin(u) * r;
    var z = Math.sin(v / 2) * 2 * r;
    var y = (Math.sin(u * 4 * Math.PI) + Math.cos(v * 2 * Math.PI)) * 2.8;
    return new THREE.Vector3(x, y, z);
};

var klein = function (u, v) {
    u *= Math.PI;
    v *= 2 * Math.PI;
    u = u * 2;
    var x, y, z;
    if (u < Math.PI) {
        x = 3 * Math.cos(u) * (1 + Math.sin(u)) + (2 * (1 - Math.cos(u) / 2)) * Math.cos(u) * Math.cos(v);
        z = -8 * Math.sin(u) - 2 * (1 - Math.cos(u) / 2) * Math.sin(u) * Math.cos(v);
    } else {
        x = 3 * Math.cos(u) * (1 + Math.sin(u)) + (2 * (1 - Math.cos(u) / 2)) * Math.cos(v + Math.PI);
        z = -8 * Math.sin(u);
    }


    y = -2 * (1 - Math.cos(u) / 2) * Math.sin(v);
    return new THREE.Vector3(x, y, z);
};

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
    camera.position.set(0, 0, 150);
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
    let mesh = createMesh(new THREE.ParametricGeometry(THREE.ParametricGeometries.klein, 25, 25));

    scene.add(mesh);

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
        amount: 2,
        bevelThickness: 2,
        bevelSize: 0.5,
        bevelEnabled: true,
        bevelSegments: 3,
        curveSegments: 12,
        steps: 1,
        asGeom: function () {
            // 删除旧的模型
            scene.remove(shape);
            // 创建一个新的
            var options = {
                amount: gui.amount,
                bevelThickness: gui.bevelThickness,
                bevelSize: gui.bevelSize,
                bevelSegments: gui.bevelSegments,
                bevelEnabled: gui.bevelEnabled,
                curveSegments: gui.curveSegments,
                steps: gui.steps
            };
            shape = createMesh(new THREE.ExtrudeGeometry(drawShape(), options));
            // 将模型添加到场景当中
            scene.add(shape);
        }
    };
    let datGui = new dat.GUI();
    datGui.add(gui, 'amount', 0, 200)
        .onChange(gui.asGeom);
    datGui.add(gui, 'bevelThickness', 0, 10)
        .onChange(gui.asGeom);
    datGui.add(gui, 'bevelSize', 0, 10)
        .onChange(gui.asGeom);
    datGui.add(gui, 'bevelSegments', 0, 30)
        .step(1)
        .onChange(gui.asGeom);
    datGui.add(gui, 'bevelEnabled')
        .onChange(gui.asGeom);
    datGui.add(gui, 'curveSegments', 1, 30)
        .step(1)
        .onChange(gui.asGeom);
    datGui.add(gui, 'steps', 1, 5)
        .step(1)
        .onChange(gui.asGeom);

    gui.asGeom();
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
    var meshMaterial = new THREE.MeshNormalMaterial({
        flatShading: THREE.FlatShading,
        transparent: true,
        opacity: 0.9
    });
    meshMaterial.side = THREE.BothSide; //将材质设置成里面都可见
    var wireFrameMat = new THREE.MeshBasicMaterial();
    wireFrameMat.wireframe = true; //把材质渲染成线框

    // 将两种材质都赋给几何体
    var mesh = THREE.SceneUtils.createMultiMaterialObject(geom, [meshMaterial, wireFrameMat]);
    return mesh;
}

function drawShape() {
    let svgString = document.querySelector('#batman-path')
        .getAttribute('d');
    let shape = transformSVGPathExposed(svgString);
    return shape;
}
