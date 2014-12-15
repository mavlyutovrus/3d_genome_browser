/*Uncomment this if you are using not 3dbg.cs.mcgill.ca/scripting.html tool BEGIN*/
// var vars = {};
/*END*/

/*CUSTOMIZABLE*/
function print(value) {
    // console.log(value);
    display.innerHTML+= value + "\n";
}

vars.consts = {}; 			// "folder" for constants
vars.final_results = [];


vars.consts.gene_name = 'RB1';	//name of gene
vars.consts.RELEASE_NUM = '37'; 	//release of database in Ensembl
vars.consts.PROMOTER_LENGTH = 1000;	//distance of promoter beginning according to the beginning of the gene
vars.consts.SEQ_REGION_ID = 27513; //seq_region_id for chromosome 13 in 37 release of homo_sapiens_variation Ensembl DB

vars.consts.radiusCube = 0.2; 		//default value
vars.consts.isPositive = false;		//default value

//numbers for asynchronous requests/responses to/from 3D Genome Browser server
vars.req_num = 1;
vars.res_num = 0;
vars.waitInterval = 0;
vars.consts.MAX_WAIT_INTERVAL = 10000;	//10s is the maximum waiting time for asynchronous request to server

/*
*	function waitFunction(callBack)
*	Literally, splits main thread on two different "threads", one of which continues main procedure, and another waits 50 ms for particular condition (vars.res_num < vars.req_num).
*	@Note: It is useful while working with asynchronous system (3D Genome Browser).
*/
vars.waitFunction = function(callBackCustomFunction) {
    if (vars.res_num < vars.req_num && vars.waitInterval < vars.consts.MAX_WAIT_INTERVAL) {
        vars.waitInterval = vars.waitInterval + 50;
        setTimeout(function(){vars.waitFunction(callBackCustomFunction)}, 50);
    } else {
    	vars.waitInterval = 0;
    	vars.req_num = 1;
    	vars.res_num = 0;
    	if (callBackCustomFunction) callBackCustomFunction();
    }
}

/*
*	function Print_Input_For_Ensembl(gene_name, release_num, results)
*	@Description
*	Creates input string(s) to ensembl database (mysql  -u anonymous  -P 3306 -h 193.62.203.187). Uses homo_sapiens_variation databases. 
*	There are 2 types of query for every interval of chromosome:
*		1) mapping of variations and phenotypes that are associated with these variations
*		2) comparison every interval's entities with first interval (results[0]) in terms of intersection of phenotype
*	Query automatically will save output of ensembl response in specific files
*
*	@Requirements:
*		-> results should be an array of arrays with begin and end positions(bases) of the interesting. results[0] has to contain start and stop positions of promoter of any specific gene or any interesting area. It will be compared with all the others intervals (results[i], where i>0)
*	
*	By default: release_num = 37;
*				seq_region_id = 27509; -- chromosome 17 under 37 release
*
*/
vars.Print_Input_For_Ensembl_Specific = function(gene_name, results, release_num, seq_region_id) {
	 //specify parameters
	var dbUse;
	if (!seq_region_id) seq_region_id = 27509;
	if (!release_num) release_num = 37;
	if ((release_num==37)) {
		dbUse = 'homo_sapiens_variation_75_37';
		// seq_region_id = 27509; //chr17
		// seq_region_id = 27513; //chr13
	} else {
		dbUse = 'homo_sapiens_variation_76_38';
		// seq_region_id = 131554; //chr17
		// seq_region_id = 131541; //chr13
	}
	print("Ensembl queries: use terminal to execute it\n")
	for (var res in results) {
		print('\n'+release_num + ' Release.'/*+' Attention: check the id of chromosome. 17 chromosome is default value.'*/)
		if (res == 0) {
			print('mysql  -u anonymous  -P 3306 -h 193.62.203.187 --execute "use '+dbUse+';select pf.object_id, pf.seq_region_start, p.description from phenotype_feature pf, phenotype p where type = \'Variation\' and seq_region_end < '+results[res][2]+' and seq_region_start > '+results[res][1]+' and pf.seq_region_id = '+seq_region_id+' and p.phenotype_id = pf.phenotype_id" > '+gene_name+'_'+results[res][1]+'_'+results[res][2]+'_promoter_'+release_num+'release.txt\n');
		} else {
			print('mysql  -u anonymous  -P 3306 -h 193.62.203.187 --execute "use '+dbUse+';select pf.object_id, pf.seq_region_start, p.description from phenotype_feature pf, phenotype p where type = \'Variation\' and seq_region_end < '+results[res][2]+' and seq_region_start > '+results[res][1]+' and pf.seq_region_id = '+seq_region_id+' and p.phenotype_id = pf.phenotype_id" > '+gene_name+'_'+results[res][1]+'_'+results[res][2]+'_'+release_num+'release.txt\n');

			print('\nCOMPARE RESULTS!!!\n');
			print('mysql  -u anonymous  -P 3306 -h 193.62.203.187 --execute "use '+dbUse+';select t2.ct as \'count '+results[0][1]+'-'+results[0][2]+'_promoter\', t2.phenotype_id, t1.ct as \'count '+results[res][1]+'-'+results[res][2]+'\', p.description from (select phenotype_id, count(phenotype_id) ct from phenotype_feature where seq_region_start > '+results[res][1]+' and seq_region_end < '+results[res][2]+' and type = \'Variation\' and seq_region_id = '+seq_region_id+' group by phenotype_id) t1, (select phenotype_id, count(phenotype_id) ct from phenotype_feature where seq_region_start >'+results[0][1]+' and seq_region_end < '+results[0][2]+' and type = \'Variation\' and seq_region_id = '+seq_region_id+' group by phenotype_id) t2, phenotype p where t1.phenotype_id = t2.phenotype_id and t2.phenotype_id = p.phenotype_id" > '+gene_name+'_compare_promoter_'+results[0][1]+'_'+results[0][2]+'___'+results[res][1]+'_'+results[res][2]+'_'+release_num+'release.txt');
			;
		}
	}
}

