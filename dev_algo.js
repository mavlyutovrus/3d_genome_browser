function chipseqDataPostionDeterminition(vertices, data, _vert1) {
	var vertices = //vertices of the intersection.object.geometry.vertices
	var data = //data after 
	var _vert1 = //uploaded_splines[intersection.object.name]

	var vertices_start_position = 0; //out
	var last_seen_interval_end = 1; //out
	var left_distance_begin, left_distance_end; //in but without any values
	var start_node, end_node;
	var NODE_THRESHOLD = 625;
	var first_vert = -1;
	var _v_set;
	var second_vert = -1;

	var vert_length = _vert1.length;
	for (var ss = 0; ss <data.length; ss++) {
		first_vert = -1;
		second_vert = -1;
		var distance_between_nodes = -1;
		start_node = -1;
		end_node = -1;
		if (data[ss][2] >= _vert1[vert_length-1][1]) {
			second_vert = vertices.length-1;
		}
		//iterator for beginnings
		for (var kk = last_seen_interval_end; kk <vert_length; kk++) {
			if (data[ss][1]<_vert1[kk][1]) {// -------start--------v--
				last_seen_interval_end = kk;
				distance_between_nodes = Math.sqrt(Math.pow(_vert1[kk-1][2] - _vert1[kk][2], 2) + 
	                                    Math.pow(_vert1[kk-1][3] - _vert1[kk][3], 2) +
	                                    Math.pow(_vert1[kk-1][4] - _vert1[kk][4], 2));

				left_distance_begin = (data[ss][1] - _vert1[kk-1])/(_vert1[kk] - _vert1[kk-1])*Math.floor(distance_between_nodes); //-----v=======begin------
				start_node = kk-1;
				break;
			}
		}
		if (start_node == -1) {
			console.log("Start_node has not been defined " + ss);
			continue;
		}

		if (second_vert == -1) {
			//iterator for ends
			for (var kk = last_seen_interval_end; kk <vert_length; kk++) {
				if (data[ss][2]<_vert1[kk][1]) { // -------end--------v--
					if (kk != last_seen_interval_end) {
						distance_between_nodes = Math.sqrt(Math.pow(_vert1[kk-1][2] - _vert1[kk][2], 2) + 
			                                    Math.pow(_vert1[kk-1][3] - _vert1[kk][3], 2) +
			                                    Math.pow(_vert1[kk-1][4] - _vert1[kk][4], 2));	
					}
					end_node = kk-1;
					left_distance_end = (data[ss][2] - _vert1[kk-1])/(_vert1[kk] - _vert1[kk-1])*Math.floor(distance_between_nodes); //-----v=======begin------
					break;
				}
			}	
			if (end_node == -1) {
				console.log("End_node has not been defined " + ss);
				continue;
			}
		} 
		
		if (end_node == -1 || start_node == -1) {
			console.log("Nodes have not been defined " + ss);
			continue;
		}
		//I can iterate over vertices of object right here with saved state.
		//iteration to find the closest vertex near node
		// var is_first_node_found = false;
		var minDistance = -1;
		var distance = -1;
		var first_node_vert = -1;
		var first_vert = -1;
		var start_node_vector = Global2local(x:_vert1[start_node][2], y:_vert1[start_node][3],z:_vert1[start_node][4]);
		//find the closest node point
		for (var kk = vertices_start_position; kk < vertices.length; k++) {
			distance = Math.pow(vertices[kk].x - start_node_vector.x, 2) + 
				Math.pow(vertices[kk].y - start_node_vector.y, 2) +
		        Math.pow(vertices[kk].z - start_node_vector.z, 2);
			if (distance < NODE_THRESHOLD) {
				if (minDistance == -1 || (distance < minDistance)) {
					minDistance = distance;
					first_node_vert = kk;
				} else if (minDistance != -1 && distance>2*minDistance) {
					// is_first_node_found = true;
					break;
				}
			} else if (minDistance != -1){
				// is_first_node_found = true;
				break;
			}
		}

		if (first_node_vert == -1) {
			console.log("first_node_vert has not been defined " + ss);
			continue;
		}

		var sq_left_distance_begin = Math.pow(left_distance_begin,2);
		for (var kk = first_node_vert; kk < vertices.length; k++) {
			distance = Math.pow(vertices[kk].x - vertices[first_node_vert].x, 2) + 
				Math.pow(vertices[kk].y - vertices[first_node_vert].y, 2) +
		        Math.pow(vertices[kk].z - vertices[first_node_vert].z, 2);

		        if (distance > sq_left_distance_begin) {
		        	first_vert = kk-1;
		        	break;
		        }
		}

		if (first_vert == -1) {
			console.log("first_vert has not been defined " + ss);
			continue;
		}

		if (second_vert == -1) {
			minDistance = -1;
			var second_node_vert= -1;
			var end_node_vector = Global2local(x:_vert1[end_node][2], y:_vert1[end_node][3], z:_vert1[end_node][4]);
			for (var kk = first_vert; kk < vertices.length; k++) {
				distance = Math.pow(vertices[kk].x - end_node_vector.x, 2) + 
					Math.pow(vertices[kk].y - end_node_vector.y, 2) +
			        Math.pow(vertices[kk].z - end_node_vector.z, 2);
				if (distance < NODE_THRESHOLD) {
					if (minDistance == -1 || (distance < minDistance)) {
						minDistance = distance;
						second_node_vert = kk;
					} else if (minDistance != -1 && distance>2*minDistance) {
						// is_first_node_found = true;
						break;
					}
				} else if (minDistance != -1){
					// is_first_node_found = true;
					break;
				}
			}	
			if (second_node_vert == -1) {
				console.log("second_node_vert has not been defined " + ss);
				continue;
			}
		
			var sq_left_distance_end = Math.pow(left_distance_end,2);
			for (var kk = second_node_vert; kk < vertices.length; k++) {
				distance = Math.pow(vertices[kk].x - vertices[second_node_vert].x, 2) + 
					Math.pow(vertices[kk].y - vertices[second_node_vert].y, 2) +
			        Math.pow(vertices[kk].z - vertices[second_node_vert].z, 2);

			        if (distance > sq_left_distance_end) {
			        	second_vert = kk-1;
			        	break;
			        }
			}
			if (second_vert == -1) {
				console.log("second_vert has not been defined " + ss);
				continue;
			}
		}

		{
			var tube_color = getColorForPercentage(data[ss][4]);
            var material = new THREE.MeshLambertMaterial( { color: tube_color, shading: THREE.SmoothShading } );
            var chipVertices = vertices.slice(first_vert, second_vert)
            // chipVertices = [];
            // for (var pointIndex = aStart; pointIndex <= aEnd; ++pointIndex) {
            //     chipVertices.push(vertices[pointIndex])
            // }
            var spline = new THREE.SplineCurve3(chipVertices);
            var segments = chipVertices.length * 2;
            var radiusSegments = 5;
            var tube = new THREE.TubeGeometry( spline, segments, 10, radiusSegments, false, false);
            tube.dynamic = true;
            var tubeMesh = new THREE.Mesh(tube, material);  
            // tubeMesh.userData = [blockIndicesStr, blockIndices];//?
            tubeMesh.name = data[ss][0] + "-" + String(data[ss][1]) + "-"  + String(data[ss][2]);
            uploaded_splines_chip[tubeMesh.name] = [data[ss][0], data[ss][1], data[ss][2], data[ss][3], data[ss][4]];                                
            scene.add(tubeMesh);
            chipObjects.push(tubeMesh);

		}
	}
}