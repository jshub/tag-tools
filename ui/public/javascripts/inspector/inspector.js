



function setup_inspector(inspector_id){
	
	var DOM = YAHOO.util.Dom,
	    the_inspector,
		// Used by height calculation - the height of the fixed parts of the inspector, ie everything except the event list accordion
		_static_height;
  
  // init the panel
  the_inspector = new YAHOO.widget.Panel(inspector_id, {
        width: "225px",
        draggable: true, 
        close: true,
        autofillheight: "body",
        constraintoviewport: true
  });
  the_inspector.render();

   var inspector_element = document.getElementById(inspector_id);
   var ul = inspector_element.getElementsByTagName("ul");
   if (ul.length==0){
   		return;
   }	
   
  // init the accordion inside the panel body
  var eventList = new YAHOO.widget.AccordionView(ul[0], {
        width: '100%', 
        collapsible: true,
        animate: false
      });

  // add contextual tooltips for event specific help using the title attribute
  // TODO make this appear above the panel
  var eventListHelp = new YAHOO.widget.Tooltip("eventListHelp", { 
			  context: DOM.getElementsByClassName('help-text', 'div'),
        	  constraintoviewport: true,
			  width: "300px",
			  zindex: 1000
	});
  
  
  // Make the panel resizable and handle events and repainting ref: http://developer.yahoo.com/yui/examples/container/panel-resize.html
  // TODO account for open/closed accordion in recalculating the body height
  var the_inspectorResize = new YAHOO.util.Resize('inspector-maximised', {
    handles: ['br'],
    autoRatio: false,
    minWidth: 225,
    minHeight: 290,
    status: false
  });
  
  
  // initialize some fields needed by the height calculations
  var inspector_height = the_inspector.innerElement.clientHeight;
  _static_height = inspector_height - min_size_for_evtlist();

  
  the_inspectorResize.on("startResize", function(args) {
  	
	// set our minimum height
	var min_height = minimum_inspector_height();
    the_inspectorResize.set("minHeight", min_height);
	
    if (this.cfg.getProperty("constraintoviewport")) {
        var clientRegion = DOM.getClientRegion();
        var elRegion = DOM.getRegion(this.element);
        the_inspectorResize.set("maxWidth", clientRegion.right - elRegion.left - YAHOO.widget.Overlay.VIEWPORT_OFFSET);
        the_inspectorResize.set("maxHeight", clientRegion.bottom - elRegion.top - YAHOO.widget.Overlay.VIEWPORT_OFFSET);
      } else {
        the_inspectorResize.set("maxWidth", null);
        the_inspectorResize.set("maxHeight", null);
    }
  }, the_inspector, true);
  
  
  the_inspectorResize.on("resize", function(args) {
    var panelHeight = args.height;
    this.cfg.setProperty("height", panelHeight + "px");
	
	manage_height();
	
  }, the_inspector, true);
  
  
  // lets try setting the initial height 
  eventList.subscribe("afterPanelOpen",function(message){
		manage_height(message.panel);
  });
  
  function manage_height(selected_item){
  	
	if (!selected_item){
		var panels = eventList.getPanels();
		for (var i=0;i<panels.length;i++){
			if (DOM.hasClass(panels[i].firstChild,eventList.CLASSES.ACTIVE)){
				selected_item = panels[i];
				break;
			}
		}
	}
	
	if (!selected_item){
		return;
	}
	
	var chrome_height = 135;
	var preferred_panel_height = 150;
	var default_inspector_height = 450;
	var min_panel_size = 100;

	//TODO make this a bit more robust...
	var content = selected_item.childNodes[1];

	var auto_height = the_inspector.innerElement.style.height == "";
	var inspector_height = the_inspector.innerElement.clientHeight;
	
	if (auto_height){
		
		var max_inspector_size = min_size_for_evtlist() + chrome_height + preferred_panel_height;
		var preferred_height = Math.max(default_inspector_height,max_inspector_size);
		
		if (inspector_height > preferred_height){
			var diff =  inspector_height - preferred_height;
			var current_height = content.offsetHeight;
			var new_height = current_height - diff;
			content.style.height =new_height + "px";
		}
	}
	else {
		
		var available_height = inspector_height - chrome_height - min_size_for_evtlist();
		var content_height = content.offsetHeight;
		var actual_content = content.getElementsByTagName("div");
		if (actual_content.length){
			var full_content_height = actual_content[0].offsetHeight;
			if (content_height > available_height){
				if (available_height < min_panel_size){
					// we have to grow the inspector - this won't normally happen unless we really add a lot of categories
					var new_inspector_height = inspector_height + (min_panel_size - available_height + 10);
	    			the_inspector.cfg.setProperty("height", new_inspector_height + "px");
				}
				else {
					content.style.height = available_height + "px";
				}
			} 
			else if (full_content_height > content_height){
				content.style.height = (available_height) + "px";
			}
		}
	}		
	
  }
  
  function minimum_inspector_height(){
  	
		var preferred_panel_height = 150;
		var event_list =   min_size_for_evtlist();
		return _static_height + preferred_panel_height + event_list;
			
  }
  
  var _item_height;
  
  function min_size_for_evtlist(){

	var items = eventList.getPanels();
 	var count = items.length;
	//TODO read item height from a collapsed item
	return count * (_item_height || get_item_height());
	
  }

  function get_item_height(){
	var items = eventList.getPanels();
 	var count = items.length;
	var height = 0;
	for (var i=0;i<count;i++){
		if (DOM.hasClass(items[i].firstChild,eventList.CLASSES.ACTIVE)){
			continue
		}
		else {
			return _item_height = items[i].offsetHeight;
		}
	}
	return 0;  	
  } 	  

	
  // make this visible to outside page for testing...	
  window.eventList = eventList;
  window.manage_height = manage_height;

	
	
	
};