/*
*	function getApproximatedRangesStrandsForRadiusFunction(meshes, currentPoint, radiusCube, leftPoint, rightPoint, chr)
*	
*	@Parameters:
*		meshes - data from 3D query response.
*		currentPoint - array of coordinates [X, Y, Z] of the point, for which system tries to determine the cubic area, and existing intervals
*		radiusCube - radius of cube (1/2 of the edge), for which system tries to find intevals.
*		leftPoint - array that contains start position ([0]) of interval and its coordinates ([1],[2],[3])
*		rightPoint - array that contains end position ([0]) of interval and its coordinates ([1],[2],[3])
*		chr - current chromosome
*	@Return:
*		Array of arrays with start and stop positions of the intervals, which are in the cubic area for particular chromosome
*
*/
vars.getApproximatedRangesStrandsForRadiusFunction = function(meshes, currentPoint, radiusCube, leftPoint, rightPoint, chr) { 
		var resultRanges = [];
		var results = [];

		var getrangeForOnePoint = function(lPoint, rPoint, curPoint) { //Important: 4unit standard!
			var recursive = function(left, right, isRight, counter) { //is right in area?
				var half = [(left[0]+right[0])/2, (left[1]+right[1])/2, (left[2]+right[2])/2, (left[3]+right[3])/2];
				var firstDistance = Math.pow(currentPoint[1]-half[1], 2) + Math.pow(currentPoint[2]-half[2], 2) + Math.pow(currentPoint[3]-half[3], 2);
				var distance = Math.pow(left[1]-right[1], 2) + Math.pow(left[2]-right[2], 2) + Math.pow(left[3]-right[3], 2);
				if (counter == 0 || distance < radiusCube/100) return half;
				if (firstDistance < radiusCube*radiusCube) {
					return recursive(
						((!isRight) ? half: left), ((isRight)  ? half: right),
						isRight, counter--);
				} else {
					return recursive(
						((!isRight) ? left: half), ((isRight)  ? right: half),
						isRight, counter--);
				}       
			}
			var l = recursive(lPoint, curPoint, true, 10);
			var r = recursive(curPoint, rPoint, false, 10);
			return [l[0], r[0]];
		}

		for (var mesh in meshes) {
			var chrId = meshes[mesh][0]; //chromosome id for future request
			var mLen = meshes[mesh][1].length;
			var divisionInt = 1; //divide a range to the peaces
			var tempStartNeigh = [];
			var previousStep = -1;

			var intersectStart = -1;    //position
			var intersectEnd = -1;      //position
			if (mLen > 1 && mLen <50) {
				divisionInt = Math.ceil(50/mLen);
			} else if (mLen == 1) {
				var _point = meshes[mesh][1][0];
				//artificially increase the area as we can't define the line range. sqrt(2) ~ 1.4e 
				if (currentPoint[1] + 1.4*radiusCube >= _point[2] && currentPoint[1] - 1.4*radiusCube <= _point[2] &&
					currentPoint[2] + 1.4*radiusCube >= _point[3] && currentPoint[2] - 1.4*radiusCube <= _point[3] &&
					currentPoint[3] + 1.4*radiusCube >= _point[4] && currentPoint[3] - 1.4*radiusCube <= _point[4]) {
						intersectStart = _point[1] - 100; //put into variable the position of this point
						intersectEnd = _point[1] + 100; //put into variable the position of this point
						resultRanges.push([chrId, intersectStart, intersectEnd]);
				}
				continue;
			}

			for (var _v = 0; _v < mLen-1; _v++) {
				var firstPoint = meshes[mesh][1][_v];
				var secondPoint = meshes[mesh][1][_v+1];
				
				for (var _d = 0; _d < divisionInt; _d++) {
					//coordinates of the "divide" points
					var _x = firstPoint[2] + _d / divisionInt * (secondPoint[2] - firstPoint[2]);
					var _y = firstPoint[3] + _d / divisionInt * (secondPoint[3] - firstPoint[3]);
					var _z = firstPoint[4] + _d / divisionInt * (secondPoint[4] - firstPoint[4]);

					if (currentPoint[1] + radiusCube >= _x && currentPoint[1] - radiusCube <= _x &&
						currentPoint[2] + radiusCube >= _y && currentPoint[2] - radiusCube <= _y &&
						currentPoint[3] + radiusCube >= _z && currentPoint[3] - radiusCube <= _z) {
							if (previousStep != -1 && (_v != previousStep + 1 && _v != previousStep)) { //the case when we have gaps in the sequence that fall in the area
								if (intersectEnd != -1) {
									resultRanges.push([chrId, Math.ceil(intersectStart), Math.ceil(intersectEnd)]);
								} else {
									var temp = getrangeForOnePoint(((!tempStartNeigh[1])?null:tempStartNeigh[1].slice(1)), tempStartNeigh[2].slice(1),[intersectStart].concat(tempStartNeigh[0]));
									resultRanges.push([chrId, Math.ceil(temp[0]), Math.ceil(temp[1])]);
								} 
								intersectStart = -1;
								intersectEnd = -1;
							}
							previousStep = _v;
							if (intersectStart == -1) {
								intersectStart = firstPoint[1] + _d / divisionInt * (secondPoint[1] - firstPoint[1]); //put into variable the position of this point

								if (_d == 0 && _v != 0) {
									tempStartNeigh = [[_x,_y,_z],meshes[mesh][1][_v-1],meshes[mesh][1][_v+1]];
								} else if (_d == 0 && _v==0) {
									tempStartNeigh = [[_x,_y,_z],null,meshes[mesh][1][_v+1]];
								} else {
									tempStartNeigh = [[_x,_y,_z],meshes[mesh][1][_v],meshes[mesh][1][_v+1]];
								}
							} else {
								intersectEnd = firstPoint[1] + (_d+1) / divisionInt * (secondPoint[1] - firstPoint[1]); //put into variable the position of this point
							}
					}
				}
			}
			if (intersectStart != -1 && intersectEnd != -1) {
				resultRanges.push([chrId, Math.ceil(intersectStart), Math.ceil(intersectEnd)]);
			} else if (intersectStart != -1 && intersectEnd == -1) {
				var temp = getrangeForOnePoint(tempStartNeigh[1].slice(1), tempStartNeigh[2].slice(1),[intersectStart].concat(tempStartNeigh[0]));
				resultRanges.push([chrId, Math.ceil(temp[0]), Math.ceil(temp[1])]);
			} else {
				continue;
			}
		}
		if (resultRanges.length == 0) {
			var firstDistance = Math.pow(currentPoint[1]-leftPoint[1], 2) + Math.pow(currentPoint[2]-leftPoint[2], 2) + Math.pow(currentPoint[3]-leftPoint[3], 2);
			var intersectStart = currentPoint[0] - 1.4*radiusCube/Math.sqrt(firstDistance)*(currentPoint[0]-leftPoint[0]);
			
			var secondDistance = Math.pow(currentPoint[1]-rightPoint[1], 2) + Math.pow(currentPoint[2]-rightPoint[2], 2) + Math.pow(currentPoint[3]-rightPoint[3], 2);
			var intersectEnd = currentPoint[0] + 1.4*radiusCube/Math.sqrt(firstDistance)*(rightPoint[0]-currentPoint[0]);
			resultRanges.push([chr, Math.ceil(intersectStart), Math.ceil(intersectEnd)]);
		}
	    var tempVar;
	    for (var res in resultRanges) {
			if (resultRanges[res][1]< currentPoint[0] && resultRanges[res][2]>currentPoint[0] ) {
				results[0] = [resultRanges[res][0], ((vars.consts.isPositive)?currentPoint[0]:currentPoint[0]-vars.consts.PROMOTER_LENGTH), ((vars.consts.isPositive)?currentPoint[0]+vars.consts.PROMOTER_LENGTH:currentPoint[0])];
				tempVar = res;
				break;
			}
		}

		for (var res in resultRanges) {
			if (tempVar == res) continue;
			results.push(resultRanges[res]);
		}
		
		return results;
	}


