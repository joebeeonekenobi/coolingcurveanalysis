window.onload = function(){

	if(window.chrome == undefined){

		new JHTML({
			name : "NotChrome",
			type : "p",
			innerHTML : "This application functions fully only with Chrome."
		}).appendToBody();

		throw new Error("Chrome is not detected.")
	}

	loadInfrastructure()

	//Call the main function to setup
	main();

	//Call to initially resize
	window.onresize();
}

main = function(){

	window.directory = {};

	var container = loadPageLayout();
	window.directory["right"] = container.children["right"];
	container.appendToBody();


}

clearContext = function(context, color){

	var canvas = context.canvas;

	context.fillStyle = (color==undefined) ? "white" : color
	context.rect(0, 0, canvas.width, canvas.height);
	context.fill();
}

interestEntry = function(ob){

	for(var i=0; i<ob.indices.length; i++){
		if( (ob.indexOfInterest >= ob.indices[i].afterBeforeIndex) && (ob.indexOfInterest <= ob.indices[i].beforeAfterIndex) ){
			inspectIndexArea({
				curve : ob.curve,
				index : ob.indices[i],
			})
		}
	}
}

inspectIndexArea = function(ob){

	//var snippetCurve = new Curve(ob.curve.entryPairs.slice(ob.index.afterBeforeIndex - 2, ob.index.beforeAfterIndex + 2));
	var snippetCurve = ob.curve.getPortion(ob.index.afterBeforeIndex - 2, ob.index.beforeAfterIndex + 2)

	var peak1DValue = snippetCurve.deriv1Curve.getMaxY()
	var peak1DIndex = undefined

	for(var i=0; i<snippetCurve.deriv1Curve.entryPairs.length; i++){
		if(snippetCurve.deriv1Curve.entryPairs[i][1] == peak1DValue){
			peak1DIndex = i
		}
	}

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
		},
		children : [
			new JHTML({
				name : "container",
				type : "div",
				style : {
					display : "table-cell",
					verticalAlign : "middle",
				},
				children : [
					window.directory["secondaryCanvas"] = new JHTML({
						name : "secondaryCanvas",
						type : "canvas",
						curve : snippetCurve,
						style : {
							width : "50%",
							height : "50%",
							display : "table",
							marginLeft : "auto",
							marginRight : "auto",
						},
					}).windowResize(function(jhtml){

						//Update the internal resolution of the canvas with each window resize
						jhtml.element.width = jhtml.element.offsetWidth;
						jhtml.element.height = jhtml.element.offsetHeight;

						var context = jhtml.element.getContext("2d")

						clearContext(context)

						//we need to recalculate the indices each time that the canvas is resized, incase the clip now excludes them
						jhtml.curve.calculateIndices();

						//Draw the curve and its derivs to the primary canvas
						jhtml.curve.drawToCanvas(context);
						jhtml.curve.deriv1Curve.drawToCanvas(context);
						jhtml.curve.deriv2Curve.drawToCanvas(context);

					}),
					new JHTML({
						name : "indexCalculation",
						type : "p",
						innerHTML : "index : "+ob.index.calculation,
						style : {
							textAlign : "center",
							color : "white",
						},
					}),
					new JHTML({
						name : "maxPeak1D",
						type : "p",
						innerHTML : "1st Derivation Maximum Value : "+peak1DValue,
						style : {
							textAlign : "center",
							color : "white",
						},
					}),
					new JHTML({
						name : "tempAtMax",
						type : "p",
						innerHTML : "Temperature at 1st Derivation Maximum: "+snippetCurve.entryPairs[peak1DIndex][1],
						style : {
							textAlign : "center",
							color : "white",
						},
					}),
					new JHTML({
						name : "backButton",
						type : "button",
						innerHTML : "Back",
						onclick : function(e){
							this.JHTML.parent.parent.remove();
						},
						style : {
							display : "table",
							marginRight : "auto",
							marginLeft : "auto",
						}
					}),
				]
			}),
		]
	}).appendToBody()

	window.onresize();
}

