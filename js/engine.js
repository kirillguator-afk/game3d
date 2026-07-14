class GameEngine {
    constructor() {
        this.container = document.getElementById('game-container');
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x050805);
        this.scene.fog = new THREE.FogExp2(0x050805, 0.15);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.container.appendChild(this.renderer.domElement);

        this.pots = [];
        this.initLights();
        this.initEnvironment();
        this.initPots();
        
        this.camera.position.set(0, 8, 10);
        this.camera.lookAt(0, 0, 0);

        this.animate();
        window.addEventListener('resize', () => this.onResize());
        
        // Raycaster for interaction
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.container.addEventListener('touchstart', (e) => this.onClick(e.touches[0]), false);
        this.container.addEventListener('mousedown', (e) => this.onClick(e), false);
    }

    initLights() {
        const ambient = new THREE.AmbientLight(0x404040, 2);
        this.scene.add(ambient);

        const sun = new THREE.DirectionalLight(0xffffff, 3);
        sun.position.set(5, 10, 7);
        sun.castShadow = true;
        this.scene.add(sun);

        // Neon Glow
        const spot = new THREE.SpotLight(0x00ff88, 10);
        spot.position.set(0, 10, 0);
        spot.angle = Math.PI / 4;
        this.scene.add(spot);
    }

    initEnvironment() {
        // Floor
        const floorGeo = new THREE.PlaneGeometry(100, 100);
        const floorMat = new THREE.MeshStandardMaterial({ 
            color: 0x111111, 
            roughness: 0.8,
            metalness: 0.2
        });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Grid
        const grid = new THREE.GridHelper(20, 20, 0x00ff00, 0x112211);
        grid.position.y = 0.01;
        this.scene.add(grid);
    }

    initPots() {
        const potGeo = new THREE.CylinderGeometry(0.8, 0.6, 0.7, 16);
        const potMat = new THREE.MeshStandardMaterial({ color: 0x332211 });

        GameState.plots.forEach((plot, i) => {
            const pot = new THREE.Mesh(potGeo, potMat);
            const x = (i % 3) * 3 - 3;
            const z = Math.floor(i / 3) * 4 - 2;
            pot.position.set(x, 0.35, z);
            pot.castShadow = true;
            pot.receiveShadow = true;
            pot.userData = { plotId: i };
            
            // Container for the plant
            const plantGroup = new THREE.Group();
            pot.add(plantGroup);
            
            this.scene.add(pot);
            this.pots.push({ mesh: pot, plantGroup });
        });
    }

    createPlantMesh(color) {
        const group = new THREE.Group();
        // Stalk
        const stalk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.1, 2, 8),
            new THREE.MeshStandardMaterial({ color: 0x22aa22 })
        );
        stalk.position.y = 1;
        group.add(stalk);

        // Leaves (simplified)
        for(let i=0; i<5; i++) {
            const leaf = new THREE.Mesh(
                new THREE.SphereGeometry(0.4, 8, 8),
                new THREE.MeshStandardMaterial({ color: color })
            );
            leaf.scale.set(1, 0.2, 0.5);
            leaf.position.y = 0.5 + (i * 0.4);
            leaf.rotation.y = i * Math.PI/2;
            group.add(leaf);
        }
        group.scale.set(0.1, 0.1, 0.1);
        return group;
    }

    onClick(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.pots.map(p => p.mesh));

        if (intersects.length > 0) {
            const plotId = intersects[0].object.userData.plotId;
            handlePlotClick(plotId);
        }
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Update Plant Growth visual
        GameState.plots.forEach((plot, i) => {
            if (plot.status === 'growing') {
                const now = Date.now();
                const elapsed = now - plot.startTime;
                const seedData = GameState.shop.find(s => s.id === plot.plantId);
                const progress = Math.min(elapsed / seedData.growTime, 1);
                
                const plantGroup = this.pots[i].plantGroup;
                if (plantGroup.children.length > 0) {
                    const scale = 0.1 + (progress * 0.9);
                    plantGroup.children[0].scale.set(scale, scale, scale);
                    
                    if (progress >= 1) {
                        plot.status = 'mature';
                        // Add glow to mature plant
                        plantGroup.children[0].traverse(child => {
                            if(child.material) child.material.emissive = new THREE.Color(0x00ff00).multiplyScalar(0.2);
                        });
                    }
                }
            }
        });

        this.renderer.render(this.scene, this.camera);
    }
}

const engine = new GameEngine();