/*
*	function getJSON3DFunction (chr, isNormal, X_new, Y_new, Z_new, RADIUS, callBackCustomFunction)
*	This function is a request to 3D Genome Browser database to retrieve for chromosome 'chr' data within the cube with radius 'RADIUS' around the point with coordinates (X_new, Y_new, Z_new). Depends on the boolean parameter 'isNormal' the data will be appropriate for healthy or leukemia cell.
*
*	@Result:
*		Asinchronously call callBackCustomFunction from paramters
*/
vars.getJSON3DFunction = function (chr, isNormal, X_new, Y_new, Z_new, RADIUS, callBackCustomFunction) {
	if (!callBackCustomFunction) callBackCustomFunction = function(data) {};
	$.getJSON("http://1kgenome.exascale.info/3d?chr="+chr+"&m="+((isNormal)?"normal":"leukemia")+"&xstart="+(X_new-RADIUS)+"&xend="+(X_new+RADIUS)+"&ystart="+(Y_new-RADIUS)+"&yend="+(Y_new+RADIUS)+"&zstart="+(Z_new-RADIUS)+"&zend="+(Z_new+RADIUS) + "?callback=?",
		null, function (data) {callBackCustomFunction(data)}
		)
}


/*
*	function getjson3dCurrentPointFunction(chr, isNormal, promoter_begin, leftPoint, rightPoint)
*	@Parameters:
*		chr - current chromosome
*		isNormal - boolean parameter if healthy or leukemia cell will be used for retrieve information
*		promoter_begin - position within chromosome around which 3D cube information will be retrieved
*		leftPoint - array that contains start position ([0]) of interval and its coordinates ([1],[2],[3])
*		rightPoint - array that contains end position ([0]) of interval and its coordinates ([1],[2],[3])

*	@Returns: 
*		currentPoint for which 3D cube information has been retrieved - array [position, X, Y, Z]
*/
vars.getjson3dCurrentPointFunction = function (chr, isNormal, promoter_begin, leftPoint, rightPoint) {
	var rate = (promoter_begin-leftPoint[0])/(rightPoint[0]-leftPoint[0]);
	var X_new = leftPoint[1] + rate * (rightPoint[1] - leftPoint[1]); 
	var Y_new = leftPoint[2] + rate * (rightPoint[2] - leftPoint[2]); 
	var Z_new = leftPoint[3] + rate * (rightPoint[3] - leftPoint[3]);
	var currentPoint = [promoter_begin, X_new, Y_new, Z_new];
	print("Current point: (" + X_new + ", " + Y_new + ", " + Z_new + ")");

	var callBackCustomFunction = function (data) {
		var meshes = data["data"];
		var finalRanges = vars.getApproximatedRangesStrandsForRadiusFunction(meshes, currentPoint, vars.consts.radiusCube, leftPoint, rightPoint, chr);
		/*
		for (var res in finalRanges) {
			print("http://1kgenome.exascale.info/js_snp?chr="+finalRanges[res][0]+"&start="+finalRanges[res][1]+"&end="+finalRanges[res][2]); //request to retrieve the variations in particular intervals
		}
		*/
		vars.final_results = finalRanges;
		vars.res_num = vars.req_num;
	}
	var RADIUS = 1;
	vars.req_num++; //increase number of requests
	vars.getJSON3DFunction(chr, isNormal, X_new, Y_new, Z_new, RADIUS, callBackCustomFunction);
	return currentPoint
}


