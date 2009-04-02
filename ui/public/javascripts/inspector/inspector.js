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
		"page" 					 : {label :"Page (${count})"},
		"user-interactions" 	 : {label : "User Interactions (${count})"},
		"tagging-issues"		 : {label : "${count} Tagging Issues Detected"},
		"data-sources"			 : {label : "Data Sources (${count})"},
		"inline-content-updates" : {label : "Inline content updates (${count})"}
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
	
	function Inspector(options){
		
		// I'll create the properties as instance properties for now - isn't as secure as storing them
		// as locals within the closure, but we can easily change that.  
		/**
		 * 
		 */
		this.static_height = 0;
		
		/**
		 * Default 'sticking' size when we expand a category - so the inspector may be smaller than this
		 * if the selected category isn't very tall, but won't grow beyond this unless resized but the user.
		 */
		this.default_expanded = 450;
		
		/**
		 * We want to at least be able to see on whole event.
		 */
		this.min_category_height = 100;
		
		/**
		 * the category panels
		 */
		this.panels = {};
		
	};
	
	Inspector.prototype.render = function(container_id){
		
		if (container_id){
			
		}
		else {
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
			        close: true,
			        autofillheight: "body",
			        constraintoviewport: true
			  });
			  
			  panel.setHeader(_create_header());
			  panel.setBody(_create_body());
			  panel.setFooter("jsHub Activity Inspector v1.123");
			  panel.render(div);
			  
			  
			    // init the accordion inside the panel body
			  this.event_list = new YAHOO.widget.AccordionView("event-list", {
			        width: '100%', 
			        collapsible: true,
			        animate: false
			      }
			  );
			  
			  // Make the panel resizable and handle events and repainting ref: http://developer.yahoo.com/yui/examples/container/panel-resize.html
			  // TODO account for open/closed accordion in recalculating the body height
			  var resizer = new YAHOO.util.Resize('jshub_inspector', {
			    handles: ['br'],
			    autoRatio: false,
			    minWidth: 225,
			    minHeight: 290,
			    status: false
			  });
			  
			resizer.on("resize", function(args) {
				var panelHeight = args.height;
				this.cfg.setProperty("height", panelHeight + "px");
			
				//manage_height();
			
				}, panel, true);			  


			var categories = default_categories;
		
			for(var name in categories){
				this.add_category(name, categories[name].label,categories[name]);
			}
			
			// initialize events
			for (var i in events){
				this.add_event(events[i].category,events[i]);
			}

			// add additional css classes
			this.set_state("state3");
			  
		}
		
	}
    /**
     * Initialisation routines
     * @param {Object} container_id
     */
    Inspector.prototype.init = function(container_id) {
	  var self = this, jshubURL = $("script[src~=jshub]").attr('src');
	  $.get(jshubURL, function(jshubTagSrc) {
        hashcode = SHA1(jshubTagSrc);
        // use a locally cached copy
		// $.getJSON('http://gromit.etl.office/akita-on-rails/tag_configurations/find_by_sha1/' + hashcode + '.js?callback=?', function(data) {
        $.getJSON('javascripts/jshub/e090e895a3193594e933b9e5782e72eb29f6a3c1.js', function(data) {
          console.log('Data from server', data);
		  self.initRevisionStatus(data);
		});
      });
    };
	
	
	/**
	 * 
	 * @param {string} category_name - what are we going to call it - refer to it as
	 * @param {number} [index] where to insert - default to end of existing items
	 */
	Inspector.prototype.add_category = function(category_id, label,index){
		
		var panel = this.event_list.addPanel({label: _create_category_label(label), content: _create_category_panel()});		

		var panels = this.event_list.getPanels();
		
		this.panels[category_id] = panels[panels.length-1];
	};
	
	/**
	 * Add an event to the appropriate list
	 * @param {Object} category_name
	 * @param {Object} event
	 */
	Inspector.prototype.add_event = function(category_id,event){
		
		var panel = this.panels[category_id];
		
		var content = panel.childNodes[1];
		content = content.childNodes[0].childNodes[0];

		if (content.className == "bd"){
			content.innerHTML = content.innerHTML + _create_event(event);			
		}
		
	};
	
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
	
	Inspector.prototype.set_state = function(state){
		
		var container = document.getElementById("jshub_inspector"), match;
		var class_name = container.className;
		if (match = class_name.match(/(state\d)/)){
			class_name = class_name.replace(match[1],state)
		}
		else {
			class_name += " " + state;
		}
		container.className = class_name;		
	};


	/**
	 * Initialise the tag revision status warnings
	 * @param {Object} data the response from the configutor's find_by_sha1 lookup
	 */
    Inspector.prototype.initRevisionStatus = function(data) {
      var panelNumber = 2;
      var Dom = YAHOO.util.Dom;
      
      var StatusRenderer = function(data) {
        var data = data;
        
        var header = function(text) {
          return '<div class="event-header">' + text + '</div>'
        };
        var subheader = function(type, text) {
          return '<div class="message ' + type + '"><ul><li>' + text + '</li></ul></div>';
        };
        var variable = function(name, value) {
          return '<div class="yui-g">' +
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
          '<div class="yui-g help-text" title="Tag status report">' +
          text +
          '</div>' +
          '<div class="yui-g"><hr class="event-separator" /></div>' +
          '</div></div>';
        };
        var createEvent = function(html) {
          var eventId = Dom.generateId();
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
            error = errors[i];
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
                break;
			  // other errors not yet implemented
            }
          }
		  return events;
		}
        
		/**
		 * Retrieve all 'warning' level messages from the status update
		 */
        this.getWarnings = function() {
          var html, event, events = [];
          if (data.warnings.pending_revisions) {
            var pending = data.warnings.pending_revisions;
            html = header("Tag out of date");
            html += subheader("warning", "Tag is " + pending + " version" 
			  + (pending > 1 ? "s" : "") + " behind most recent revision");
            html += bodyMessage("You may need to update to the latest version.");
            event = createEvent(html);
            events.push(event);
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
		  html += variable("Configuration URL", data.info.url);
		  html += variable("Name", data.info.name);
		  html += variable("Site", data.info.site);
		  html += variable("Revision", data.info.version);
		  html += variable("Last updated", $.dateFromISO8601(data.info.updated));
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
          event.render('event-section-' + panelNumber);
          console.log('New Event added to Panel' + panelNumber);
          // TODO is an changeBodyEvent raised on the parent module when we add this one? This can trigger the Panel title count update
          var count = getNumberOfEventsByPanel(panelNumber);
          setPanelCount(panelNumber, count);
          console.log(count + ' Events now in Panel' + panelNumber);
        }
      }
    };
	
	function _create_header(){
		return '<span class="title">Activity Inspector</span><a class="container-minimise" href="#">Minimise</a>'; 
	}

	function _create_body(){
		return _create_status_small() 
		     + _create_search() 
			 + _create_event_list();
	}
	
	function _create_status_small(){

		return '<div class="yui-g status small">' +
	        		'<div class="yui-u first icon">Small Icon</div>' +
	        		'<div class="yui-u">' +
	          			'<p class="message">Installed &amp; active</p>' +
	        		'</div>' +
	    		'</div>';		
	}
	
	function _create_search(){
		return '<div class="yui-g">' +
          	      '<p>Find <input type="text" class="search" /></p>' +
      			'</div>';	
	}
	
	function _create_event_list(){
		return '<ul id="event-list"></ul>';
	}
	
	function _create_category_label(label){
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
		
		html.push('<div id="' + event.id + '" class="event-item">');
		html.push('<div class="bd">');
		html.push('<div class="yui-g help-text" title="No help text available">');
		html.push('<div class="yui-u first">');
		html.push('<p class="variable">' + event.variable + ':</p>');
		if (!event.warning){
			html.push('<p class="vendor">' + event.vendor + '</p>');
		}
		html.push('</div>');

		html.push('<div class="yui-u">');
		html.push('<p class="value">' + event.value + '</p>');
		html.push('</div>');
		html.push('</div>');

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
 				html.push('<p class="value">' + w[i] + '</p>');
 				html.push('</div>');
 				html.push('</div>');
                  
 			}
		}	


		html.push('</div>');
        html.push('<div class="yui-g">');      
        html.push('<hr class="event-separator" />');      
        html.push('</div>');      
        html.push('</div>');      
        html.push(' </div>');      

		return html.join('');
	}

	
	jshub.Inspector = new Inspector;
	jshub.Inspector.init();

	
	
})();

