 
class MyScene extends Physijs.Scene {
  constructor (unRendered) {
    super();
    
    // Lo primero, crear el visualizador, pasándole el lienzo sobre el que realizar los renderizados.
    //this.renderer = this.createRenderer(myCanvas);
    
    // Se añade a la gui los controles para manipular los elementos de esta clase
    this.gui = this.createGUI ();


    
    // Construimos los distinos elementos que tendremos en la escena
    
    // Todo elemento que se desee sea tenido en cuenta en el renderizado de la escena debe pertenecer a esta. Bien como hijo de la escena (this en esta clase) o como hijo de un elemento que ya esté en la escena.
    // Tras crear cada elemento se añadirá a la escena con   this.add(variable)
    this.createLights ();
    
    // Tendremos una cámara con un control de movimiento con el ratón
    this.createCamera (unRendered);
    
    // Creamos el escenario
    this.createEscenario ();
    
    // Y unos ejes. Imprescindibles para orientarnos sobre dónde están las cosas
    
    this.nave = new MyShip();
    this.nave.position.y = 5;
    this.nave.position.z = 30;
    this.add (this.nave);
    

    this.laseresJugador = new Array();
    this.laseresEnemigos = new Array();

    this.enemigos = new Array();

    this.raycasterJugador = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0,0,-1), 0,2);
    this.raycasterEnemigo = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0,0,1), 0,2);

    var geoCollider = new THREE.BoxGeometry ( 6.5 , 5 , 8 );

    var boxGeom = new THREE.BoxGeometry (1,1,1);
    // Como material se crea uno a partir de un color
    var boxMat = new THREE.MeshNormalMaterial();
    
    // Ya podemos construir el Mesh
    this.box = new THREE.Mesh (boxGeom, boxMat);

    this.keys = { };

    this.objetos = [];

    this.enemigosCargados = false;

    setInterval(()=>this.disparar(false),5000);

    this.generarOleada(1);

    console.log(this.enemigos[0])

    //this.createCar()