/*
*	function getjsonChrPositionFunction(chr, isNormal, bp, isLeft, p)
*	@Description: Function recursively searches left and right ends of interval within the chromosome. Left and right points - points which exist in the original database of 3D Genome Browser and are the "linearly" closest points to the original point (promoter_begin).
*
*	@Parameters:
*		chr - current chromosome
*		isNormal - boolean parameter if healthy or leukemia cell will be used for retrieve information
*		promoter_begin - initial point (position) within chromosome to find closest existing points in 3D Genome Browser database
*		bp - ussumed point that should be clarified
*		isLeft - boolean parameter, means direction of qualification of points for current assimed point
*		p - counter, factor that is used for definition of number of STEPs in case of repetitions.
*
*	@Result: 
*		leftPoint and rightPoint are defined
*		exit through vars.getjson3dCurrentPointFunction(chr, isNormal, promoter_begin, leftPoint, rightPoint) as callBackFunction (asynchromous)
*/
vars.getjsonChrPositionFunction = function (chr, isNormal, promoter_begin ,bp, isLeft, p) {
	$.getJSON("http://1kgenome.exascale.info/chr_pos?chrid="+chr+"&bp="+bp+"&m="+((isNormal)?"normal":"leukemia") + "?callback=?", 
	null,
	function(data) {
		var assumedPoint = null;
		var t = promoter_begin - data[0];
		var k = t?t<0?-1:1:0;
		if (isLeft==true) { //from the left to right
			if (k==1) {
				if (p >10) { //limit for the end of the strand
                    vars.rightPoint = data;
                    vars.getjson3dCurrentPointFunction(chr, isNormal, promoter_begin, vars.leftPoint, vars.rightPoint);
                    print("It looks like you are trying to look out the range of chromosome. Last point of the chromosome is shown.")
                } else {
                    assumedPoint = data[0] + k * p * vars.STEP;
					vars.getjsonChrPositionFunction(chr, isNormal, promoter_begin, assumedPoint, true, p++);
                }
			} else {
				vars.rightPoint = data;
				vars.getjson3dCurrentPointFunction(chr, isNormal, promoter_begin, vars.leftPoint, vars.rightPoint);
			}
		} else if (isLeft==false && p > 0) {//from the right to left
			if (k==-1) {
				assumedPoint = data[0] + k * p * vars.STEP;
				vars.getjsonChrPositionFunction(chr, isNormal, promoter_begin, assumedPoint, false, p++);
			} else {
				vars.leftPoint = data;
				vars.getjson3dCurrentPointFunction(chr, isNormal, promoter_begin, vars.leftPoint, vars.rightPoint);
			}
		} else { //when isLeft is undefined - first way
			//if k == -1 - we found right border, 1 - we found left side			
			if (k==-1) {
				vars.rightPoint = data;
				assumedPoint = data[0] + k * vars.STEP;
				if (assumedPoint < 0) { //going below 0 position
                    vars.leftPoint = data;
                    vars.getjson3dCurrentPointFunction(chr, isNormal, promoter_begin, vars.leftPoint, vars.rightPoint);
                } else {
                	vars.getjsonChrPositionFunction(chr, isNormal, promoter_begin, assumedPoint, false, 2);
                }
			} else {
				leftPoint = data;
				assumedPoint = data[0] + k * vars.STEP;
				vars.getjsonChrPositionFunction(chr, isNormal, promoter_begin, assumedPoint, true, 2);
			}
		}
	});
}

