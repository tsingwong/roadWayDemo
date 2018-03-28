/*
 * @Author: tsingwong 
 * @Date: 2018-03-27 17:15:09 
 * @Last Modified by: tsingwong
 * @Last Modified time: 2018-03-28 17:15:41
 */
let canvas = document.querySelector('#canvas');
let stats;

/* global THREE, Stats, Detector, dat*/
let renderer, camera, scene, ambientLight, pointLight, directionalLight, spotLight;

let axisHelper, gridHelper, controls;

let sphere, cube, plane, line, shape;

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
    shape = new THREE.ShapeGeometry(drawShape());
    let mesh = createMesh(shape);
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
        // 该属性指定图形可以拉多高
        amount: 2,
        // 该属性指定斜角的深度
        bevelThickness: 2,
        // 该属性指定斜角的高度
        bevelSize: 0.5,
        // 如果这个属性设为true，就会有斜角
        bevelEnabled: true,
        // 该属性定义斜角的分段数
        bevelSegments: 3,
        // 该属性指定拉伸体沿深度方向分成多少段
        curveSegments: 12,
        // 该属性指定拉伸体沿深度方向分成多少段
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

    //将设置属性添加到gui当中，gui.add(对象，属性，最小值，最大值）

    datGui.add(gui, 'amount', 0, 100)
        .onChange(gui.asGeom);
    datGui.add(gui, 'bevelThickness', 0, 12)
        .onChange(gui.asGeom);
    datGui.add(gui, 'bevelSize', 0, 6)
        .onChange(gui.asGeom);
    datGui.add(gui, 'bevelSegments', 0, 6)
        .onChange(gui.asGeom);
    datGui.add(gui, 'bevelEnabled')
        .onChange(gui.asGeom);
    datGui.add(gui, 'curveSegments', 0, 10)
        .onChange(gui.asGeom);
    datGui.add(gui, 'steps', 0, 10)
        .onChange(gui.asGeom);

    // 将模型添加到场景当中
    scene.add(shape);
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

function generatePoints(segments, phiStart, phiLength) {
    // 随机生成一组顶点
    var points = [];
    var height = 5;
    var count = 40;

    for (var i = 0; i < count; i++) {
        points.push(
            new THREE.Vector3((Math.sin(i * 0.2) + Math.cos(i * 0.3)) * height + 12,
                (i - count) + count / 2,
                0));
    }


    //创建一个存储顶点球体的对象
    let spGroup = new THREE.Object3D();
    var material = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: false }); //声明顶点球体使用的纹理
    points.forEach(function (point) {
        var spGeom = new THREE.SphereGeometry(0.2); //实例化球形几何体
        var spMesh = new THREE.Mesh(spGeom, material); //生成网格
        spMesh.position.copy(point); //将当前顶点的坐标位置赋值给当前球体
        spGroup.add(spMesh); //添加到对象当中
    });
    // 将存储顶点球体的对象添加到场景当中
    scene.add(spGroup);

    // 实例化一个THREE.LatheGeometry，并设置相关的信息
    var latheGeometry = new THREE.LatheGeometry(points, segments, phiStart, phiLength);
    let latheMesh = createMesh(latheGeometry);
    //添加到场景
    // scene.add(latheMesh);
}

function createMesh(geom) {

    //设置当前的模型矩阵沿y轴负方向偏移20
    geom.applyMatrix(new THREE.Matrix4()
        .makeTranslation(0, -20, 0));

    var meshMaterial = new THREE.MeshNormalMaterial({
        flatShading: THREE.FlatShading,
        transparent: true,
        opacity: 0.7
    });
    meshMaterial.side = THREE.BothSide; //将材质设置成里面都可见
    var wireFrameMat = new THREE.MeshBasicMaterial();
    wireFrameMat.wireframe = true; //把材质渲染成线框

    // 将两种材质都赋给几何体
    var mesh = THREE.SceneUtils.createMultiMaterialObject(geom, [meshMaterial, wireFrameMat]);
    return mesh;
}

function drawShape() {
    // 逆时针绘制
    let shape = new THREE.Shape();
    // 设置开始点的位置
    shape.moveTo(20, 10);
    // 从起始点绘制直线到当前位置
    shape.lineTo(20, 40);
    //设置一条曲线到30 40
    shape.bezierCurveTo(15, 25, -5, 25, -30, 40);

    // 设置一条通过当前所有顶点的光滑曲线

    shape.splineThru(
        [new THREE.Vector2(-22, 30),
            new THREE.Vector2(-18, 20),
            new THREE.Vector2(-20, 10),
        ]);
    // 设置曲线回到顶点
    shape.quadraticCurveTo(0, -15, 20, 10);

    // 添加第一个眼
    var hole1 = new THREE.Path();
    hole1.absellipse(6, 20, 2, 2, 0, Math.PI * 2, true);
    shape.holes.push(hole1);

    // 添加第一个眼
    var hole2 = new THREE.Path();
    hole2.absellipse(-6, 20, 2, 2, 0, Math.PI * 2, true);
    shape.holes.push(hole2);

    // 添加嘴巴，一半的圆
    var hole3 = new THREE.Path();
    hole3.absarc(0, 5, 2, 0, Math.PI, true);
    shape.holes.push(hole3);
    return shape;
}
