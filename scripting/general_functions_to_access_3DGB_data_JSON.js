/*Uncomment this if you are using not 3dbg.cs.mcgill.ca/scripting.html tool BEGIN*/
// var vars = {};
/*END*/

/*CUSTOMIZABLE*/
function print(value) {
    // console.log(value);
    display.innerHTML+= value + "\n";
}

/*	
*	function get_JSON_3D_Query(xstart, xend, ystart, yend, zstart, zend, isNormal, chr, callBackCustomFunction)
*	Retrieves information about 3D structure within cubic area of specific model (described by isNormal and chr parameters). Also executes callBackCustomFunction function with 'data' argument.
*	@Parameters:
*		xstart, xend - begin and end coordinates of cubic area along the X axis 
*		ystart, yend - begin and end coordinates of cubic area along the Y axis
*		zstart, zend - begin and end coordinates of cubic area along the Z axis
*		isNormal - boolean parameter, which can be true(healthy, GM06990 cell type model), false(Leukemia cell model) AND undefined (or anything except for boolean values - Simulated K562 cell type model)
*		chr - in case of isNormal = true or false - particular chromosome
*		callBackCustomFunction - custom function for processing the data
*	@Examples:
*		GM06990 cell - 			http://1kgenome.exascale.info/3d?chr=19&m=normal&xstart=-1&xend=2&zstart=-1&zend=2&ystart=-1&yend=2
*		Leukemia cell -			http://1kgenome.exascale.info/3d?chr=19&m=leukemia&xstart=-1&xend=2&zstart=-1&zend=2&ystart=-1&yend=2
*		Simulated K562 Cell - 	http://1kgenome.exascale.info/js_test?xstart=-680&xend=-120&zstart=-280&zend=280&ystart=-280&yend=280
*/
vars.get_JSON_3D_Query = function(xstart, xend, ystart, yend, zstart, zend, isNormal, chr, callBackCustomFunction) {
	if (isNormal == true) {
		print("Info: Healthy cell(GM06990), " + chr + " chromosome model has been chosen.");
		$.getJSON("http://1kgenome.exascale.info/3d?chr="+chr+"&m=normal&xstart="+xstart+"&xend="+xend+"&zstart="+zstart+"&zend="+zend+"&ystart="+ystart+"&yend="+yend+"?callback=?", null, function(data) {if (callBackCustomFunction) callBackCustomFunction(data);})
	} else if (isNormal == false) {
		print("Info: Leukemia cell, " + chr + " chromosome model has been chosen.");
		$.getJSON("http://1kgenome.exascale.info/3d?chr="+chr+"&m=leukemia&xstart="+xstart+"&xend="+xend+"&zstart="+zstart+"&zend="+zend+"&ystart="+ystart+"&yend="+yend+"?callback=?", null, function(data) {if (callBackCustomFunction) callBackCustomFunction(data);})
	} else {
		print("Info: Simulated K562 Cell Type model has been chosen.");
		$.getJSON("http://1kgenome.exascale.info/js_test?xstart="+xstart+"&xend="+xend+"&zstart="+zstart+"&zend="+zend+"&ystart="+ystart+"&yend="+yend+"?callback=?", null, function(data) {if (callBackCustomFunction) callBackCustomFunction(data);})
	}
}

/*	
*	function get_JSON_Nucleotides_List_Query(chr, rangeStart, rangeEnd, callBackCustomFunction)
*	Retrieves a list of nucleotides for defined range within particular chromosome and execute callBackCustomFunction function with 'data' argument
*	@Examples:
*		http://1kgenome.exascale.info/range?start=292713&end=294113&chrid=2
*/
vars.get_JSON_Nucleotides_List_Query = function(chr, rangeStart, rangeEnd, callBackCustomFunction) {
		print("Access to the bases for "+chr+" chromosome from "+rangeStart+" till "+rangeEnd+".");
		$.getJSON("http://1kgenome.exascale.info/range?start="+rangeStart+"&end="+rangeEnd+"&chrid="+chr+"?callback=?", null, function(data) {if (callBackCustomFunction) callBackCustomFunction(data);})
}