/*
*	function getRangesForGenePromoterCubicArea (chr, geneStart, geneEnd, isNormal, radiusCube, isPositive)
*	The main procedural function that asynchronously accesses to the database of 3D Genome Browser and retrieves information about 3D positions of strands for particular model (according to the chr chromosome and isNormal parameters) in specific cubic area, built around the promoter start point of specific gene. Prints queries to Ensembl database (homo_sapiens_variation) to find 1) phenotypes associated with specific variations; 2) intersections of the phenotypes for different neighbour intervals in 3D space within the chromosome (process is based on the comparing promoter area with others not connected intervals within cubic area with radius = radiusCube).
*	@Parameters:
*		chr - current chromosome
*		geneStart - position of beginning of gene (numerical, lowest number among geneStart and geneEnd)
*		geneEnd - position of end of gene (numerical, largest number among geneStart and geneEnd)
*		isNormal - boolean parameter if healthy or leukemia cell will be used for retrieve information
*		radiusCube - radius of the cube (1/2 of its edge), which will be used for retrieve the data
*		isPositive - boolean parameter, "true" means positive strand, "false" - negative (used for genes)
*	@USES: vars.consts.gene_name, vars.final_results, vars.consts.RELEASE_NUM, consts.SEQ_REGION_ID
*
*/
vars.getRangesForGenePromoterCubicArea = function(chr, geneStart, geneEnd, isNormal, radiusCube, isPositive, callBackCustomFunction) {
	// refresh parameters after (if so) last run
	vars.final_results = [];
	vars.consts.radiusCube = radiusCube;
	vars.consts.isPositive = isPositive;
	vars.req_num = 1;
	vars.res_num = 0;
	waitInterval = 0;


	var promoter_begin = ((isPositive)?geneStart-vars.consts.PROMOTER_LENGTH:geneEnd+vars.consts.PROMOTER_LENGTH);
	//init STEP "constant" that has been observed during experiments
	vars.STEP = ((isNormal)?200000:500000); //normal vs leukemia statistical approximation

	vars.getjsonChrPositionFunction(chr, isNormal, promoter_begin, promoter_begin);
	vars.waitFunction(function() {
		if (!callBackCustomFunction) {
			//print appropriate Ensembl queries
			vars.Print_Input_For_Ensembl_Specific(vars.consts.gene_name, vars.final_results, vars.consts.RELEASE_NUM, vars.consts.SEQ_REGION_ID);

			//print 
			vars.getGenesInCubicAreaAroundGenePromoter(vars.final_results);	
		} else {
			callBackCustomFunction();
		}
		
	});
}

