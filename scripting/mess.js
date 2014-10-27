var final_results = [];
function getRangesForGenePromoterCubicArea(chr, geneStart, geneEnd, isNormal, radiusCube, isPositive) {
    var STEP = ((isNormal)?200000:500000); //normal vs leukemia statistical approximation
    var req_num = 0, res_num = 0;
    var waitInterval = 0;
	var MAX_WAIT_INTERVAL = 10000;
	var promoter_begin = ((isPositive)?geneStart-1000:geneEnd+1000);
	var leftPoint = null, rightPoint = null, assumedPoint = null;
	var currentPoint;
	var meshes;
	

	var finalRanges = [];

	var waitFunction = function(){
            if (res_num < req_num && waitInterval < MAX_WAIT_INTERVAL) {
                waitInterval = waitInterval + 50;
                setTimeout(function(){waitFunction();}, 50);
            }
	}


	
	var getApproximatedRangesStrandsForRadiusFunction = function(meshes, currentPoint, radiusCube, leftPoint, rightPoint, chr) { // where current point is set: [X_new, Y_new, Z_new]
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
		// for (var res in resultRanges) {
		// 	console.log("http://1kgenome.exascale.info/js_snp?chr="+resultRanges[res][0]+"&start="+resultRanges[res][1]+"&end="+resultRanges[res][2]);
		// }
	   var tempVar;
	   for (var res in resultRanges) {
		if (resultRanges[res][1]< currentPoint[0] && resultRanges[res][2]>currentPoint[0] ) {
			results[0] = [resultRanges[res][0], ((isPositive)?currentPoint[0]:currentPoint[0]-1000), ((isPositive)?currentPoint[0]+1000:currentPoint[0])];
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
	
	var getjson3dCurrentPointFunction = function () {
		var rate = (promoter_begin-leftPoint[0])/(rightPoint[0]-leftPoint[0]);
		var X_new = leftPoint[1] + rate * (rightPoint[1] - leftPoint[1]); 
		var Y_new = leftPoint[2] + rate * (rightPoint[2] - leftPoint[2]); 
		var Z_new = leftPoint[3] + rate * (rightPoint[3] - leftPoint[3]);
		currentPoint = [promoter_begin, X_new, Y_new, Z_new];
		console.log(X_new + "||" + Y_new + "||" + Z_new);
		req_num++; //increase number of requests
		$.getJSON("http://1kgenome.exascale.info/3d?chr="+chr+"&m="+((isNormal)?"normal":"leukemia")+"&xstart="+(X_new-1)+"&xend="+(X_new+1)+"&ystart="+(Y_new-1)+"&yend="+(Y_new+1)+"&zstart="+(Z_new-1)+"&zend="+(Z_new+1) + "?callback=?",
		null,
		function(data) {
			// res_num++; //increase number of responses
			meshes = data["data"];
			finalRanges = getApproximatedRangesStrandsForRadiusFunction(meshes, currentPoint, radiusCube, leftPoint, rightPoint, chr);
			for (var res in finalRanges) {
				console.log("http://1kgenome.exascale.info/js_snp?chr="+finalRanges[res][0]+"&start="+finalRanges[res][1]+"&end="+finalRanges[res][2]);
			}

			final_results = finalRanges;

			res_num = req_num;
		});
	}
	req_num++; //increase number of requests
	var getjsonChrPositionFunction = function (bp, isLeft, p) {
		$.getJSON("http://1kgenome.exascale.info/chr_pos?chrid="+chr+"&bp="+bp+"&m="+((isNormal)?"normal":"leukemia") + "?callback=?", 
		null,
		function(data) {
			// res_num++; //increase number of responses
			var t = promoter_begin - data[0];
			var k = t?t<0?-1:1:0;
			// console.log(k + "  " + isLeft);
			if (isLeft==true) { //from the left to right
				if (k==1) {
					assumedPoint = data[0] + k * p * STEP;
					getjsonChrPositionFunction(assumedPoint, true, p++);
				} else {
					rightPoint = data;
					getjson3dCurrentPointFunction();
				}
			} else if (isLeft==false && p > 0) {//from the right to left
				if (k==-1) {
					assumedPoint = data[0] + k * p * STEP;
					getjsonChrPositionFunction(assumedPoint, false, p++);
				} else {
					leftPoint = data;
					getjson3dCurrentPointFunction();
				}
			} else { //when isLeft is undefined - first way
				//if k == -1 - we found right border, 1 - we found left side
				if (k==-1) {
					rightPoint = data;
					assumedPoint = data[0] + k * STEP;
					getjsonChrPositionFunction(assumedPoint, false, 2);
				} else {
					leftPoint = data;
					assumedPoint = data[0] + k * STEP;
					getjsonChrPositionFunction(assumedPoint, true, 2);
				}
			}
		});
	}
	getjsonChrPositionFunction(promoter_begin);
	waitFunction();
}

var GENE_NAME = 'BRCA1', RELEASE_NUM = '37'; //specify parameters
var dbUse, seq_region_id;
if ((RELEASE_NUM==37)) {
	dbUse = 'homo_sapiens_variation_75_37';
	seq_region_id = 27509; //chr17
	// seq_region_id = 27513; //chr13
} else {
	dbUse = 'homo_sapiens_variation_76_38';
	seq_region_id = 131554; //chr17
	// seq_region_id = 131541; //chr13
}

for (var res in final_results) {
	console.log(RELEASE_NUM+' Release. Attention: check the id of chromosome. 17 chromosome is default value.')
	if (res == 0) {
		console.log('mysql  -u anonymous  -P 3306 -h 193.62.203.187 --execute "use '+dbUse+';select pf.object_id, pf.seq_region_start, p.description from phenotype_feature pf, phenotype p where type = \'Variation\' and seq_region_end < '+final_results[res][2]+' and seq_region_start > '+final_results[res][1]+' and pf.seq_region_id = '+seq_region_id+' and p.phenotype_id = pf.phenotype_id" > '+GENE_NAME+'_'+final_results[res][1]+'_'+final_results[res][2]+'_promoter_'+RELEASE_NUM+'release.txt\n');
	} else {
		console.log('mysql  -u anonymous  -P 3306 -h 193.62.203.187 --execute "use '+dbUse+';select pf.object_id, pf.seq_region_start, p.description from phenotype_feature pf, phenotype p where type = \'Variation\' and seq_region_end < '+final_results[res][2]+' and seq_region_start > '+final_results[res][1]+' and pf.seq_region_id = '+seq_region_id+' and p.phenotype_id = pf.phenotype_id" > '+GENE_NAME+'_'+final_results[res][1]+'_'+final_results[res][2]+'_'+RELEASE_NUM+'release.txt\n');

		console.log('\nCOMPARE RESULTS!!!\n');
		console.log('mysql  -u anonymous  -P 3306 -h 193.62.203.187 --execute "use '+dbUse+';select t2.ct as \'count '+final_results[0][1]+'-'+final_results[0][2]+'_promoter\', t2.phenotype_id, t1.ct as \'count '+final_results[res][1]+'-'+final_results[res][2]+'\', p.description from (select phenotype_id, count(phenotype_id) ct from phenotype_feature where seq_region_start > '+final_results[res][1]+' and seq_region_end < '+final_results[res][2]+' and type = \'Variation\' and seq_region_id = '+seq_region_id+' group by phenotype_id) t1, (select phenotype_id, count(phenotype_id) ct from phenotype_feature where seq_region_start >'+final_results[0][1]+' and seq_region_end < '+final_results[0][2]+' and type = \'Variation\' and seq_region_id = '+seq_region_id+' group by phenotype_id) t2, phenotype p where t1.phenotype_id = t2.phenotype_id and t2.phenotype_id = p.phenotype_id" > '+GENE_NAME+'_compare_promoter_'+final_results[0][1]+'_'+final_results[0][2]+'___'+final_results[res][1]+'_'+final_results[res][2]+'_'+RELEASE_NUM+'release.txt');
		;
	}
}

var main_set = [];
var arrr = {};
var _req_num = 0, _res_num = 0;
var _waitInterval = 0;
var _MAX_WAIT_INTERVAL = 10000;
var waitFunc = function(){
    if (_res_num < _req_num && _waitInterval < _MAX_WAIT_INTERVAL) {
    	console.log(_res_num + '  ' + _req_num);
        _waitInterval = _waitInterval + 50;
        setTimeout(function(){waitFunc();}, 50);
    } else {
    	console.log(arrr);
		if (main_set.length > 1) {
			for (var i = 1; i< main_set.length; i++) {
			var smthArr = {};
				for (var obj_lvl0 in main_set[0]) {
					if (!smthArr[main_set[0][obj_lvl0][3]]) {
						smthArr[main_set[0][obj_lvl0][3]] = 1;
					} else if (smthArr[main_set[0][obj_lvl0][3]]>0) {
						smthArr[main_set[0][obj_lvl0][3]] = smthArr[main_set[0][obj_lvl0][3]] + 1;
						arrr[main_set[i][obj_lvl1][3]][i][0] = arrr[main_set[i][obj_lvl1][3]][i][0] + 1;
						arrr[main_set[i][obj_lvl1][3]][i][2] = arrr[main_set[i][obj_lvl1][3]][i][2].concat(main_set[0][obj_lvl0][6]);
						arrr[main_set[i][obj_lvl1][3]][i][4] = arrr[main_set[i][obj_lvl1][3]][i][4].concat((main_set[0][obj_lvl0][1] + "-" + main_set[0][obj_lvl0][2]));
						continue;
					}
					for (var obj_lvl1 in main_set[i]) {

						if (main_set[0][obj_lvl0][3] == main_set[i][obj_lvl1][3]) {
							if (!arrr[main_set[i][obj_lvl1][3]]) {
								arrr[main_set[i][obj_lvl1][3]] = [];
							}
							if (!arrr[main_set[i][obj_lvl1][3]][i]) {
								arrr[main_set[i][obj_lvl1][3]][i] = [1, 1, main_set[0][obj_lvl0][6], main_set[i][obj_lvl1][6], [main_set[0][obj_lvl0][1] + "-" + main_set[0][obj_lvl0][2]], [(main_set[i][obj_lvl1][1] + "-" + main_set[i][obj_lvl1][2])]];
							} else {
								arrr[main_set[i][obj_lvl1][3]][i][1] = arrr[main_set[i][obj_lvl1][3]][i][1] + 1;
								arrr[main_set[i][obj_lvl1][3]][i][3] = arrr[main_set[i][obj_lvl1][3]][i][3].concat(main_set[i][obj_lvl1][6]);
							     arrr[main_set[i][obj_lvl1][3]][i][5] = arrr[main_set[i][obj_lvl1][3]][i][5].concat([(main_set[i][obj_lvl1][1] + "-" + main_set[i][obj_lvl1][2])]);
							}
						}

					}

				}
			}
		} else {
			console.log("No need");
		}
    }
}
for (var res in final_results) {
	_req_num++;
	$.getJSON("http://1kgenome.exascale.info/chipseq?chr="+final_results[res][0]+"&start="+final_results[res][1]+"&end="+final_results[res][2]+"&celline=K562" + "?callback=?", null, function(data) {main_set.push(data);_res_num++;})
}
waitFunc();



// !!! if I have complete final_results - want to find genes that are located near (with some intersection) strands (+promoter) in cubic area around promoter region of initial GENE

var bRange=0,eRange=0; 
var setOfGenesInCube = {}; //only intersection or full cover
for (var range in final_results) {
	_chrRange = final_results[range][0];
	bRange = final_results[range][1];
	eRange = final_results[range][2];
	for (var gene in genedata[_chrRange]) {
		var _gene = genedata[_chrRange][gene];
		if (_gene[1]<=bRange && _gene[2] >bRange) { //left intersection for range
			setOfGenesInCube[gene] = _gene; 
			setOfGenesInCube[gene][3] = "left";
			setOfGenesInCube[gene][4] = Math.min(_gene[2], eRange)-bRange;
			setOfGenesInCube[gene][5] = range==0;
		} else if (_gene[1]<eRange && _gene[2] >=eRange) { //right intersection for range
			setOfGenesInCube[gene] = _gene;
			setOfGenesInCube[gene][3] = "right";
			setOfGenesInCube[gene][4] = eRange - Math.max(_gene[1], bRange);
			setOfGenesInCube[gene][5] = range==0;
		} else if (_gene[1]>=bRange && _gene[2] <=eRange) { //full cover
			setOfGenesInCube[gene] = _gene;
			setOfGenesInCube[gene][3] = "center";
			setOfGenesInCube[gene][4] = _gene[2] - _gene[1];
			setOfGenesInCube[gene][5] = range==0;
		}	
	}
}

// CONVENIENT OUTPUT of GENES IN CUBE
for (var temp  in setOfGenesInCube) {
	console.log(temp + " : intersection with" + ((setOfGenesInCube[temp][5])?"":" NOT") + " promoter of RB1 (on the "+setOfGenesInCube[temp][3]+" of range). Length of intersection = " + setOfGenesInCube[temp][4]);
}