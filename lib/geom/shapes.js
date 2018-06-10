
/**
 * This single object is designed to be a "library" of primitive shapes that we can use.
 * Initially, this object has only one property (the init function).  After the init
 * function is called, it will have a property for each of the primitive shapes.  The
 * init function should be called only once.
 */
var Shapes = {
    /**
     * This function initializes all primitive shapes and makes them available.
     * 
     * @param{WebGL2RenderingContext} gl
     */
    init: function(gl,fileData,scale) {
        if( this.initialized ) return;

        // Cube
        this.cube = new TriangleMesh(gl, generateCubeData());
        this.cube.material = new Material(); //Create new material object for cube

        // Initialize other shapes here....
        //this.helicopter = new Helicopter(2*Math.PI,2*Math.PI/3,4*Math.PI/3,0,0,0,2*Math.PI,2*Math.PI/3,4*Math.PI/3);

        this.cone = new TriangleMesh(gl, generateConeData(0.5,2,25));
        this.cone.material = new Material();

        this.cylinder = new TriangleMesh(gl, generateCylinderData(0.5, 2.0, 40));
        this.cylinder.material = new Material(); //Create new material object for cylinder

        this.disk = new TriangleMesh(gl, generateDiskData(1,25,1));
        this.disk.material = new Material(); //Create new material object for disk

        this.sphere = new TriangleMesh(gl, generateSphereData(1, 100, 100,1));
        this.sphere.material = new Material();

        this.skybox = new TriangleMesh(gl, generateSphereData(1,100,100,3));
        this.skybox.material = new Material();

        //Set up Mercury Orbit Line
        this.orbit1 = new OrbitMesh(gl, generateTrackData(4, 5, fileData, scale));
        this.orbit1.material = new Material();
        this.orbit1.material.emissive = vec3.fromValues(1,1,1);

        //Set up Venus Orbit Line
        this.orbit2 = new OrbitMesh(gl, generateTrackData(6, 7, fileData, scale));

        //Set up Earth Orbit Line
        this.orbit3 = new OrbitMesh(gl, generateTrackData(8, 9, fileData, scale));

        //Set up Mars Orbit Line
        this.orbit4 = new OrbitMesh(gl, generateTrackData(10, 11, fileData, scale));

        //Set up Jupiter Orbit Line
        this.orbit5 = new OrbitMesh(gl, generateTrackData(12, 13, fileData, scale));

        //Set up Saturn Orbit Line
        this.orbit6 = new OrbitMesh(gl, generateTrackData(14, 15, fileData, scale));

        //Set up Uranus Orbit Line
        this.orbit7 = new OrbitMesh(gl, generateTrackData(16, 17, fileData, scale));

        //Set up Neptune Orbit Line
        this.orbit8 = new OrbitMesh(gl, generateTrackData(18, 19, fileData, scale));

        this.initialized = true;
    },
    initialized: false
};