/*
    var enemy = new Enemy(-20,-35);
    enemy.position.set(-20,5,-35);
    this.add(enemy);
    this.enemigos.push(enemy)

    var enemy = new Enemy(-12,-25);
    enemy.position.set(-12,5,-25);
    this.add(enemy);
    this.enemigos.push(enemy)
*/
  
  }
  

  createCamera (unRendered) {
    // Para crear una cámara le indicamos
    //   El ángulo del campo de visión en grados sexagesimales
    //   La razón de aspecto ancho/alto
    //   Los planos de recorte cercano y lejano
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    // También se indica dónde se coloca
    this.camera.position.set (0, 100, 0);
    // Y hacia dónde mira
    var look = new THREE.Vector3 (0,0,0);
    this.camera.lookAt(look);
    this.add (this.camera);
    
    // Para el control de cámara usamos una clase que ya tiene implementado los movimientos de órbita
    this.cameraControl = new THREE.TrackballControls (this.camera, unRendered.domElement);
    // Se configuran las velocidades de los movimientos
    this.cameraControl.rotateSpeed = 5;
    this.cameraControl.zoomSpeed = -2;
    this.cameraControl.panSpeed = 0.5;
    // Debe orbitar con respecto al punto de mira de la cámara
    this.cameraControl.target = look;
    
    
/*
    // Para crear una cámara le indicamos
    //   El ángulo del campo de visión en grados sexagesimales
    //   La razón de aspecto ancho/alto
    //   Los planos de recorte cercano y lejano
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    // También se indica dónde se coloca
    this.camera.position.set (0, 0, 40);
    // Y hacia dónde mira
    var look = new THREE.Vector3 (0,0,0);
    this.camera.lookAt(look);
    this.add (this.camera);
    
    // Para el control de cámara usamos una clase que ya tiene implementado los movimientos de órbita
    this.cameraControl = new THREE.TrackballControls (this.camera, unRendered.domElement);
    // Se configuran las velocidades de los movimientos
    this.cameraControl.rotateSpeed = 5;
    this.cameraControl.zoomSpeed = -2;
    this.cameraControl.panSpeed = 0.5;
    // Debe orbitar con respecto al punto de mira de la cámara
    this.cameraControl.target = look;
    */
    
  }
  
  createEscenario () {
    // El suelo es un Mesh, necesita una geometría y un material.
    

    var geometry = new THREE.BoxGeometry (200,-1,200);
    
    var texturaSpace = new THREE.TextureLoader().load('../imgs/space.jpg');
    var materialSpace = new THREE.MeshPhongMaterial ({map: texturaSpace});
    
    // Ya se puede construir el Mesh

    var espacio = new THREE.Mesh (geometry, materialSpace);

    
    // Todas las figuras se crean centradas en el origen.
    // El suelo lo bajamos la mitad de su altura para que el origen del mundo se quede en su lado superior
    espacio.y = -0.1;
    
    // Que no se nos olvide añadirlo a la escena, que en este caso es  this
    this.add (espacio);

    this.borde1 = new Border();
    this.borde1.position.x = -30;
    this.add (this.borde1);
    

    this.borde2 = new Border();
    this.borde2.position.x = 30;
    this.add (this.borde2);
    
  }
  
  createGUI () {
    // Se crea la interfaz gráfica de usuario
    var gui = new dat.GUI();
    
    // La escena le va a añadir sus propios controles. 
    // Se definen mediante una   new function()
    // En este caso la intensidad de la luz y si se muestran o no los ejes
    this.guiControls = new function() {
      // En el contexto de una función   this   alude a la función
      this.lightIntensity = 0.5;
      this.axisOnOff = true;
      this.animacion = false;
    }

    // Se crea una sección para los controles de esta clase
    var folder = gui.addFolder ('Luz, Ejes y Animación');
    
    // Se le añade un control para la intensidad de la luz
    folder.add (this.guiControls, 'lightIntensity', 0, 1, 0.1).name('Intensidad de la Luz : ');
    
    // Y otro para mostrar u ocultar los ejes
    folder.add (this.guiControls, 'axisOnOff').name ('Mostrar ejes : ');
    
    return gui;
  }
  
  createLights () {
    // Se crea una luz ambiental, evita que se vean complentamente negras las zonas donde no incide de manera directa una fuente de luz
    // La luz ambiental solo tiene un color y una intensidad
    // Se declara como   var   y va a ser una variable local a este método
    //    se hace así puesto que no va a ser accedida desde otros métodos
    var ambientLight = new THREE.AmbientLight(0xccddee, 0.35);
    // La añadimos a la escena
    this.add (ambientLight);
    
    // Se crea una luz focal que va a ser la luz principal de la escena
    // La luz focal, además tiene una posición, y un punto de mira
    // Si no se le da punto de mira, apuntará al (0,0,0) en coordenadas del mundo
    // En este caso se declara como   this.atributo   para que sea un atributo accesible desde otros métodos.
    this.spotLight = new THREE.SpotLight( 0xffffff, this.guiControls.lightIntensity );
    this.spotLight.position.set( 60, 60, 40 );
    this.add (this.spotLight);
  }

  getCamera () {
    // En principio se devuelve la única cámara que tenemos
    // Si hubiera varias cámaras, este método decidiría qué cámara devuelve cada vez que es consultado
    return this.camera;
  }
  
  setCameraAspect (ratio) {
    // Cada vez que el usuario modifica el tamaño de la ventana desde el gestor de ventanas de
    // su sistema operativo hay que actualizar el ratio de aspecto de la cámara
    this.camera.aspect = ratio;
    // Y si se cambia ese dato hay que actualizar la matriz de proyección de la cámara
    this.camera.updateProjectionMatrix();
  }
  
  onWindowResize () {
    // Este método es llamado cada vez que el usuario modifica el tamapo de la ventana de la aplicación
    // Hay que actualizar el ratio de aspecto de la cámara
    this.setCameraAspect (window.innerWidth / window.innerHeight);
    
    // Y también el tamaño del renderizador
    this.renderer.setSize (window.innerWidth, window.innerHeight);
  }

  onKeyDown (event){
    var tecla = event.which || event.keyCode;
    this.keys[tecla] = true;
  }

  onKeyUp (event){
    var tecla = event.which || event.keyCode;
    this.keys[tecla] = false;

  }

  onKeyPress (event){
    var tecla = event.which || event.keyCode;
    this.keys[tecla] = true;
    var pressed = false;

    if( pressed === true ) { //Already pressed don't allow another press
    
    return false;
    }
    pressed = true;
    setTimeout(function() { pressed = false }, 5000);
    if(this.keys[32] && pressed)
      this.disparar(true);
  }

  crearLaser(fuente){
    var geoCollider = new THREE.BoxGeometry ( 0.25 , 2 , 0.25);
    var collider_material;

    if(fuente)
    collider_material = Physijs.createMaterial(
      new THREE.MeshLambertMaterial({ color: 0x088A29, opacity: 1.0, transparent: false }),
      .9, // alta friccion
      .0 // alto rebote
    );
    else
      collider_material =  Physijs.createMaterial(
        new THREE.MeshLambertMaterial({ color: 0xff0000, opacity: 1.0, transparent: false }),
        .9, // alta friccion
        .0 // alto rebote
      );

    var laser = new Physijs.BoxMesh(geoCollider,collider_material,0);
    laser.rotation.x = Math.PI/2;
    laser.colisionable = true

    return laser;
  }

  disparar(fuente){
    var laser = this.crearLaser(fuente);
    
    if(fuente){
      laser.userData = 'jugador';
      laser.position.set(this.nave.position.x,this.nave.position.y,this.nave.position.z);
      this.laseresJugador.push(laser);
    }

    else{
      laser.userData = 'enemigo';
      var enemigo = this.enemigos[Math.floor(Math.random() * this.enemigos.length)];
      laser.position.set(0,5,0);
      
      this.laseresEnemigos.push(laser);
    }

    this.add(laser);
  }


  eliminarLaser(laser,fuente){
    if(fuente){
      var index = this.laseresJugador.indexOf(laser)
      this.laseresJugador.splice(index,1);
    }else{
      var index = this.laseresEnemigos.indexOf(laser)
      this.laseresEnemigos.splice(index,1);
    }
        
    this.remove(laser);
  }

  eliminarEnemigo(enemigo){
    var index = this.enemigos.indexOf(enemigo)
    this.enemigos.splice(index,1);
    this.remove(enemigo);
  }

  ejecutarMovimiento(){
    if(this.keys[37])
      this.nave.mover(true);
    
    if(this.keys[39])
      this.nave.mover(false);
    
    if(!this.keys[37] && !this.keys[39])
      this.nave.ponerRecta();
  }

  ejecutarMovimientoEnemigos(){
    for(let i=0;i<this.enemigos.length;i++){
      this.enemigos[i].movimiento();
    }
  }

  generarOleada(numeroOleada){
    switch(numeroOleada){
      case 1:
        for(let i=-20;i<=20;i+=8){
          for(let j = -35;j<=-15;j+=10){
            var enemy = new Enemy(i,j);
            enemy.position.set(i,5,j);
            this.add(enemy);
            this.enemigos.push(enemy)
          }
        }
        this.enemigosCargados = true;
        break;
      case 2:
        for(let i = -35;i<=-5;i+=10){
          for(let j=-20;j<=20;j+=8){
            var enemy = new Enemy(j,i);
            this.add(enemy);
            this.enemigos.push(enemy)
          }
        }
        this.enemigosCargados = true;
        break;
    }
    
  }

  dispararLasers(){
    if(this.laseresJugador.length > 0){
      for(let i=0;i<this.laseresJugador.length;i++){
        this.laseresJugador[i].__dirtyPosition = true;
        this.laseresJugador[i].position.z-=1.5;
        this.comprobarEnemigos(this.laseresJugador[i]);
        if(this.laseresJugador[i].position.z < -70 && this.laseresJugador[i] != undefined)
          this.eliminarLaser(this.laseresJugador[i],true);
      }

    }

    if(this.laseresEnemigos.length > 0){
      for(let i=0;i<this.laseresEnemigos.length;i++){
        this.laseresEnemigos[i].__dirtyPosition = true;
        this.laseresEnemigos[i].position.z+=1.5;
        this.comprobarVidas(this.laseresEnemigos[i]);
        if(this.laseresEnemigos[i].position.z > 40 && this.laseresEnemigos[i] != undefined)
          this.eliminarLaser(this.laseresEnemigos[i],false);
      }

    }

  }

  comprobarEnemigos(laser){
    if(laser != undefined){
      var caster = new THREE.Raycaster();
		  caster.set(laser.position, new THREE.Vector3(1, 0, 1));
		  caster.far = 2;
      var objetos = caster.intersectObjects(this.enemigos,true);
  
      if(objetos.length>0){
        var enemigo = objetos[0].object.parent.parent;
        this.eliminarLaser(laser,true);
        console.log(enemigo)
        
         
        if(enemigo.getVidasEnemigo() > 0)
          enemigo.eliminarVida();
        else
          this.eliminarEnemigo(enemigo);
        
      }
    }
  }

  comprobarVidas(laser){
    
    if(laser != undefined){
      var caster = new THREE.Raycaster();
		  caster.set(laser.position, new THREE.Vector3(1, 0, 1));
		  caster.far = 2;
      var objetos = caster.intersectObject(this.nave,true);
      //console.log(caster.ray);
      if(objetos > 0){
        console.log("ha chocado con jugador");
        this.eliminarLaser(laser,false);
      }
    }
  }




  update () {
    // Este método debe ser llamado cada vez que queramos visualizar la escena de nuevo.
    
    // Literalmente le decimos al navegador: "La próxima vez que haya que refrescar la pantalla, llama al método que te indico".
    // Si no existiera esta línea,  update()  se ejecutaría solo la primera vez.
    //requestAnimationFrame(() => this.update())

    // Se actualizan los elementos de la escena para cada frame
    // Se actualiza la intensidad de la luz con lo que haya indicado el usuario en la gui
    this.spotLight.intensity = this.guiControls.lightIntensity;
    
    // Se actualiza la posición de la cámara según su controlador
    this.cameraControl.update();
    
    // Se actualiza el resto del modelo
    
    
    this.nave.update();

    //if(this.laseresJugador.length >= 1)
      this.dispararLasers();

    this.ejecutarMovimiento();

    this.comprobarEnemigos();
    
    //this.ejecutarMovimientoEnemigos();
    
    // Se le pide al motor de física que actualice las figuras según sus leyes
    this.simulate();

    // Le decimos al renderizador "visualiza la escena que te indico usando la cámara que te estoy pasando"
    //this.renderer.render (this, this.getCamera());

  }
}