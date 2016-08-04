loadInfrastructure = function(){


	Curve = function(entryPairs){

		//Raw float array of arrays
		this.entryPairs = entryPairs;

		//This will be the first element to access
		this.clipLeft = 0;
		//This will be the number of elements to ignore at the end
		this.clipRight = 0;

		//If index calculation is 0 +- tolerance, it will be ignored;
		this.tolerance = 0.05

		this.tbBar = 1;
		this.strokeColor = "black";
		this.fillColor = "black";

		this.calculateIndices = function(){

			var inflections = this.get1DInflectionPoints();
			var indices = [];

			for(var i=0; i<inflections.length; i++){

				if(i==0){
					continue;
				}

				var before = inflections[i-1]
				var after = inflections[i]

				if((before.type == "increasing")&&(after.type == "decreasing")){

					indexCalc = 0;

					for(var j=before.indexAfter; j<after.indexBefore; j++){
						indexCalc += this.getEffectiveElement(j)[1] - this.getEffectiveElement(before.indexAfter)[1];
					}

					if((indexCalc < -this.tolerance)||(indexCalc > this.tolerance)){

						indices.push({
							afterBeforeIndex : before.indexAfter,
							beforeAfterIndex : after.indexBefore,
							calculation : indexCalc
						});
					}
				}
			}

			this.indices = indices;
		}

		this.get1DInflectionPoints = function(){

			var inflections = []
			var target = this.deriv1Curve;

			for(var i=target.clipLeft; i<target.getEndLength(); i++){

				if(i==target.clipLeft){
					continue;
				}

				var thisOne = target.getEffectiveElement(i);
				var beforeOne = target.getEffectiveElement(i-1);

				if((beforeOne[1] < 0)&&(thisOne[1] >= 0)){
					inflections.push({

						type : "increasing",
						indexBefore : i-1,
						indexAfter : i,
						originalCurve : this,
						deriv1Curve : target
					})
				}
				else if((beforeOne[1] >= 0)&&(thisOne[1] < 0)){
					inflections.push({

						type : "decreasing",
						indexBefore : i-1,
						indexAfter : i,
						originalCurve : this,
						deriv1Curve : target
					})
				}
			}

			return inflections;
		}

		this.setClipLeft = function(arg){

			if(this.deriv1Curve != undefined){
				this.deriv1Curve.setClipLeft(arg)
			}
			if(this.deriv2Curve != undefined){
				this.deriv2Curve.setClipLeft(arg)
			}
			this.clipLeft = arg;

		}
		this.setClipRight = function(arg){

			if(this.deriv1Curve != undefined){
				this.deriv1Curve.setClipRight(arg)
			}
			if(this.deriv2Curve != undefined){
				this.deriv2Curve.setClipRight(arg)
			}
			this.clipRight = arg;

		}
		this.getPortion = function(from, to){

			var snippetCurve = new Curve(this.entryPairs.slice(from, to));
			snippetCurve.deriv1Curve = new Curve(this.deriv1Curve.entryPairs.slice(from, to)).changeStrokeColor("red").changeFillColor("red");
			snippetCurve.deriv2Curve = new Curve(this.deriv2Curve.entryPairs.slice(from, to)).changeStrokeColor("green").changeFillColor("green");

			snippetCurve.calculateIndices();

			return snippetCurve;
		}
		this.setupDerivativesAndFinalise = function(){

			this.smoothAndLose13();
			//-13 0 0
			this.deriv1Curve = this.getDerivativeCurve().changeStrokeColor("red").changeFillColor("red")
			//-13 -13 0
			this.deriv1Curve.smoothAndLose13();
			//-13 -26 0
			this.lose13();
			//-26 -26 0
			this.deriv2Curve = this.deriv1Curve.getDerivativeCurve().changeStrokeColor("green").changeFillColor("green")
			//-26 -26 -26
			this.deriv2Curve.smoothAndLose13();
			//-26 -26 -39
			this.deriv1Curve.lose13();
			//-26 -39 -39
			this.lose13();
			//-39 -39 -39
			this.calculateIndices();
		}

		this.lose13 = function(){

			this.entryPairs = this.entryPairs.slice(13, this.entryPairs.length - 13)

			return this;
		}

		this.smoothAndLose13 = function(){

			//Smoothern the curve
			for(var i=13; i<this.entryPairs.length - 13; i++){

				var collection = {};

				collection["t0"] = this.entryPairs[i-12][1] * 1265
				collection["t1"] = this.entryPairs[i-11][1] * -345
				collection["t2"] = this.entryPairs[i-10][1] * -1122
				collection["t3"] = this.entryPairs[i-9][1] * -1255
				collection["t4"] = this.entryPairs[i-8][1] * -915
				collection["t5"] = this.entryPairs[i-7][1] * -255
				collection["t6"] = this.entryPairs[i-6][1] * 590
				collection["t7"] = this.entryPairs[i-5][1] * 1503
				collection["t8"] = this.entryPairs[i-4][1] * 2385
				collection["t9"] = this.entryPairs[i-3][1] * 3155
				collection["t10"] = this.entryPairs[i-2][1] * 3750
				collection["t11"] = this.entryPairs[i-1][1] * 4125
				collection["t12"] = this.entryPairs[i][1] * 4253
				collection["t13"] = this.entryPairs[i+1][1] * 4125
				collection["t14"] = this.entryPairs[i+2][1] * 3750
				collection["t15"] = this.entryPairs[i+3][1] * 3155
				collection["t16"] = this.entryPairs[i+4][1] * 2385
				collection["t17"] = this.entryPairs[i+5][1] * 1503
				collection["t18"] = this.entryPairs[i+6][1] * 590
				collection["t19"] = this.entryPairs[i+7][1] * -255
				collection["t20"] = this.entryPairs[i+8][1] * -915
				collection["t21"] = this.entryPairs[i+9][1] * -1255
				collection["t22"] = this.entryPairs[i+10][1] * -1122
				collection["t23"] = this.entryPairs[i+11][1] * -345
				collection["t24"] = this.entryPairs[i+12][1] * 1265

				var sum = 0;
				for(var j in collection){
					sum = sum + collection[j];
				}

				//divide by the factor and push the new result pair
				this.entryPairs[i] = [this.entryPairs[i][0], sum / 30015]
			}

			this.lose13();

			return this;
		}

		this.changeStrokeColor = function(arg){

			this.strokeColor = arg;
			return this;
		}

		this.changeFillColor = function(arg){

			this.fillColor = arg;
			return this;
		}

		this.getDerivativeCurve = function(){


			var t = this.entryPairs;

			var newEntryPairs = [];

			for(var i=0; i<t.length; i++){

				if(i==0){
					continue;
				}
				else if(i==1){
					//The first entry should be identical to the second to avoid issues
					newEntryPairs.push([t[i-1][0], t[i][1] - t[i-1][1]])
				}

				newEntryPairs.push([t[i][0], t[i][1] - t[i-1][1]])
			}

			return new Curve(newEntryPairs);
		}

		this.getEffectiveLength = function(){

			return this.entryPairs.length - this.clipRight - this.clipLeft;
		}
		this.getEndLength = function(){

			return this.entryPairs.length - this.clipRight;
		}
		this.getEffectiveElement = function(i){

			return this.entryPairs[i];
		}

		this.getMinX = function(){

			var min, value;

			for(var i=this.clipLeft; i<this.getEndLength(); i++){

				value = this.getEffectiveElement(i)[0];
				min = ((i==this.clipLeft)||(value < min)) ? value : min;
			}

			return min;
		}
		this.getMaxX = function(){

			var max, value;

			for(var i=this.clipLeft; i<this.getEndLength(); i++){

				value = this.getEffectiveElement(i)[0];
				max = ((i==this.clipLeft)||(value > max)) ? value : max;
			}
			
			return max;
		}
		this.getDiffX = function(){

			return this.getMaxX() - this.getMinX();
		}
		this.getMinY = function(){
			
			var min, value;

			for(var i=this.clipLeft; i<this.getEndLength(); i++){

				value = this.getEffectiveElement(i)[1];
				min = ((i==this.clipLeft)||(value < min)) ? value : min;
			}

			return min;
		}
		this.getMaxY = function(){

			var max, value;

			for(var i=this.clipLeft; i<this.getEndLength(); i++){

				value = this.getEffectiveElement(i)[1];
				max = ((i==this.clipLeft)||(value > max)) ? value : max;
			}
			
			return max;
		}
		this.getDiffY = function(){

			return this.getMaxY() - this.getMinY();
		}

		this.getInvertedY = function(context, y){

			return ((-y) + context.canvas.offsetHeight)
		}

		this.drawToCanvas = function(context){

			var canvas = context.canvas;

			context.lineWidth = 0.5;

			var xFactor = (context.canvas.offsetWidth) / this.getDiffX();
			var yFactor = (context.canvas.offsetHeight) / (this.getDiffY() * this.tbBar)

			context.fillStyle = this.fillColor

			//In the case of the primary curve
			if(this.deriv1Curve != undefined){
				context.lineWidth = 2;
			}
			else{
				context.lineWidth = 0.5;
			}

			for(var i=this.clipLeft; i<this.getEndLength(); i++){
				
				context.beginPath();
				//context.arc((this.getEffectiveElement(i)[0] - this.getMinX()) * xFactor, this.getInvertedY(context, (this.getEffectiveElement(i)[1] - this.getMinY()) * yFactor), 2, 0, 2 * Math.PI, false);
				context.fill();
			}

			context.strokeStyle = this.strokeColor;

			for(var i=this.clipLeft; i<this.getEndLength()-1; i++){

				context.beginPath();
			  	context.moveTo((this.getEffectiveElement(i)[0] - this.getMinX()) * xFactor, this.getInvertedY(context, (this.getEffectiveElement(i)[1] - this.getMinY()) * yFactor));
			  	context.lineTo((this.getEffectiveElement(i+1)[0] - this.getMinX()) * xFactor, this.getInvertedY(context, (this.getEffectiveElement(i+1)[1] - this.getMinY()) * yFactor));
				context.stroke();
			}

			var yLevel = this.getInvertedY(context, (0 - this.getMinY()) * yFactor);
			//Horizontal Line at 0
			context.beginPath();
		  	context.moveTo(0, yLevel);
		  	context.lineTo(context.canvas.width, yLevel);
			context.stroke();

			//Vertical lines where the indices lie
			if(this.indices != undefined){

				context.lineWidth = 2;

				for(var i=0; i<this.indices.length; i++){

					var from = this.indices[i].afterBeforeIndex;
					var to = this.indices[i].beforeAfterIndex;

					context.strokeStyle = "blue"
					context.beginPath();
				  	context.moveTo((this.getEffectiveElement(from)[0] - this.getMinX()) * xFactor, 0);
				  	context.lineTo((this.getEffectiveElement(from)[0] - this.getMinX()) * xFactor, context.canvas.height);
					context.stroke();
					context.strokeStyle = "purple"
					context.beginPath();
				  	context.moveTo((this.getEffectiveElement(to)[0] - this.getMinX()) * xFactor, 0);
				  	context.lineTo((this.getEffectiveElement(to)[0] - this.getMinX()) * xFactor, context.canvas.height);
				  	context.stroke();
				}

				context.lineWidth = 0.5;
			}
		}

		return this;
	}

	databaseHandle = function(name, contents){

		try{
			var ob = JSON.parse(contents);

			for(var c in ob){
				importCurve(c, new Curve(ob[c]));
			}

		}
		catch(e){
			console.log(e)
			throw new Error("Could not import JSON database.")
		}
	}

	fileHandle = function(name, contents){

		var arrayOfArrays = contents.split("\n").map(function(a){return a.split("\t")});

		new JHTML({
			name : "pageOver",
			type : "div",
			style : {
				position : "absolute",
				display : "table",
				top : "0px",
				left : "0px",
				width : "100%",
				height : "100%",
				backgroundColor : "rgba(50, 50, 50, 0.9)",
				color : "#FFFFFF",
			},
			children : [
				new JHTML({
					name : "selectorContainer",
					type : "div",
					style : {
						display : "table-cell",
						verticalAlign : "middle",
					},
					children : [
						new JHTML({
							name : "timeSelectorContainer",
							type : "div",
							style : {
								display : "table",
								margin : "auto",
							},
							children : [
								new JHTML({
									name : "timeSelectorP",
									type : "p",
									innerHTML : "Select Time Field:",
									style : {
										display : "inline-block",
									},
								}),
								new JHTML({
									name : "timeSelector",
									type : "select",
									selectOptions : arrayOfArrays[0]
								})
							]
						}),
						new JHTML({
							name : "tempSelectorContainer",
							type : "div",
							style : {
								display : "table",
								margin : "auto",
							},
							children : [
								new JHTML({
									name : "tempSelectorP",
									type : "p",
									innerHTML : "Select Temperature Field:",
									style : {
										display : "inline-block",
									},
								}),
								new JHTML({
									name : "tempSelector",
									type : "select",
									selectOptions : arrayOfArrays[0]
								})
							]
						}),
						new JHTML({
							name : "importButton",
							type : "button",
							innerHTML : "Import",
							onclick : function(){

								var timeIndex = this.JHTML.parent.children["timeSelectorContainer"].children["timeSelector"].element.selectedIndex
								var tempIndex = this.JHTML.parent.children["tempSelectorContainer"].children["tempSelector"].element.selectedIndex

								var entryPairs = [];

								var beginAt = 0;

								if( isNaN(parseFloat(arrayOfArrays[beginAt][timeIndex])) ){
									beginAt++;
								}

								//Remove the irrelevant rows and parse the data into floats
								for(var i=beginAt; i<arrayOfArrays.length; i++){
									entryPairs.push(
										[
											parseFloat( arrayOfArrays[i][timeIndex] ), 
											parseFloat( arrayOfArrays[i][tempIndex] )
										]
									);
								}
								
								this.JHTML.parent.parent.remove();
								window.importCurve(name, new Curve(entryPairs));

							},
							style : {
								display : "table",
								margin : "auto",
								marginTop : "10px",
								width : "100px",
								height : "30px",
							},
						}),
						new JHTML({
							name : "backButton",
							type : "button",
							innerHTML : "Back",
							onclick : function(){
								this.JHTML.parent.parent.remove();
							},
							style : {
								display : "table",
								margin : "auto",
								marginTop : "10px",
								width : "100px",
								height : "30px",
							},
						}),
					]
				})
			]
		}).appendToBody();
	}


	/*

		Established

	*/

	objectSize = function(obj){

	    var size = 0;
	    var key;
	    for (var key in obj) {
	        if (obj.hasOwnProperty(key)) size++;
	    }
	    return size;
	};

	outputFile = function(data, filename){

		window.URL = window.URL || window.webkitURL;

	    var a = document.createElement('a');
	    var blob = new Blob(data, {'type':'application\/octet-stream'});
	    a.href = window.URL.createObjectURL(blob);
	    a.download = filename;
	    a.click();
	}

	readDatabase = function(e){

		var file = e.target.files[0];

		if(!file){
			return;
		}

		var reader = new FileReader();

		reader.onload = function(e){

			var contents = e.target.result;
			databaseHandle(file.name, contents);
		};

		reader.readAsText(file);
	}

	readFile = function(e){

		var file = e.target.files[0];

		if(!file){
			return;
		}

		var reader = new FileReader();

		reader.onload = function(e){

			var contents = e.target.result;
			fileHandle(file.name, contents);
		};

		reader.readAsText(file);
	}


	Price = function(string){

		var me = this;

		this.fullUnits = 0;
		this.partialUnits = 0;
		this.negative = false;

		this.setup = function(string){

			if(string == undefined){
				string = "0.00";
			}

			if(string[0] == "-"){
				me.negative = true;
				string = string.substring(1);
			}

			var split = string.split(".");

			if(split.length == 0){ throw new Error("Price error 1");}
			else if(split.length == 1){

				//Full units if presented without decimal
				me.fullUnits = parseInt(string);

				if(isNaN(me.fullUnits)){
					throw new Error("Price error 2");
				}
			}
			else if(split.length == 2){

				me.fullUnits = parseInt(split[0]);
				me.partialUnits = parseInt(backwardPadWithZeros(split[1], 2).substring(0,2));

				if(isNaN(me.fullUnits)){
					throw new Error("Price error 2");
				}
				if(isNaN(me.partialUnits)){
					throw new Error("Price error 2.5");
				}
			}
			else{
				throw new Error("Price error 3");
			};
		}

		this.setup(string);

		this.string = function(){

			return me.negative ? "-"+(me.fullUnits+".")+(padWithZeros(me.partialUnits, 2)) : (me.fullUnits+".")+(padWithZeros(me.partialUnits, 2));
		}

		this.add = function(price2){

			var newValue = me.singleValue() + price2.singleValue();

			return (new Price().setBySingleValue(newValue))
		}

		this.singleValue = function(){

			return me.negative ? (-1 * ((me.fullUnits*100) + me.partialUnits)) : ((me.fullUnits*100) + me.partialUnits);
		}

		this.multiplyInt = function(integer){

			return new Price().setBySingleValue(me.singleValue()*integer);
		}

		this.multiplyFloat = function(float){

			return new Price(((me.singleValue()*float) / 100).toFixed(2));
		}

		this.setBySingleValue = function(value){

			if(value < 0){
				me.negative = true;
				value = value * (-1);
			}

			me.fullUnits = 0;
			me.partialUnits = 0;

			while(value >= 100){
				value = value - 100;
				me.fullUnits++;
			}
			me.partialUnits = value;

			return this;
		}

		return this;
	}

	Instruction = function(f, a){

		this.f = f;
		this.a = a;

		this.activate = function(){
			return this.f.apply(this, this.a);
		}

		return this;
	}

}