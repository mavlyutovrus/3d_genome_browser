/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.PointerLockControls = function ( camera, _x, _y, _z ) {

	var scope = this;

	camera.rotation.set( 0, 0, 0 );

	var pitchObject = new THREE.Object3D();
	pitchObject.add( camera );

	var yawObject = new THREE.Object3D();
	if (_x && _y && _z) {
		yawObject.position.x = _x;
		yawObject.position.y = _y;
		yawObject.position.z = _z;
	} else {
		yawObject.position.y = 10;
	}
	yawObject.add( pitchObject );	

	var moveForward = false;
	var moveBackward = false;
	var moveLeft = false;
	var moveRight = false;
	var moveUp = false;
	var moveDown = false;


	var isOnObject = false;
	var canJump = false;

	var velocity = new THREE.Vector3();

	var PI_2 = Math.PI / 2;

	var onMouseMove = function ( event ) {

		if ( scope.enabled === false ) return;

		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		yawObject.rotation.y -= movementX * 0.002;
		
		pitchObject.rotation.x -= movementY * 0.002;
		pitchObject.rotation.x  = Math.max(Math.min(pitchObject.rotation.x, Math.PI / 2.0), -Math.PI / 2.0); 

	};


	var onKeyDown = function ( event ) {
		if (controls.isKeyEnabled){
			switch ( event.keyCode ) {

				case 38: // up
					moveUp = true;
					break;
				case 87: // w
					moveForward = true;
					break;

				case 37: // left
				case 65: // a
					moveLeft = true; 
					break;

				case 40: // down
					moveDown = true;
					break;
				case 83: // s
					moveBackward = true;
					break;

				case 39: // right
				case 68: // d
					moveRight = true;
					break;

				case 32: // space
					if ( canJump === true ) velocity.y += 10;
					canJump = false;
					break;
				// case 71: // g
				// 	alert('do here anything!');
				// 	break;
				  default:
				  	console.log(event.keyCode);
				  	break
			}
		}
	};

	var onKeyUp = function ( event ) {

		switch( event.keyCode ) {

			case 38: // up
				moveUp = false;
				break;
			case 87: // w
				moveForward = false;
				break;

			case 37: // left
			case 65: // a
				moveLeft = false;
				break;

			case 40: // down
				moveDown = false;
				break;
			case 83: // s
				moveBackward = false;
				break;

			case 39: // right
			case 68: // d
				moveRight = false;
				break;

		}
	};

	document.addEventListener( 'mousemove', onMouseMove, false );
	document.addEventListener( 'keydown', onKeyDown, false );
	document.addEventListener( 'keyup', onKeyUp, false );

	this.enabled = false;

	this.isKeyEnabled = true;

	this.changeIsKeyEnabled = function() {
		this.isKeyEnabled = (!this.isKeyEnabled);
	}

	this.getObject = function () {

		return yawObject;

	};

	this.isOnObject = function ( boolean ) {

		isOnObject = boolean;
		canJump = boolean;

	};

	this.getDirection = function() {

		// assumes the camera itself is not rotated

		var direction = new THREE.Vector3( 0, 0, -1 );
		var rotation = new THREE.Euler( 0, 0, 0, "YXZ" );

		return function( v ) {

			rotation.set( pitchObject.rotation.x, yawObject.rotation.y, 0 );

			v.copy( direction ).applyEuler( rotation );

			return v;

		}

	}();

	this.update = function ( delta ) {

		if ( scope.enabled === false ) return;

		delta *= 0.1;
		var speed_default  = 2;

		velocity.x += ( - velocity.x ) * 0.08 * delta;
		velocity.z += ( - velocity.z ) * 0.08 * delta;
		velocity.y += ( - velocity.y ) * 0.08 * delta;

		//velocity.y -= 0.02 * delta;
		


		var angle_y = pitchObject.rotation.x;
		var z_part = Math.cos(angle_y);
		var y_part = Math.sin(angle_y);
		
		if (moveForward || moveBackward) {
			var z_delta = -speed_default * delta * z_part;
			var y_delta = speed_default * delta * y_part;
			if (moveBackward) {
				z_delta = -z_delta;
				y_delta = -y_delta;
			}
			velocity.z += z_delta;
			velocity.y += y_delta;
		}
		
		//if ( moveForward ) velocity.z -= 0.62 * delta;
		//if ( moveBackward ) velocity.z += 0.62 * delta;

		if ( moveLeft ) velocity.x -= speed_default * delta;
		if ( moveRight ) velocity.x += speed_default * delta;

		//if ( moveUp ) velocity.y += 0.62 * delta;
		//if ( moveDown ) velocity.y -= 0.62 * delta;


		if ( isOnObject === true ) {

			velocity.y = Math.max( 0, velocity.y );

		}



		yawObject.translateX( velocity.x );
		yawObject.translateY( velocity.y ); 
		yawObject.translateZ( velocity.z );


	};

};