var jshub = {};

/**
 * Assuming we only want one of these guys in the page...
 * It must be initialised somehow - we can provide an init function to be called explicitly
 * or expect a struture with a known name to exist - eg id = jshub-inspector OR create the whole
 * thing here within the component - OR create on demand, say when a button is clicked in the 
 * page ?
 * 
 */
(function(){
	
	var DOM = YAHOO.util.Dom;

	// use this list for now - allow it to be configured through options later
	var default_categories = {
		"tagging-issues"		 : {label : "Tagging issues (${count})"},
		"page" 					 : {label : "Page events (${count})"},
		"user-interactions" 	 : {label : "Ecommerce events (${count})"},
		"data-sources"			 : {label : "Data sources (${count})"},
		"inline-content-updates" : {label : "Inline content updates (${count})"}
	};
	
	
	// eventually we'll build this dyynamically from a simple list of types in above categories collection
	var event_type_mappings = {
		"data-capture-start" : "page",
		"page-view" : "page",
		"cart-add": "user-interactions",
		"duplicate-value-error": "page",
		"plugin-initialization-start": "data-sources"
	};
	
	var events = [
		{category:"page",id:"event-1",variable:"Page-view-complete",vendor:"Google Analytics",value:"True"},
		{category:"page",id:"event-2",variable:"Page-name",value:"Homepage",warning:true,warnings:{'Google Analytics':'Homepage','Coremetrics':'Home1','MF - hPage':'Homepage1'}},
		{category:"page",id:"event-3",variable:"Page-category",value:"Electrics",warning:true,warnings:{'Google Analytics':'Electrics','Coremetrics':'Homeware'}},
		{category:"page",id:"event-4",variable:"Page-ref",vendor:"Coremetrics",value:"123"},
		{category:"user-interactions",id:"event-5",variable:"Rollover reveal",vendor:"Coremetrics",value:"Prod123",help_text:"<p>Coremetrics event.</p><p>Rollover reveal <br /> This refers to ... Aenean quis enim. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec at justo.</p><p><a href='../docs/'>View documentation</a></p>"},
		{category:"user-interactions",id:"event-6",variable:"DetailsClick",vendor:"Google Analytics",value:"123",help_text:"<p>Google Analytics event.</p><p>DetailsClick <br /> This refers to ... Aenean quis enim. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec at justo.</p><p><a href='../docs/'>View documentation</a></p>"},
		{category:"user-interactions",id:"event-7",variable:"DetailsClicked",vendor:"Coremetrics",value:"Prod123",help_text:"<p>Coremetrics event.</p><p>DetailsClicked <br /> This refers to ... Aenean quis enim. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec at justo.</p><p><a href='../docs/'>View documentation</a></p>"}
	];
	
	events = [];
	
	var yui_events = {
		"page" : [],
		"user-interactions" : [],
		"tagging-issues" : []
	}
	
	function Inspector(options){
		
		/**
		 * 
		 */
		this._static_height = 0;
		
		/**
		 * Default 'sticking' size when we expand a category - so the inspector may be smaller than this
		 * if the selected category isn't very tall, but won't grow beyond this unless resized but the user.
		 */
		this.default_expanded_height = 450;
		

		/**
		 * How big do we want this to be before user has resized the inspector.
		 */
		this._preferred_list_item_height = 150;

		/**
		 * We want to at least be able to see on whole event.
		 */
		this._min_list_item_height = 100;
		
		/**
		 * We keep track of the Accordion height for use in the overall height calculation...
		 */
		this._collapsed_event_list_height = 0;
		
		/**
		 * the category panels, stored by category_id
		 */
		this.panels = {};
		
		/** 
		 * start in success state
		 */
		this.success_state = 'info';
		
		/**
		 * listen out for Hub events
		 */
		var self = this;
		if (window.ETL) {
			ETL.bind("*",null,function(a,b){self.on_hub_event(a,b)});
			this.success_state = 'success';
		}
		
	};
	
	Inspector.prototype.render = function(display_state){
		
			var div = document.getElementById("jshub-inspector-container");
			if (!div){
				div = document.body.appendChild(document.createElement("div"));
				div.id = "jshub-inspector-container";
				div.className = "yui-cssreset yui-cssfonts yui-cssgrids yui-cssbase jshub inspector yui-skin-sam example-ui";
			}
			else {
				div.innerHTML = "";
			}			
			
			 var panel = new YAHOO.widget.Panel("jshub_inspector", {
			        width: "225px",
			        draggable: true, 
			        close: false,
			        autofillheight: "body",
			        constraintoviewport: true
			  });
			  
			  panel.setHeader(_create_header());
			  panel.setBody(_create_body());
			  panel.setFooter("jsHub Activity Inspector v1.123");
			  panel.render(div);
			  this.yuipanel = panel;

			// Set the state before we build all of the internals, as we need to collect
			// accurate offset dimensions as we build
			this.set_success_state(this.success_state);
			
			//TODO make the initial state a configuration option
			this.set_display_state(display_state || "state3");
			  
			    // init the accordion inside the panel body
			  this.event_list = new YAHOO.widget.AccordionView("event-list", {
			        width: '100%', 
			        collapsible: true,
			        animate: false
			      }
			  );

			  this.event_list.subscribe("afterPanelOpen",this.on_panel_expand,null,this);
			  
			  // Make the panel resizable and handle events and repainting ref: http://developer.yahoo.com/yui/examples/container/panel-resize.html
			  // TODO account for open/closed accordion in recalculating the body height
			  var resizer = new YAHOO.util.Resize('jshub_inspector', {
			    handles: ['br'],
			    autoRatio: false,
			    minWidth: 225,
			    minHeight: 290,
			    status: false
			  });
			  
			resizer.on("startResize",this.prepare_to_resize,null,this);
			resizer.on("resize",this.set_height,null,this);

			this.resizer = resizer;
			
			var categories = default_categories;
			for(var name in categories){
				this.add_category(name, categories[name].label,categories[name]);
			}
			
			this.add_event = _post_render_add_event; 
			
			for (var i in yui_events){
				var panel = this.panels[i];
				var section_container = DOM.getElementsByClassName("event-section","div",panel);
				
				for (var ii in yui_events[i]){
					yui_events[i][ii].render(section_container[0]);	
					_increment_event_count(panel);
				} 
			}
			
			// initialize events
			for (var i in events){
				this.add_event(event_type_mappings[events[i].type],events[i]);
			}

			var inspector_div = document.getElementById("jshub_inspector");
			
			var self = this; 
			var launcher =  DOM.getElementsByClassName("launcher","ul",inspector_div);
			YAHOO.util.Event.addListener(launcher, "click", function(){self.set_display_state("state2")});
			
			var button_large_container =  DOM.getElementsByClassName("buttons large","div",inspector_div);
			var button_large = DOM.getElementsByClassName("button events","a",button_large_container[0]);
			YAHOO.util.Event.addListener(button_large, "click", function(e){e.preventDefault();self.set_display_state("state3");});
			
			var button_small_container =  DOM.getElementsByClassName("buttons small","div",inspector_div);
			var button_small =  DOM.getElementsByClassName("button","a",button_small_container[0]);
			YAHOO.util.Event.addListener(button_small, "click", function(e){e.preventDefault();self.set_display_state("state2");});
			
			var container_minimise =  DOM.getElementsByClassName("container-minimise","a",inspector_div);
			YAHOO.util.Event.addListener(container_minimise, "click", function(e){e.preventDefault();self.set_display_state("state2");});
			var container_close =  DOM.getElementsByClassName("container-close","a",inspector_div);
			YAHOO.util.Event.addListener(container_close, "click", function(e){e.preventDefault();self.set_display_state("state1");});
		
		this.rendered = true;
		
	}
    /**
     * Initialisation routines
     * @param {Object} container_id
     */
    Inspector.prototype.init = function(container_id) {
      var self = this;
      
      // initialise jshub tag status 
      if (window.ETL) {
        var jshubURL = $("script[src*=jshub.js]").attr('src');
		ETL.logger.log("Inspector: loading tag source from " + jshubURL);
        $.get(jshubURL, function(jshubTagSrc) {
          hashcode = SHA1(jshubTagSrc);
          $.getJSON('http://gromit.etl.office/akita-on-rails/tag_configurations/find_by_sha1/' + hashcode + '.js?callback=?', function(data) {
          // (or use a locally cached copy)
          // $.getJSON('../javascripts/jshub/e090e895a3193594e933b9e5782e72eb29f6a3c1.js', function(data) {
            console.log('Data from server', data);
            self.initRevisionStatus(data);
          });
        });
      }
    };
	

	/**
	 * 
	 */	
	Inspector.prototype.prepare_to_resize = function(){
		
		// set our minimum height
		var min_height = this.minimum_height();
	    this.resizer.set("minHeight", min_height);
		
		// or should it be the outer container, parent of this...
	  	var inspectorBody = document.getElementById('jshub_inspector');
		
	    if (this.yuipanel.cfg.getProperty("constraintoviewport")) {
	        var clientRegion = DOM.getClientRegion();
	        var elRegion = DOM.getRegion(inspectorBody);
	        this.resizer.set("maxWidth", clientRegion.right - elRegion.left - YAHOO.widget.Overlay.VIEWPORT_OFFSET);
	        this.resizer.set("maxHeight", clientRegion.bottom - elRegion.top - YAHOO.widget.Overlay.VIEWPORT_OFFSET);
	      } 
		  else {
	        this.resizer.set("maxWidth", null);
	        this.resizer.set("maxHeight", null);
	    }
		
	};

 	Inspector.prototype.on_panel_expand = function(message){
		_set_height.call(this,message.panel);
  }

 	Inspector.prototype.minimum_height = function(){
	 return this._static_height + this._min_list_item_height + this._collapsed_event_list_height;
  }
	
	Inspector.prototype.set_height = function(args){
		if (args){
			var panelHeight = args.height;
			this.yuipanel.cfg.setProperty("height", panelHeight + "px");
		}
		_set_height.call(this);
		
	};

	/**
	 * Set height of Inspector, taking into account height related configuration options, as well as
	 * whether user has manually adjusted height. This is invoked in response to several operations - 
	 * manual resize, expand category, add category etc.
	 * @param {Object} selected_item
	 */
	function _set_height(selected_item){
	
		if (!selected_item){
			var panels = this.event_list.getPanels();
			for (var i=0;i<panels.length;i++){
				if (DOM.hasClass(panels[i].firstChild,this.event_list.CLASSES.ACTIVE)){
					selected_item = panels[i];
					break;
				}
			}
		}
		
		if (!selected_item){
			return;
		}
		var preferred_panel_height = this._preferred_list_item_height;
		var default_inspector_height = this.default_expanded_height;
		var min_panel_size = this._min_list_item_height;
	
		//TODO make this a bit more robust...
		var content = selected_item.childNodes[1];
		
		var inner_element = this.yuipanel.innerElement;
		var auto_height = inner_element.style.height == "";
		var inspector_height = inner_element.clientHeight;
		
		if (auto_height){
			
			var max_inspector_size = this._collapsed_event_list_height + this._static_height + preferred_panel_height;
			var preferred_height = Math.max(default_inspector_height,max_inspector_size);

			if (inspector_height > preferred_height){
				var diff =  inspector_height - preferred_height;
				var current_height = content.offsetHeight;
				var new_height = current_height - diff;
				content.style.height =new_height + "px";
			}
		}
		else {
			var available_height = inspector_height - this._static_height - this._collapsed_event_list_height;
			var content_height = content.offsetHeight;
			var actual_content = content.getElementsByTagName("div");
			if (actual_content.length){
				var full_content_height = actual_content[0].offsetHeight;
				if (content_height > available_height){
					if (available_height < min_panel_size){
						// we have to grow the inspector - this won't normally happen unless we really add a lot of categories
						var new_inspector_height = inspector_height + (min_panel_size - available_height + 10);
		    			this.yuipanel.cfg.setProperty("height", new_inspector_height + "px");
					}
					else {
						content.style.height = available_height + "px";
					}
				} 
				else if (full_content_height > content_height){
					content.style.height = (available_height) + "px";
				}
			}
		}		
	}

	/**
	 * 
	 * @param {string} category_name - what are we going to call it - refer to it as
	 * @param {number} [index] where to insert - default to end of existing items
	 */
	Inspector.prototype.add_category = function(category_id, label,index){
		
		this.event_list.addPanel({label: _create_category_label(label), content: _create_category_panel()});		

		var panels = this.event_list.getPanels();
		this.panels[category_id] = panels[panels.length-1];
		
		//if (!this._category_item_height){
		//	this._category_item_height = this.panels[category_id].offsetHeight;
		//}		
		
		if (this._category_item_height){
			this._collapsed_event_list_height += this._category_item_height;
		}
		
		// TODO - _set_height if this is being added at runtime
	};
	
	
	Inspector.prototype.on_hub_event = function(event){
		if (event_type_mappings[event.type]){
			this.add_event(event_type_mappings[event.type],event)
		}
	};

	/**
	 * Until the inspector is rendered, just store the captured events.
	 * @param {Object} category_id
	 * @param {Object} event
	 */
	Inspector.prototype.add_event = function(category_id,event){
		events.push(event);
	}

	/**
	 * Add an event to the appropriate list
	 * @param {Object} category_name
	 * @param {Object} event
	 */
	function _post_render_add_event(category_id,event){
		var panel = this.panels[category_id];
		
		var content = panel.childNodes[1];
		content = content.childNodes[0].childNodes[0];

		if (content.className == "bd"){
			content.innerHTML = content.innerHTML + _create_event(event);			
		}
		
		_increment_event_count(panel);
		_set_height.call(this);
	}
	
	/**
	 * Expand one of the Accordion items
	 * @param {Object} category_name
	 */
	Inspector.prototype.expandCategory = function(category_name){
		console.log("expand Category " + category_name);
	};
	
	/**
	 * Select a particular event - opening the containing Accordion item if necessary, and scrolling into view
	 * @param {Object} event_id
	 */
	Inspector.prototype.selectEvent = function(event_id){
		console.log("selectEvent " + event_id);
	};
	
	//TODO remove duplication between these nextb two
	Inspector.prototype.set_success_state = function(state){
	  
	  // cache new state
	  this.success_state = state;

	  // update the maximised example
	  var statusAreaSmall = DOM.getElementsByClassName('status small', 'div', 'jshub_inspector');
	  var statusAreaLarge = DOM.getElementsByClassName('status large', 'div', 'jshub_inspector');
	  var inspectorBody = DOM.getAncestorByClassName(statusAreaSmall[0], 'bd');
	  // clear the existing states
	  DOM.removeClass(inspectorBody, 'info');
	  DOM.removeClass(inspectorBody, 'warning');
	  DOM.removeClass(inspectorBody, 'error'); 
	  DOM.removeClass(inspectorBody, 'success');
	  
	  // add the state class to the body of the inspector for contextual CSS switching
	  DOM.addClass(inspectorBody, state);
	  
	  // and add descriptive text
	  function setMessage (text) {
	    var messageDivSmall = DOM.getElementsByClassName('message', 'p', statusAreaSmall[0]);
	    var messageDivLarge = DOM.getElementsByClassName('message', 'p', statusAreaLarge[0]);
		messageDivSmall[0].innerHTML = text;
		messageDivLarge[0].innerHTML = text;
	  }
	  
	  switch (state) {
	  	case 'success':
		  setMessage('Installed &amp; active');
		  break;
	  	case 'info':
		  setMessage('Not installed');
		  break;
	  	case 'warning':
		  setMessage('Active with warnings');
		  break;
	  	case 'error':
		  setMessage('Having problems');
		  break;
	  }
	  

	};

	Inspector.prototype.set_display_state = function(state){
	  // update the maximised example
	  var inspectorBody = document.getElementById('jshub_inspector');
	  // clear the existing states
	  DOM.removeClass(inspectorBody, 'state1');
	  DOM.removeClass(inspectorBody, 'state2');
	  DOM.removeClass(inspectorBody, 'state3');
	  
	  // add the state class to the body of the inspector for contextual CSS switching
	  DOM.addClass(inspectorBody, state);


		var inner_element = this.yuipanel.innerElement;
		var auto_height = inner_element.style.height == "";
		
		var panel_body = this.yuipanel.body;
		if (!auto_height){
			if (state == "state1"){
				this.yuipanel.cfg.setProperty("height", 30 + "px");
				panel_body.style.height = "auto";
			}			
			else if (state == "state2"){
				this.yuipanel.cfg.setProperty("height", 135 + "px");
				panel_body.style.height = "auto";
			}
			else {
				//debugger;
				this.set_height();
				//debugger;
				// couldn't find a nicer way to keep the resizer in sync...
				this.resizer.unlock();
				var element = this.yuipanel.innerElement;
				this.resizer.resize(null,element.offsetHeight,element.offsetWidth,0,0,true,true);
			}
		}	
		
	  if (state == "state3" && typeof this._category_item_height == "undefined"){
 		  var inspector_div = document.getElementById("jshub_inspector");
		  this._static_height = inspector_div.offsetHeight - this._min_list_item_height; 
		  var panels = this.event_list.getPanels();
		  this._category_item_height = panels[0].offsetHeight;
		  this._collapsed_event_list_height = this._category_item_height * panels.length;
	  }	

	  if (this.resizer){
		if (state == "state3"){
			this.resizer.unlock();
		}
		else {
			this.resizer.lock();
		}
	  }		


	};

	/**
	 * Initialise the tag revision status warnings
	 * @param {Object} data the response from the configutor's find_by_sha1 lookup
	 */
    Inspector.prototype.initRevisionStatus = function(data) {
 	  var self = this, panelNumber = 2;
	  
	  
      var StatusRenderer = function(data) {
        var data = data;
        
        var header = function(text) {
          return '<div class="yui-g help-text event-header" title="Tag status report">' + text + '</div>'
        };
        var subheader = function(type, text) {
          return '<div class="message ' + type + '"><ul><li>' + text + '</li></ul></div>';
        };
        var variable = function(name, value) {
          return '<div class="yui-gd">' +
		  '  <div class="yui-u first">' +
          '    <p class="variable">' + name + ':</p>' +
          '  </div>' +
          '  <div class="yui-u">' +
          '    <p class="value">' + value + '</p>' +
          '  </div>' +
		  '</div>';
        };
        var bodyMessage = function(text) {
          return '<div class="message">' + text + '</div>';
        }
        var wrap = function(text, eventId) {
          return '<div id="' + eventId + '" class="tag-status-item"><div class="bd">' +
          text +
          '<div class="yui-g"><hr class="event-separator" /></div>' +
          '</div></div>';
        };
        var createEvent = function(html) {
          var eventId = DOM.generateId();
          var newEvent = new YAHOO.widget.Module(eventId, {
            visible: false
          });
          newEvent.cfg.queueProperty("visible", true);
          html = wrap(html, eventId);
          newEvent.setBody(html);
          return newEvent;
        };
		
		/**
		 * Retrieve all 'error' level messages from the status update
		 */
		this.getErrors = function() {
          var html, error, event, events = [];
          for (var i = 0; i < data.errors.length; i++) {
            error = data.errors[i];
            switch (error) {
              case "hash code not found":
                html = header("Altered tag");
                html += subheader("error", "Tag is not recognized");
                html += bodyMessage("The tag code was not recognized by the configurator. " +
                "This could mean that it has been altered since it was generated. This error may also " +
                "occur if the tag configuration has been deleted from the server which originally " +
                "generated it.");
                event = createEvent(html);
                events.push(event);
				// this is a warning not an error, as the tag may still be operating correctly
                if (self.success_state == 'success') {
                  self.set_success_state('warning');
                }    
				break;
			  // other errors not yet implemented
            }
          }
		  return events;
		}
        
		/**
		 * Retrieve all 'warning' level messages from the status update
		 */
        this.getWarnings = function(){ 
          var html, event, events = [];
          if (data.warnings.pending_revisions) {
            var pending = data.warnings.pending_revisions;
            html = header("Tag out of date");
            html += subheader("warning", "Tag is " + pending + " version" 
			  + (pending > 1 ? "s" : "") + " behind most recent revision");
            html += bodyMessage("You may need to update to the latest version.");
            event = createEvent(html);
            events.push(event);
			if (self.success_state == 'success') {
				self.set_success_state('warning');
			}
          }
          if (data.warnings.tag_type) {
            html = header("Debug version detected");
            html += subheader("warning", "Using the debug version of the jsHub code");
            html += bodyMessage("You are not recommended to use this on a production website.");
            event = createEvent(html);
            events.push(event);
          }
          return events;
        };
		
		/**
		 * Retrieve all 'info' level messages from the status update
		 */
        this.getInfos = function() {
		  if (data.info.status === "not found") {
		  	return [];
		  }
		  
          var html, event, events = [];
          html = header("Tag status information");

//      @data[:info][:status] = "up to date"
//		@data[:info][:updated] = revision.updated_at
//      @data[:info][:version] = revision.revision_number
//      @data[:info][:url] = url_for(revision.tag_configuration)
//      @data[:info][:name] = revision.tag_configuration.name
//      @data[:info][:site] = revision.tag_configuration.site_name

		  if (data.info.status === "up to date") {
		    html += subheader("info", "Tag is up to date");
		  }
		  html += variable("Name", '<a href="'+data.info.url+'" title="Click to edit">'+data.info.name+'</a>');
		  html += variable("Site", data.info.site);
		  html += variable("Revision", data.info.version);
		  html += variable("Updated", data.info.updated);
          event = createEvent(html);
          events.push(event);
          return events;
        };
      };
      
      var renderer = new StatusRenderer(data);
      var errors = renderer.getErrors();
      var warnings = renderer.getWarnings();
      var infos = renderer.getInfos();
      var collections = [errors, warnings, infos];
	  
      for (var i = 0; i < collections.length; i++) {
        for (var j = 0; j < collections[i].length; j++) {
          var event = collections[i][j];
          // TODO this appends when really we want to prepend
          //event.render('event-section-' + panelNumber);
		  yui_events["tagging-issues"].push(event);
          //onsole.log('New Event added to Panel' + panelNumber);
        }
      }
	  
	  if (this.rendered){
			// just copied from render for now...tidy up after demo
			for (var i in yui_events){
				var panel = this.panels[i];
				var section_container = DOM.getElementsByClassName("event-section","div",panel);
				
				for (var ii in yui_events[i]){
					yui_events[i][ii].render(section_container[0]);	
					_increment_event_count(panel);
				} 
			}
	  }

    };
	
	function _create_header(){
		return '<span class="title">Activity Inspector</span><a class="container-minimise" href="#">Minimise</a><a class="container-close" href="#">Close</a>'; 
	}

	function _create_body(){
		return _create_status_small() 
		     + _create_status_large() 
		     + _create_search() 
			 + _create_event_list()
			 + _create_footer_buttons("Hide Events")
			 + _create_launcher();
	}
	
	function _create_status_large(){
		var html = [];
		html.push('<div class="yui-g status large">');
		html.push('<div class="yui-u first icon" title="Inspector status icon">&nbsp;</div>');
		html.push('<div class="yui-u text">');
		html.push('<p class="self">jsHub is</p>');
		html.push('<p class="message">Installed &amp; active</p>');
		html.push('</div>');
		html.push('</div>');
		return html.join("");
	}
	
	function _create_status_small(){
		return '<div class="yui-g status small">' +
	        		'<div class="yui-u first icon">&nbsp;</div>' +
	        		'<div class="yui-u text">' +
	          			'<p class="message">Installed &amp; active</p>' +
	        		'</div>' +
	    		'</div>';		
	}
	
	function _create_footer_buttons(){
	     var html = [];
		 html.push('<div class="yui-g buttons large">');
		 html.push('<a class="button events" href="#">View Events</a>');
		 html.push('<a class="button get" href="http://www.jshub.org/">Get jsHub</a>');
		 html.push('</div>');
		 html.push('<div class="yui-g buttons small">');
		 html.push('<a class="button" href="#">Hide Events</a>');
		 html.push('</div>');
	  	return html.join("");
	}
	
	function _create_launcher(){
    	return '<ul class="launcher"><li class="status">jsHub</li></ul>';
	}
	  	
	function _create_search(){
		return '<div class="yui-g search">' +
          	      '<p class="search"><label class="search">Find</label><input type="text" class="search" /></p>' +
      			'</div>';	
	}
	
	
	function _create_event_list(){
		return '<ul id="event-list"></ul>';
	}
	
	function _create_category_label(label){
		label = label.replace("(${count})",'<span class="count">(0)</span>');
		label = label.replace("${count}",'<span class="count">0</span>');
		return  label;
	}
	
	function _create_category_panel(){
		var html = [];
		
		html.push('<div class="event-section">');
		html.push('<div class="bd">');
		html.push('</div>');
		html.push('</div>');

		return html.join('');
	}


	
	function _create_event(event){
		var html = [];
		
		function humanize(name) {
		  return name.substring(0,1).toUpperCase() + 
		    name.substring(1).replace(/-/g, " ");
		}
		
		function render_variable(html, name, value) {
			html.push('<div class="yui-g duplicate">');
			html.push('<div class="yui-u first">');
			html.push('<p class="vendor">' + humanize(name) + '</p>');
			html.push('</div>');
			html.push('<div class="yui-u">');
			html.push('<p class="value">' + value + '</p>');
			html.push('</div>');
			html.push('</div>');
		}
		
		var event_name = humanize(event.variable || event.type);
		
		html.push('<div id="' + (event.id || DOM.generateId()) + '" class="event-item">');
		html.push('<div class="bd">');
		html.push('<div class="yui-g help-text" title="' + (event.help_text || "No help text available") + '">');
		html.push('<div class="yui-u first">');
		html.push('<p class="variable">' + event_name + '</p>');
		if (!event.warning && event.vendor){
			html.push('<p class="vendor">' + event.vendor + '</p>');
		}
		html.push('</div>');
		
		if (typeof event.value != "undefined"){
			html.push('<div class="yui-u">');
			html.push('<p class="value">' + event.value + '</p>');
			html.push('</div>');
		}
		
		
		html.push('</div>');

		if (event.data){
			for (var i in event.data){
				var w = event.data[i];
				
				// filter some fields
				if (event.type === 'duplicate-value-error' && i === 'fields') {
					for (var field_name in w) {
						var value = w[field_name]['found-values'] 
						  + " (was " + w[field_name]['previous-value'] + ")";
						render_variable(html, field_name, value);
					}
					continue;
				}
				if (typeof w !== 'string' && typeof w !== 'number') {
					continue;
				}
				if (/-visibility$/.test(i) && (w === '*' || w === '')) {
					continue;
				}
				
				render_variable(html, i, w);
                  
 			}
		}

		if (event.warning){
			html.push('<div class="yui-g">');
			html.push('<ul class="message">');
			html.push('<li>Different values are being set:</li>');
			html.push('</ul>');
			html.push('</div> ');
			
			for (var i in event.warnings){
				var w = event.warnings[i];
				
 				html.push('<div class="yui-g duplicate">');
 				html.push('<div class="yui-u first">');
 				html.push('<p class="vendor">' + i + '</p>');
 				html.push('</div>');
 				html.push('<div class="yui-u">');
 				html.push('<p class="value">' + w + '</p>');
 				html.push('</div>');
 				html.push('</div>');
                  
 			}
		}	
		
//		if (event.timestamp){
// 				html.push('<div class="yui-g">');
// 				html.push('<div class="yui-u first">');
// 				html.push('<p>' + "Timestamp" + '</p>');
// 				html.push('</div>');
// 				html.push('<div class="yui-u">');
// 				html.push('<p class="value">' + event.timestamp + '</p>');
// 				html.push('</div>');
// 				html.push('</div>');
//		}

		html.push('</div>');
        html.push('<div class="yui-g">');      
        html.push('<hr class="event-separator" />');      
        html.push('</div>');      
        html.push('</div>');      
        html.push(' </div>');      

		return html.join('');
	}

	function _increment_event_count(panel){
	    var count = DOM.getElementsByClassName('count', 'span', panel);
		if (count.length){
			var value = count[0].innerHTML;
			if (value.charAt(0) == '('){
				value = parseInt(value.substr(1));
				value = "(" + (value+1) + ")";
			}
			else {
				value = parseInt(value) + 1;
			}
			
			count[0].innerHTML = value;
		}
	}
	

	
	jshub.Inspector = new Inspector;
	jshub.Inspector.render("state1");
	jshub.Inspector.init();

	
	
})();

