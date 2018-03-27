/*
 * @Author: tsingwong 
 * @Date: 2018-03-27 17:15:09 
 * @Last Modified by: tsingwong
 * @Last Modified time: 2018-03-27 19:17:22
 */
let canvas = document.querySelector('#canvas');
let stats;

stats = new Stats();
stats.setMode(0);
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '5px';
stats.domElement.style.top = '5px';
document.body.appendChild(stats.domElement);

//创建场景

let scene = new THREE.Scene();

//设置相机（视野，显示口的宽高比，近裁剪面，远裁剪面）

let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);


// 设置相机位置
camera.position.set(25, 25, 0);

// 设置相机观察的方向
camera.lookAt(scene.position);

//渲染器

let renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    // 开启抗锯齿
    antialias: true,
});

//创建一个平行光光源照射到物体上

let light = new THREE.DirectionalLight(0xffffff, 1.5);

//设置平型光照射方向，照射方向为设置的点照射到原点

light.position.set(0, 0, 1);

//将灯光放到场景当中

scene.add(light);

//创建一个接受光照并带有纹理映射的立方体，并添加到场景中
//首先，获取到纹理
let map = new THREE.TextureLoader().load('../static/img/IE.jpg');

// 然后创建一个phong材质来处理着色，并传递给纹理映射
let material = new THREE.MeshPhongMaterial({
    map: map
});

//创建一个立方体的几何体


let geometry = new THREE.CubeGeometry(1, 2, 1);

// 将集合体和材质放到一个网格中
let cube = new THREE.Mesh(geometry, material);

scene.add(cube);


//将相机沿z轴偏移5

camera.position.z = 5;



// 轴辅助
var axisHelper = new THREE.AxesHelper(200);
scene.add(axisHelper);

// 辅助网格
var gridHelper = new THREE.GridHelper(320, 32);
scene.add(gridHelper);

// 随意旋转拖动
var controls = new THREE.OrbitControls(camera, renderer.domElement);
// 启用阻尼惯性，更加真实的感觉
controls.enableDamping = true;
controls.dampingFactor = 0.25;
// 旋转的速度
controls.rotateSpeed = 0.35;

//声明一个判断是否旋转的变量

var rotationBool = true;

canvas.onclick = function () {
    rotationBool = !rotationBool;
};


//设置一个动画函数

var animate = function () {
    stats.begin();
    //一秒钟调用60次，也就是以每秒60帧的频率来绘制场景。

    requestAnimationFrame(animate);



    //console.log(cube.rotation);

    //每次调用模型的沿xy轴旋转0.01

    if (rotationBool) {
        cube.rotation.x += 0.01;

        cube.rotation.y += 0.01;  
    }

    //使用渲染器把场景和相机都渲染出来

    renderer.render(scene, camera);
    stats.end();

};

animate();
