/*
 * @Author: tsingwong 
 * @Date: 2018-03-27 17:15:09 
 * @Last Modified by: tsingwong
 * @Last Modified time: 2018-03-27 18:33:25
 */

//创建场景

var scene = new THREE.Scene();

//设置相机（视野，显示口的宽高比，近裁剪面，远裁剪面）

var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);


// 设置相机位置
camera.position.set(25, 25, 0);

// 设置相机观察的方向
camera.lookAt(scene.position);

//渲染器

var renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#canvas'),
    antialias: true,
});

//盒子模型（BoxGeometry），这是一个包含立方体所有顶点和填充面的对象。

var geometry = new THREE.BoxGeometry(1, 5, 1);

//使用网孔基础材料（MeshBasicMaterial）进行着色器，这里只绘制了一个绿色

var material = new THREE.MeshBasicMaterial({ color: 0x00ffff });

//使用网孔(Mesh)来承载几何模型

var cube = new THREE.Mesh(geometry, material);

//将模型添加到场景当中

scene.add(cube);

//将相机沿z轴偏移5

camera.position.z = 5;



// 轴辅助
var axisHelper = new THREE.AxesHelper(200)
scene.add(axisHelper)

// 辅助网格
var gridHelper = new THREE.GridHelper(320, 32)
scene.add(gridHelper)

// 随意旋转拖动
var controls = new THREE.OrbitControls(camera, renderer.domElement)
// 启用阻尼惯性，更加真实的感觉
controls.enableDamping = true;
controls.dampingFactor = 0.25;
// 旋转的速度
controls.rotateSpeed = 0.35;


//设置一个动画函数

var animate = function () {

    //一秒钟调用60次，也就是以每秒60帧的频率来绘制场景。

    requestAnimationFrame(animate);



    //console.log(cube.rotation);

    //每次调用模型的沿xy轴旋转0.01

    cube.rotation.x += 0.01;

    cube.rotation.y += 0.01;

    //使用渲染器把场景和相机都渲染出来

    renderer.render(scene, camera);

};

animate();