instantiateCurve = function(curveObject){

	//Reset the clip
	//window.directory["clipLeft"].resetToZero()
	//window.directory["clipRight"].resetToZero()

	window.directory["right"].removeChildren();

	window.directory["primaryCanvas"] = new JHTML({
		name : "primaryCanvas",
		type : "canvas",
		curve : curveObject,
		onclick : function(e){

			var indexRange = this.JHTML.curve.entryPairs.length - this.JHTML.curve.clipRight - this.JHTML.curve.clipLeft;
			var percentageInX = e.offsetX / this.JHTML.element.offsetWidth;
			var indexOfRange = Math.round(indexRange * percentageInX);
			var indexOfInterest = this.JHTML.curve.clipLeft + indexOfRange;

			interestEntry({
				indexOfInterest : indexOfInterest,
				curve : this.JHTML.curve,
				indices : this.JHTML.curve.indices,
			})
		},
		style : {
			width : "100%",
			height : "100%",
		},
	}).windowResize(function(jhtml){

		//Update the internal resolution of the canvas with each window resize
		jhtml.element.width = jhtml.element.offsetWidth;
		jhtml.element.height = jhtml.element.offsetHeight;

		var context = jhtml.element.getContext("2d")

		clearContext(context)

		//we need to recalculate the indices each time that the canvas is resized, incase the clip now excludes them
		jhtml.curve.calculateIndices();

		//Draw the curve and its derivs to the primary canvas
		jhtml.curve.drawToCanvas(context);
		jhtml.curve.deriv1Curve.drawToCanvas(context);
		jhtml.curve.deriv2Curve.drawToCanvas(context);

	}).appendTo(window.directory["right"])

	//Call to apply the primary update
	window.onresize();
}

importCurve = function(filename, curveObject){

	var entry = createFileEntry(filename, curveObject)

	if(window.directory["left"].children["leftMid"].children[filename+"Entry"] != undefined){
		window.directory["left"].children["leftMid"].children[filename+"Entry"].remove();
	}

	entry.appendTo(window.directory["left"].children["leftMid"]);

	//Importing the curves should cause them and their deriv curves to smoothe and lose 13.
	curveObject.setupDerivativesAndFinalise();

	//instantiate the curve etc
	entry.element.click();
}

createFileEntry = function(filename, curve){


	return new JHTML({
		name : filename+"Entry",
		type : "div",
		class : "cadetMouse",
		curve : curve,
		onclick : function(){

			window.directory["clipLeft"].propetise("max", this.JHTML.curve.entryPairs.length);
			window.directory["clipRight"].propetise("max", this.JHTML.curve.entryPairs.length)

			//Set the value to that which has been rememebered
			window.directory["clipLeft"].propetise("value", this.JHTML.curve.clipLeft)
			window.directory["clipRight"].propetise("value", this.JHTML.curve.clipRight)

			//Set the html to the correct value
			window.directory["clipLeft"].parent.children["clipLeftP"].propetise("innerHTML", "Clip Left : "+this.JHTML.curve.clipLeft)
			window.directory["clipRight"].parent.children["clipRightP"].propetise("innerHTML", "Clip Right : "+this.JHTML.curve.clipRight)

			instantiateCurve(this.JHTML.curve);
		},
		style : {
			display : "inline-block",
			height : "30px",
			width : "100%"
		},
		children : [
			new JHTML({
				name : filename+"EntryPRemove",
				type : "button",
				innerHTML : "X",
				onclick : function(e){

					//If this curve is instantiated
					if(window.directory["primaryCanvas"].curve === this.JHTML.parent.curve){

						window.directory["primaryCanvas"].remove();
					}

					this.JHTML.parent.remove();
					e.cancelBubble = true;
					e.preventDefault();
				},
				style : {
					margin : "0px",
					padding : "7px",
					display : "inline-block",
					borderWidth : "1px",
					outline : "none",
				},
			}),
			new JHTML({
				name : filename+"EntryP",
				type : "p",
				innerHTML : filename,
				style : {
					margin : "0px",
					padding : "7px",
					display : "inline-block",
				},
			})
		]
	});
}


