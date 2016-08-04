Instruction = function(f, a){

	this.f = f;
	this.a = a;

	this.activate = function(){
		return this.f.apply(this, this.a);
	}

	this.dynamicMonadicInsert = function(arg){
		this.a.push(arg);
		return this;
	}

	return this;
}

JHTML = function(jsonProperties){

	//Error Catching
	if(jsonProperties["type"] == undefined){

		throw new Error("JHTML 'type' property not specified");
	}

	if(jsonProperties["name"] == undefined){

		throw new Error("JHTML 'name' property not specified");
	}

	//For resize listeners
	if(window.resizeEvents == undefined){
		window.resizeEvents = {};
	}

	if(window.onresize == undefined){
		window.onresize = function(){
			for(var i in window.resizeEvents){
				try{

					if(window.resizeEvents[i] instanceof Instruction){

						window.resizeEvents[i].activate();
						continue;
					}

					window.resizeEvents[i]();
				}
				catch(e){
					console.log("Resize event failed");
					console.log(e);
				}
			}
		}
	}

	//Self Reference
	var me = this;

	//Variables
	this.element = document.createElement(jsonProperties["type"]);
	this.element.JHTML = this;
	this.JHTML = this;
	this.children = {};
	this.parent = undefined;
	this.name = jsonProperties["name"];

	//Remove in deployment
	this.element.title = this.name;

	//value routing for the element
	me.__defineGetter__("value", function(){

		return me.element.value;
	})

	//Constructor
	for(var property in jsonProperties){

		switch(property){
			case "name" :
				continue;
			case "type" :
				continue;
			case "innerHTML" : 
				this.element.innerHTML = jsonProperties[property];
				break;
			case "id" : 
				this.element.id = jsonProperties[property];
				break;
			case "class" : 
				this.element.className = jsonProperties[property];
				break;
			case "src" : 
				this.element.src = jsonProperties[property];
				break;
			case "value" : 
				this.element.value = jsonProperties[property];
				break;
			case "style" : 
				for(var s in jsonProperties["style"]){
					this.element.style[s] = jsonProperties[property][s];
				}
				break;
			case "properties" : 
				for(var p in jsonProperties["properties"]){
					this.element[p] = jsonProperties[property][p];
				}
				break;
			case "onclick" : 
				this.element.onclick = jsonProperties[property];
				break;
			case "onmouseover" : 
				this.element.onmouseover = jsonProperties[property];
				break;
			case "onmouseenter" : 
				this.element.onmouseenter = jsonProperties[property];
				break;
			case "onmouseleave" : 
				this.element.onmouseleave = jsonProperties[property];
				break;
			case "onkeyup" : 
				this.element.onkeyup = jsonProperties[property];
				break;
			case "oninput" : 
				this.element.oninput = jsonProperties[property];
				break;
			case "onkeydown" : 
				this.element.onkeydown = jsonProperties[property];
				break;
			case "onmousedown" : 
				this.element.onmousedown = jsonProperties[property];
				break;
			case "onmouseup" : 
				this.element.onmouseup = jsonProperties[property];
				break;
			case "onchange" : 
				this.element.onchange = jsonProperties[property];
				break;
			case "onselect" : 
				this.element.onselect = jsonProperties[property];
				break;
			case "placeholder" : 
				this.element.placeholder = jsonProperties[property];
				break;
			case "tabIndex" : 
				this.element.tabIndex = jsonProperties[property];
				break;
			case "selectOptions" : 
				for(var i=0; i<jsonProperties[property].length; i++){
					this.element.options[this.element.options.length] = new Option(jsonProperties[property][i], jsonProperties[property][i]);
				}
				break;
			case "children" : 
				for(var i=0; i<jsonProperties[property].length; i++){
					jsonProperties[property][i].appendTo(this);
				}
				break;
			case "onconstruct" : 
				this.constructCallback = jsonProperties[property];
				break;
			default :
				this[property] = jsonProperties[property];
		}
	}


	//Standard Functions

	this.upward = function(JHTMLname){

		var target = this;

		if(JHTMLname == undefined){

			while(target.parent != undefined){
				target = target.parent;
			}
			return target;
		}
		else{
			while(target.parent != undefined){
				if(target.name == JHTMLname){
					return target;
				}
				else{
					target = target.parent;
				}
			}

			throw new Error("JHTML node: '"+JHTMLname+"' has not been located using upward method from '"+this.name+"'.");
		}
	}

	this.windowResize = function(func){

		if(window.resizeEvents[this.name] != undefined){
			throw new Error("The JHTML object name "+this.name+" is already used for a resize event, try to use uniqie names for elements");
		}

		window.resizeEvents[this.name] = new Instruction(func,[this]);
		return this;
	}

	this.style = function(property, value){

		//Style the given property with provided value
		me.element.style[property] = value;

		//Return Monad Style
		return me;
	}

	this.propetise = function(property, value){

		//Add the given property to the element, with the provided value
		me.element[property] = value;

		//Return Monad Style
		return me;
	}

	this.appendTo = function(container){

		//Catch for appending pure elements
		if(!(container instanceof JHTML)){
			throw new Error("Cannot append non-JHMTL objects");
		}

		//Literally Append
		container.element.appendChild(me.element);

		//Add parents reference to this
		container.children[me.name] = me;
		//Add reference to parent in this
		me.parent = container;

		//Return Monad Style
		return me;
	}

	this.appendToTopOf = function(container){

		//Catch for appending pure elements
		if(!(container instanceof JHTML)){
			throw new Error("Cannot append non-JHMTL objects");
		}

		//Literally Append
		if(container.element.children.length != 0){
			container.element.insertBefore(me.element, container.element.children[0]);
		}
		else{
			container.element.appendChild(me.element)
		}

		//Add parents reference to this
		container.children[me.name] = me;
		//Add reference to parent in this
		me.parent = container;

		//Return Monad Style
		return me;
	}

	this.appendToBody = function(){

		document.body.appendChild(me.element);

		me.element.focus();

		//Return Monad Style
		return me;
	}

	//Function to remove the element from the node tree, but not cancel its properties: ie to move it
	this.lightRemove = function(){

		//remove the reference to this that the parent has
		delete me.parent.children[me.name];

		//remove the reference to this's parent
		me.parent = undefined;

		//Literally remove this element
		me.element.remove();

		//Return Monad Style
		return me;
	}

	this.construct = function(){

		if(this.constructCallback != undefined){
			this.constructCallback();
		}
	}

	this.appendChildren = function(childrenArray){

		for(var i=0; i<childrenArray.length; i++){
			childrenArray[i].appendTo(this);
		}
	}

	this.removeChildren = function(){

		//Call remove recursively on all children
		for(var c in me.children){

			//Remove link to parent for safe measure
			//me.children[c].parent = undefined;
			//Recursive Call
			me.children[c].remove();
			//Delete Reference to the child in this
			//delete me.children[c];
		}
	}

	this.remove = function(){

		delete window.resizeEvents[this.name];

		//Remove listeners to prevent memory leak
		me.element.onclick = undefined;
		me.element.oninput = undefined;
		me.element.ondragstart = undefined;
		me.element.onmouseover = undefined;
		me.element.onmouseenter = undefined;
		me.element.onmouseleave = undefined;
		me.element.onkeyup = undefined;
		me.element.onchange = undefined;
		me.element.onselect = undefined;

		if(me.parent != undefined){

			//Delete parents reference to me
			delete me.parent.children[me.name];

			//Remove this parent reference
			me.parent = undefined;
		}

		//Literally remove this element
		me.element.remove();

		//Remove
		me.removeChildren();
		//Return Monad Style
		return me;
	}

	//Call the construct
	this.construct();
	return this;
}