/*
*	function getGenesInCubicAreaAroundGenePromoter(final_results)
*	Searches genes that are located near (with some intersection) strands (+promoter) in cubic area around promoter region of initial GENE (vars.consts.gene_name)
*	-> final_results should be an array of arrays with begin and end positions(bases) of the interesting. results[0] has to contain start and stop positions of promoter of any specific gene or any interesting area.)
*	@USES: http://3dgb.cs.mcgill.ca/content/geneData_2.0.json file. In case of absence - asynchronously download it on the page.
*/

vars.getGenesInCubicAreaAroundGenePromoter = function(final_results) {
	var temp_foo = function(_genedata) {
		var bRange=0,eRange=0;
		var setOfGenesInCube = {}; //only intersection or full cover
		var _chrRange;	
		for (var range in final_results) {
			_chrRange = final_results[range][0];
			bRange = final_results[range][1];
			eRange = final_results[range][2];
			for (var gene in _genedata[_chrRange]) {
				var _gene = _genedata[_chrRange][gene];
				if (_gene[1]<=bRange && _gene[2] >bRange) { //left intersection for range
					setOfGenesInCube[gene] = _gene; //reserved indexes 0-4
					setOfGenesInCube[gene][5] = "left";
					setOfGenesInCube[gene][6] = Math.min(_gene[2], eRange)-bRange;
					setOfGenesInCube[gene][7] = range==0;
				} else if (_gene[1]<eRange && _gene[2] >=eRange) { //right intersection for range
					setOfGenesInCube[gene] = _gene;	//reserved indexes 0-4
					setOfGenesInCube[gene][5] = "right";
					setOfGenesInCube[gene][6] = eRange - Math.max(_gene[1], bRange);
					setOfGenesInCube[gene][7] = range==0;
				} else if (_gene[1]>=bRange && _gene[2] <=eRange) { //full cover
					setOfGenesInCube[gene] = _gene; //reserved indexes 0-4
					setOfGenesInCube[gene][5] = "center";
					setOfGenesInCube[gene][6] = _gene[2] - _gene[1];
					setOfGenesInCube[gene][7] = range==0;
				}	
			}
		}
		print("All genes, which exist in cubic area around gene ("+vars.consts.gene_name+") promoter.\n");
		// CONVENIENT OUTPUT of GENES IN CUBE
		for (var temp  in setOfGenesInCube) {
			if (temp != vars.consts.gene_name.toLowerCase())
				print(setOfGenesInCube[temp][4] + " : intersection with" + ((setOfGenesInCube[temp][7])?"":" NOT") + " promoter of "+vars.consts.gene_name+" (on the "+setOfGenesInCube[temp][5]+" of range). Length of intersection = " + setOfGenesInCube[temp][6]);
		}
	}
	if (typeof(genedata) === 'undefined') {
		$.getScript("http://3dgb.cs.mcgill.ca/content/geneData_2.0.json", function() {
		    temp_foo(genedata);
		});
	} else {
		temp_foo(genedata)
	}
}