loadPageLayout = function(){

	return new JHTML({
		name : "container",
		type : "div",
		style : {
			position : "absolute",
			width : "100%",
			height : "100%",
		},
		children : [
			window.directory["left"] = new JHTML({
				name : "left",
				type : "div",
				style : {
					display: "inline-block",
					width : "300px",
					height : "100%",
					backgroundColor : "cadetblue",
					overflow : "hidden",
				},
				children : [
					new JHTML({
						name : "leftTop",
						type : "div",
						style : {

						},
						children : [

							new JHTML({
								name : "titleP",
								type : "h2",
								innerHTML : "Cooling Curve Indexing Tool",
								style : {
									textAlign : "center",
									color : "#FFFFFF"
								}
							}),
							new JHTML({
								name : "inputFileDiv",
								type : "div",
								children : [
									new JHTML({
										name : "inputFileP",
										type : "p",
										innerHTML : "Import Curve File:",
										style : {
											marginBottom : "10px",
										}
									}),
									new JHTML({
										name : "inputFileInput",
										type : "input",
										properties : {
											type : "file"
										},
										onchange : function(e){
											window.readFile(e);
											this.JHTML.propetise("value", "");
										},
										style : {
										}
									})
								]
							}),
							new JHTML({
								name : "inputDatabaseDiv",
								type : "div",
								children : [
									new JHTML({
										name : "inputDatabaseP",
										type : "p",
										innerHTML : "Import Database File:",
										style : {
											marginBottom : "10px",
										}
									}),
									new JHTML({
										name : "inputDatabaseInput",
										type : "input",
										properties : {
											type : "file"
										},
										onchange : function(e){
											window.readDatabase(e);
											this.JHTML.propetise("value", "");
										},
										style : {
										}
									})
								]
							}),
							new JHTML({
								name : "exportDatabaseDiv",
								type : "div",
								children : [
									new JHTML({
										name : "exportDatabaseP",
										type : "p",
										innerHTML : "Export Database File:",
										style : {
											marginBottom : "10px",
										}
									}),
									new JHTML({
										name : "exportDatabaseInput",
										type : "button",
										innerHTML : "Download",
										onclick : function(e){

											var ob = {};

											var through = window.directory["left"].children["leftMid"].children;

											for(var i in through){
												ob[through[i].element.textContent.slice(1)] = through[i].curve.entryPairs;
											}

											outputFile([JSON.stringify(ob)], "curveDatabase.json")
										},
										style : {
											fontFamily : "Arial"
										}
									})
								]
							}),
							new JHTML({
								name : "break",
								type : "hr",
							})

						]
					}),
					new JHTML({
						name : "leftMid",
						type : "div",
						style : {
							
						},
						children : [
						]
					}),
					new JHTML({
						name : "leftBottom",
						type : "div",
						style : {
							position : "absolute",
							bottom : "0px",
							width : "inherit",
							height : "85px",
							backgroundColor : "cadetblue",
						},
						children : [

							new JHTML({
								name : "clipLeftContainer",
								type : "div",
								style : {
									position : "absolute",
									bottom : "40px",
									width : "inherit",
								},
								children : [
									new JHTML({
										name : "clipLeftP",
										type : "p",
										innerHTML : "Clip Left : 0",
										style : {
											margin : "0px",
											marginLeft : "10px"
										}
									}),
									window.directory["clipLeft"] = new JHTML({
										name : "clipLeft",
										type : "input",
										properties : {
											type : "range",
											min : 0,
											max : 40,
											step : 1,
											value : 0,
										},
										style : {
											width : "inherit",
											margin : "0px",
											outline : "none",
										},
										oninput : function(){
											this.JHTML.parent.children["clipLeftP"].element.innerHTML = "Clip Left : "+this.JHTML.value;
										},
										onchange : function(){
											try{
												var cl = parseInt(this.JHTML.value);
												window.directory["primaryCanvas"].curve.setClipLeft(cl);
												window.onresize();
											}
											catch(e){}
										},
									})
								]
							}),
							new JHTML({
								name : "clipRightContainer",
								type : "div",
								style : {
									position : "absolute",
									bottom : "0px",
									width : "inherit",
								},
								children : [
									new JHTML({
										name : "clipRightP",
										type : "p",
										innerHTML : "Clip Right : 0",
										style : {
											margin : "0px",
											marginLeft : "10px"
										}
									}),
									window.directory["clipRight"] = new JHTML({
										name : "clipRight",
										type : "input",
										properties : {
											type : "range",
											min : 0,
											max : 400,
											step : 1,
											value : 0,
										},
										style : {
											width : "inherit",
											margin : "0px",
											outline : "none",
										},
										oninput : function(){
											this.JHTML.parent.children["clipRightP"].element.innerHTML = "Clip Right : "+this.JHTML.value;
										},
										onchange : function(){
											try{
												var cr = parseInt(this.JHTML.value);
												window.directory["primaryCanvas"].curve.setClipRight(cr);

												window.onresize();
											}
											catch(e){}
										},
									})
								]
							})
						]
					}),
				]
			}),
			new JHTML({
				name : "right",
				type : "div",
				style : {
					position : "absolute",
					height : "100%",
					right : "0px",
					top : "0px",
				},
			}).windowResize(function(jhtml){
				jhtml.element.style.width = window.innerWidth - jhtml.parent.children["left"].element.offsetWidth;
			}),
		]
	});
}