/*	
*	function get_JSON_SNPs_in_Range_Query(chr, rangeStart, rangeEnd, callBackCustomFunction)
*	Retrieves information about SNPs: an array of arrays with [SNP Position, SNP_ID(w/o 'rs'), allele_1, allele_2] for defined range within particular chromosome and execute callBackCustomFunction function with 'data' argument to process it
*		@Examples:
*			http://1kgenome.exascale.info/js_snp?chr=X&start=66548415&end=66548691
*/
vars.get_JSON_SNPs_in_Range_Query = function(chr, rangeStart, rangeEnd, callBackCustomFunction) {
		print("Access to the SNPs for "+chr+" chromosome in range from "+rangeStart+" till "+rangeEnd+".");
		$.getJSON("http://1kgenome.exascale.info/js_snp?start="+rangeStart+"&end="+rangeEnd+"&chrid="+chr+"?callback=?", null, function(data) {if (callBackCustomFunction) callBackCustomFunction(data);})
}

/*	
*	function get_JSON_ChIP_SEQ_For_Spec_Cell_Line_in_Range_Query(chr, rangeStart, rangeEnd, cellLine, callBackCustomFunction)
*	Retrieves information about ChIP-Sequenciong experiment data: an array of arrays with 
*		[chromosome, TF's begin position, TF's end, TF ID, cellines with current TF, SNPs information (@reference to vars.get_JSON_SNPs_in_Range_Query function)] for defined range within particular chromosome for particular cell line and execute callBackCustomFunction function with 'data' argument to process it. (TF means Transcription Factor)
*	@Examples:
*		http://1kgenome.exascale.info/chipseq?chr=X&start=66334596&end=66901309&celline=K562
*/
vars.get_JSON_ChIP_SEQ_For_Spec_Cell_Line_in_Range_Query = function(chr, rangeStart, rangeEnd, cellLine, callBackCustomFunction) {
		print("Access to the ChIP-Sequencing experiment data for " + chr + " chromosome from "+rangeStart+" till "+rangeEnd+".");
		$.getJSON("http://1kgenome.exascale.info/chipseq?start="+rangeStart+"&end="+rangeEnd+"&chrid="+chr+"&celline="+cellLine+"?callback=?", null, function(data) {if (callBackCustomFunction) callBackCustomFunction(data);})
}


/*	
*	function get_JSON_Closest_Point_To_Current_Pos_Query(chr, bp, isNormal, callBackCustomFunction)
*	Retrieves information about closest point to specific base (position) within particular chromosome which exists in 3D Genome Browser Database for specific model (described by isNormal and chr parameters). Also executes callBackCustomFunction function with 'data' argument to process it.
*	@Parameters:
*		chr - particular chromosome
*		bp - base for which system should find the closest point which exists in 3D Genome Browser Database
*		isNormal - boolean parameter, which can be true(healthy, GM06990 cell type model), false(Leukemia cell model) AND undefined (or anything except for boolean values - Simulated K562 cell type model)
*		callBackCustomFunction - custom function for processing the data
*	@Examples:
*		GM06990 cell - 			http://1kgenome.exascale.info/chr_pos?chrid=1&bp=59146954&m=normal
*		Leukemia cell -			http://1kgenome.exascale.info/chr_pos?chrid=1&bp=59146954&m=leukemia
*		Simulated K562 Cell - 	http://1kgenome.exascale.info/chr_pos?chrid=1&bp=59146954
*/
vars.get_JSON_Closest_Point_To_Current_Pos_Query = function(chr, bp, isNormal, callBackCustomFunction) {
	if (isNormal == true) {
		print("Info: Healthy cell(GM06990), " + chr + " chromosome model has been chosen.");
		$.getJSON("http://1kgenome.exascale.info/chr_pos?chrid="+chr+"&bp="+bp+"&m=normal?callback=?", null, function(data) {if (callBackCustomFunction) callBackCustomFunction(data);})
	} else if (isNormal == false) {
		print("Info: Leukemia cell, " + chr + " chromosome model has been chosen.");
		$.getJSON("http://1kgenome.exascale.info/chr_pos?chrid="+chr+"&bp="+bp+"&m=leukemia?callback=?", null, function(data) {if (callBackCustomFunction) callBackCustomFunction(data);})
	} else {
		print("Info: Simulated K562 Cell Type model has been chosen.");
		$.getJSON("http://1kgenome.exascale.info/chr_pos?chrid="+chr+"&bp="+bp+"?callback=?", null, function(data) {if (callBackCustomFunction) callBackCustomFunction(data);})
	}
}