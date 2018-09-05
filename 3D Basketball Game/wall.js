class Wall {
    constructor(x, y, z, w, l, h, material) {
        this.body = new CANNON.Body({
            mass: 0,
            position: new CANNON.Vec3(x, y, z),
            shape: new CANNON.Box(new CANNON.Vec3(w / 2, l / 2, h / 2)),
        });
        world.add(this.body);

        this.wallMesh = new THREE.Mesh(
            new THREE.BoxGeometry(w, l, h),
            material || new THREE.MeshBasicMaterial(
            {
                color: '#ff0097',
                wireframe: true,
                wireframeLinewidth: 10
            }
            )
        )
        ;
        this.wallMesh.position.x = x;
        this.wallMesh.position.y = y;
        this.wallMesh.position.z = z;

        this.wallMesh.recieveShadow = true;

        scene.add(this.wallMesh);
    }
}