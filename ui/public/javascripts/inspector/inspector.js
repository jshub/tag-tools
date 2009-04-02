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
	
	// Let's assume for now this is going to be a singleton...
	jshub.Inspector = new Inspector;
	
	function Inspector(){
		
	}
	
	Inspector.prototype.init = function(container_id){
		
	}
	
	/**
	 * 
	 * @param {string} category_name - what are we going to call it - refer to it as
	 * @param {number} [index] where to insert - default to end of existing items
	 */
	Inspector.prototype.addCategory = function(category_name,index){
		
	};
	
	/**
	 * Add an event to the appropriate list
	 * @param {Object} category_name
	 * @param {Object} event
	 */
	Inspector.prototype.addEvent = function(category_name,event){
		
	};
	
	/**
	 * Expand one of the Accordion items
	 * @param {Object} category_name
	 */
	Inspector.prototype.expandCategory = function(category_name){
		
	};
	
	/**
	 * Select a particular event - opening the containing Accordion item if necessary
	 * @param {Object} event_id
	 */
	Inspector.prototype.selectEvent = function(event_id){
		
	};

	
	
	
	
})();

