




this.jsHub = this.jsHub || {};

/**
 * Assuming we only want one of these guys in the page...
 * It must be initialised somehow - we can provide an init function to be called explicitly
 * or expect a struture with a known name to exist - eg id = jshub-inspector OR create the whole
 * thing here within the component - OR create on demand, say when a button is clicked in the
 * page ?
 *
 */
(function() {

  var DOM = YAHOO.util.Dom, jsHub = this.jsHub;
  
  // use this list for now - allow it to be configured through options later
  var default_categories = {
    "tagging-issues": {
      label: "Tag status ${count}"
    },
    "page": {
      label: "Page events ${count}"
    },
    "user-interactions": {
      label: "Ecommerce events ${count}"
    },
    "data-sources": {
      label: "Data sources ${count}"
    },
    "inline-content-updates": {
      label: "Inline content updates ${count}"
    }
  };
  
  
  // eventually we'll build this dyynamically from a simple list of types in above categories collection
  var event_type_mappings = {
    "data-capture-start": "page",
    "page-view": "page",
    "authentication": "user-interactions",
    "product-view": "user-interactions",
    "product-purchase": "user-interactions",
    "cart-add": "user-interactions",
    "cart-remove": "user-interactions",
    "cart-update": "user-interactions",
    "duplicate-value-warning": "tagging-issues"
  };
  
  var events = [];
  
  var yui_events = {
    "page": [],
    "user-interactions": [],
    "tagging-issues": [],
    "data-sources": []
  }
  
  function Inspector(options) {
  
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
     * to correctly resize the Inspector on display state change, we need to know
     * when the user has resized it...
     */
    this._manually_sized = false;
    
    /**
     * likewise, to correctly reposition the Inspector on display state change or scroll,
     * we need to know when the user has moved it...
     */
    this._manually_positioned = false;
    
    /**
     * listen out for Hub events
     */
    var self = this;
    if (window.ETL) {
      ETL.bind("*", "inspector", function(a, b) {
        self.on_hub_event(a, b)
      });
      this.success_state = 'success';
    }
    
  };
  
  Inspector.prototype.render = function(display_state) {
  
    var div = document.getElementById("jshub-inspector-container");
    if (!div) {
      div = document.body.appendChild(document.createElement("div"));
      div.id = "jshub-inspector-container";
      div.className = "yui-cssreset yui-cssfonts yui-cssgrids yui-cssbase jshub inspector yui-skin-sam example-ui";
      div.style.position = "absolute";
      div.style.height = "0px";
      div.style.width = "0px";
      div.style.border = "none";
    } else {
      div.innerHTML = "";
    }
    
    var self = this;
    
    var panel = new YAHOO.widget.Panel("jshub_inspector", {
      width: "95px",
      draggable: true,
      close: false,
      autofillheight: "body",
      constraintoviewport: true,
      underlay: "shadow"
    });
    
    panel.setHeader(_create_header());
    panel.setBody(_create_body());
    panel.setFooter(_create_footer());
    panel.render(div);
    this.yuipanel = panel;
    
    panel.subscribe("drag", function(name, evt) {
      if (evt[0] == "endDrag") {
        self._manually_positioned = true;
        self._current_x = evt[1][0].clientX;
        self._current_y = evt[1][0].clientY;
      }
    });
    
    var yui_container = document.getElementById("jshub_inspector_c");
    yui_container.style.position = "fixed";
    var underlay = DOM.getElementsByClassName("underlay", "div", yui_container);
    
    if (underlay.length) {
      this.shadow = underlay[0];
      this.shadow.className += " jshub-shadow";
      
      var shadow_right = this.shadow.appendChild(document.createElement("div"));
      shadow_right.className = "shadow-right";
      var shadow_corner = this.shadow.appendChild(document.createElement("div"));
      shadow_corner.className = "shadow-corner";
      var shadow_bottom = this.shadow.appendChild(document.createElement("div"));
      shadow_bottom.className = "shadow-bottom";
      
      
    }
    
    // Set the state before we build all of the internals, as we need to collect
    // accurate offset dimensions as we build
    this.set_success_state(this.success_state);
    
    //TODO make the initial state a configuration option
    this.set_display_state(display_state || "state3");
    
    // init the accordion inside the panel body
    this.event_list = new YAHOO.widget.AccordionView("event-list", {
      width: '100%',
      collapsible: false,
      animate: false
    });
    
    this.event_list.subscribe("afterPanelOpen", this.on_panel_expand, null, this);
    
    // Make the panel resizable and handle events and repainting ref: http://developer.yahoo.com/yui/examples/container/panel-resize.html
    // TODO account for open/closed accordion in recalculating the body height
    var resizer = new YAHOO.util.Resize('jshub_inspector', {
      handles: ['br'],
      autoRatio: false,
      minWidth: 265,
      minHeight: 290,
      status: false
    });
    
    resizer.on("startResize", this.prepare_to_resize, null, this);
    resizer.on("resize", this.set_height, null, this);
    
    this.resizer = resizer;
    
    var categories = default_categories;
    for (var name in categories) {
      this.add_category(name, categories[name].label, categories[name]);
    }
    
    this.add_event = _post_render_add_event;
    
    for (var i in yui_events) {
      var panel = this.panels[i];
      var section_container = DOM.getElementsByClassName("event-section", "div", panel);
      
      for (var ii in yui_events[i]) {
        yui_events[i][ii].render(section_container[0]);
        _increment_event_count(panel);
      }
    }
    
    // initialize events
    for (var i in events) {
      this.add_event(event_type_mappings[events[i].type], events[i]);
    }
    
    var inspector_div = document.getElementById("jshub_inspector");
    
    var launcher = DOM.getElementsByClassName("launcher", "ul", inspector_div);
    YAHOO.util.Event.addListener(launcher, "click", function() {
      self.set_display_state("state2")
    });
    
    var button_large_container = DOM.getElementsByClassName("buttons large", "div", inspector_div);
    var button_large = DOM.getElementsByClassName("button events", "a", button_large_container[0]);
    YAHOO.util.Event.addListener(button_large, "click", function(e) {
      e.preventDefault();
      self.set_display_state("state3");
    });
    
    var button_small_container = DOM.getElementsByClassName("buttons small", "div", inspector_div);
    var button_small = DOM.getElementsByClassName("button", "a", button_small_container[0]);
    YAHOO.util.Event.addListener(button_small, "click", function(e) {
      e.preventDefault();
      self.set_display_state("state2");
    });
    
    var container_close = DOM.getElementsByClassName("container-close", "a", inspector_div);
    YAHOO.util.Event.addListener(container_close, "click", function(e) {
      e.preventDefault();
      self.set_display_state("state1");
    });
    
    // TODO this one needs a browser-specific solution - this will do the job for FF/Safari
    //YAHOO.util.Event.addListener(window, "scroll", function(evt){self.on_scroll(evt);});
    
    this.rendered = true;
    
    // start invisible
    this.hide();
    
    return this;
    
  }
  /**
   * Initialisation routines
   * @param {Object} container_id
   */
  Inspector.prototype.init = function(container_id) {
    var self = this;
    
    // initialise jshub tag status 
    if (window.ETL) {
      self.initDataSources();
      var jshubURL = $("script[src*=jshub.js]").attr('src');
      ETL.logger.log("Inspector: loading tag source from " + jshubURL);
      $.get(jshubURL, function(jshubTagSrc) {
        var hashcode = SHA1(jshubTagSrc);
		var configuratorURL = (jsHub.GeneratedBy || 'http://gromit.etl.office/akita-on-rails/tag_configurations/') 
		  + '/find_by_sha1/' + hashcode + '.js?callback=?';
        $.getJSON(configuratorURL, function(data) {
          console.log('Data from server', data);
          self.initRevisionStatus(data);
        });
      });
    }
  };
  
  
  /**
   *
   */
  Inspector.prototype.prepare_to_resize = function() {
  
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
    } else {
      this.resizer.set("maxWidth", null);
      this.resizer.set("maxHeight", null);
    }
    
    this._manually_resized = true;
  };
  
  Inspector.prototype.on_panel_expand = function(message) {
    _set_height.call(this, message.panel);
  }
  
  Inspector.prototype.minimum_height = function() {
    return this._static_height + this._min_list_item_height + this._collapsed_event_list_height;
  }
  
  Inspector.prototype.set_height = function(args) {
    if (args) {
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
  function _set_height(selected_item) {
  
    if (!selected_item) {
      var panels = this.event_list.getPanels();
      for (var i = 0; i < panels.length; i++) {
        if (DOM.hasClass(panels[i].firstChild, this.event_list.CLASSES.ACTIVE)) {
          selected_item = panels[i];
          break;
        }
      }
    }
    
    if (!selected_item) {
      return;
    }
    var preferred_panel_height = this._preferred_list_item_height;
    var default_inspector_height = this.default_expanded_height;
    var min_panel_size = this._min_list_item_height;
    
    //TODO make this a bit more robust...
    var content = selected_item.childNodes[1];
    
    var inner_element = this.yuipanel.innerElement;
    var inspector_height = inner_element.clientHeight;
    
    if (this._manually_resized == false) {
    
      var max_inspector_size = this._collapsed_event_list_height + this._static_height + preferred_panel_height;
      var preferred_height = Math.max(default_inspector_height, max_inspector_size);
      
      if (inspector_height > preferred_height) {
        var diff = inspector_height - preferred_height;
        var current_height = content.offsetHeight;
        var new_height = current_height - diff;
        content.style.height = new_height + "px";
      }
    } else {
      var available_height = inspector_height - this._static_height - this._collapsed_event_list_height;
      var content_height = content.offsetHeight;
      var actual_content = content.getElementsByTagName("div");
      if (actual_content.length) {
        var full_content_height = actual_content[0].offsetHeight;
        if (content_height > available_height) {
          if (available_height < min_panel_size) {
            // we have to grow the inspector - this won't normally happen unless we really add a lot of categories
            var new_inspector_height = inspector_height + (min_panel_size - available_height + 10);
            this.yuipanel.cfg.setProperty("height", new_inspector_height + "px");
          } else {
            content.style.height = available_height + "px";
          }
        } else if (full_content_height > content_height) {
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
  Inspector.prototype.add_category = function(category_id, label, index) {
  
    this.event_list.addPanel({
      label: _create_category_label(label),
      content: _create_category_panel()
    });
    
    var panels = this.event_list.getPanels();
    this.panels[category_id] = panels[panels.length - 1];
    
    //if (!this._category_item_height){
    //	this._category_item_height = this.panels[category_id].offsetHeight;
    //}		
    
    if (this._category_item_height) {
      this._collapsed_event_list_height += this._category_item_height;
    }
    
    // TODO - _set_height if this is being added at runtime
  };
  
  
  Inspector.prototype.on_hub_event = function(event) {
    if (event_type_mappings[event.type]) {
      this.add_event(event_type_mappings[event.type], event)
    }
  };
  
  /**
   * Until the inspector is rendered, just store the captured events.
   * @param {Object} category_id
   * @param {Object} event
   */
  Inspector.prototype.add_event = function(category_id, event) {
    events.push(event);
  }
  
  /**
   * Add an event to the appropriate list
   * @param {Object} category_name
   * @param {Object} event
   */
  function _post_render_add_event(category_id, event) {
    var panel = this.panels[category_id];
    
    var content = panel.childNodes[1];
    content = content.childNodes[0].childNodes[0];
    
    if (content.className == "bd") {
      content.innerHTML = content.innerHTML + _create_event(event);
    }
    
    _increment_event_count(panel);
    _set_height.call(this);
  }
  
  /**
   * Expand one of the Accordion items
   * @param {Object} category_name
   */
  Inspector.prototype.expandCategory = function(category_name) {
    console.log("expand Category " + category_name);
  };
  
  /**
   * Select a particular event - opening the containing Accordion item if necessary, and scrolling into view
   * @param {Object} event_id
   */
  Inspector.prototype.selectEvent = function(event_id) {
    console.log("selectEvent " + event_id);
  };
  
  //TODO remove duplication between these next two
  Inspector.prototype.set_success_state = function(state) {
  
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
    function setMessage(text) {
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
  
  Inspector.prototype.get_display_state = function(state) {
    return this._display_state;
  };
  
  Inspector.prototype.set_display_state = function(state) {
    // update the maximised example
    if (state == this._display_state) {
      return;
    }
    
    var inspectorBody = document.getElementById('jshub_inspector');
    // clear the existing states
    DOM.removeClass(inspectorBody, 'state1');
    DOM.removeClass(inspectorBody, 'state2');
    DOM.removeClass(inspectorBody, 'state3');
    
    // add the state class to the body of the inspector for contextual CSS switching
    DOM.addClass(inspectorBody, state);
    
    var previous_state = this._display_state;
    this._display_state = state;
    
    var panel_body = this.yuipanel.body;
    if (this._manually_resized) {
      if (state == "state1") {
        this.yuipanel.cfg.setProperty("height", 30 + "px");
        panel_body.style.height = "auto";
      } else if (state == "state2") {
        this.yuipanel.cfg.setProperty("height", 135 + "px");
        panel_body.style.height = "auto";
      } else {
        //debugger;
        this.set_height();
        //debugger;
        // couldn't find a nicer way to keep the resizer in sync...
        this.resizer.unlock();
        var element = this.yuipanel.innerElement;
        this.resizer.resize(null, element.offsetHeight, element.offsetWidth, 0, 0, true, true);
      }
    }
    
    if (state == "state1") {
      this.yuipanel.cfg.setProperty("width", "95px");
    } else if (previous_state == "state1") {
      this.yuipanel.cfg.setProperty("width", "265px");
    }
    
    if (this.shadow) {
      if (state == "state1") {
        this.shadow.style.display = "none";
      } else {
        this.shadow.style.display = "";
      }
    }
    
    // Positioning
    // Can't position until both dimensions have been set
    if (state == "state1") {
      this.set_position("br");
    } else if (previous_state == "state1") {
      if (this._manually_positioned) {
        this.set_position();
      } else {
        this.set_position("tr");
      }
    }
    
    if (state == "state3" && typeof this._category_item_height == "undefined") {
      var inspector_div = document.getElementById("jshub_inspector");
      this._static_height = inspector_div.offsetHeight - this._min_list_item_height;
      var panels = this.event_list.getPanels();
      this._category_item_height = panels[0].offsetHeight;
      this._collapsed_event_list_height = this._category_item_height * panels.length;
    }
    
    if (this.resizer) {
      if (state == "state3") {
        this.resizer.unlock();
      } else {
        this.resizer.lock();
      }
    }

    // set viewport constraints for each state
    if (state === "state1"){
      this.yuipanel.cfg.setProperty("constraintoviewport", true);
    }
    if (state === "state2"){
      this.yuipanel.cfg.setProperty("constraintoviewport", true);
    }
    if (state === "state3"){
      this.yuipanel.cfg.setProperty("constraintoviewport", false);
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
              "This could mean that it has been altered since it was generated.");
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
      this.getWarnings = function() {
        var html, event, events = [];
        if (data.warnings.pending_revisions) {
          var pending = data.warnings.pending_revisions;
          html = header("Tag out of date");
          html += subheader("warning", "Tag is " + pending + " version" +
          (pending > 1 ? "s" : "") +
          " behind most recent revision");
          html += bodyMessage("You may need to update to the latest version.");
          event = createEvent(html);
          events.push(event);
          if (self.success_state == 'success') {
            self.set_success_state('warning');
          }
        }
        if (data.warnings.tag_type) {
          html = header("Debug version detected");
          html += subheader("info", "Using the debug version of the jsHub code");
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
        html += variable("Name", '<a href="' + data.info.url + '" title="Click to edit">' + data.info.name + '</a>');
        html += variable("Revision", data.info.version);
        html += variable("Updated", data.info.updated + ' ago');
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
        //console.log('New Event added to Panel' + panelNumber);
      }
    }
    
    if (this.rendered) {
      // just copied from render for now...tidy up after demo
      for (var i in yui_events) {
        var panel = this.panels[i];
        var section_container = DOM.getElementsByClassName("event-section", "div", panel);
        
        for (var ii in yui_events[i]) {
          yui_events[i][ii].render(section_container[0]);
          _increment_event_count(panel);
        }
      }
    }
    
  };
  
  /*
   * Display a plug-in entry in the datasource panel.
   * Microformat plug-ins are merged into a single entry with alt layout.
   */
  Inspector.prototype.initDataSources = function() {
    var plugins = ETL.getPluginInfo(), plugin, event;
    
    console.info("Datasources: %o", plugins)
    
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
    
    function humanize(name) {
      // microformats use 'n' for name e.g. product name
	  if (name === 'n') { name = 'name'; }
      return name.substring(0, 1).toUpperCase() + name.substring(1).replace(/-/g, " ");
    }
    var header = function(text) {
      return '<div class="yui-g help-text event-header" title="Data source">' + text + '</div>'
    };
    var subheader = function(type, text) {
      return '<div class="message ' + type + '"><ul><li>' + text + '</li></ul></div>';
    };
    var variable = function(name, value) {
      // using 1/3rd - 2/3rd YUI grid    
      return '<div class="yui-gd">' +
      '  <div class="yui-u first">' +
      '    <p class="variable">' + name + ':</p>' +
      '  </div>' +
      '  <div class="yui-u">' +
      '    <p class="value">' + value + '</p>' +
      '  </div>' +
      '</div>';
    };
    var microformatEntry = function(type, url) {
      // using 2/3rd - 1/3rd YUI grid
      return '<div class="yui-gc microformat">' +
      '  <div class="yui-u first">' +
      '    <p class="type">' + type + '</p>' +
      '  </div>' +
      '  <div class="yui-u">' +
      '    <p class="url"><a href="' + url + '" title="Hosted at Microformats.org">reference</a></p>' +
      '  </div>' +
      '</div>';
    };
    
    // merge microformats into a single entry (hack: based on their name)
    var html = [];
    html.push(header("Microformats Parser Plugin"));
    html.push(subheader('info', "Data capture plugin"));
    for (var i = 0; i < plugins.length; i++) {
      plugin = plugins[i];
      if (plugin.name.match("Microformat")) {
        // select the first word in the name as the type
        type = plugin.name.match(/\w+/)
        html.push(microformatEntry(type, plugin.vendor));
      }
    }
    var event = createEvent(html.join(""));
    yui_events["data-sources"].push(event);
    html = [];
    
    // render non-microformat plug-ins (hack: based on their name)
    for (var i = 0; i < plugins.length; i++) {
      plugin = plugins[i];
      if (!plugin.name.match("Microformat")) {
        var html = [];
        html.push(header(plugin.name));
        html.push(subheader('info', humanize(plugin.type) + " plugin"));
        html.push(variable("Vendor", plugin.vendor));
        html.push(variable("Author", plugin.author));
        html.push(variable("Version", plugin.version));
        var event = createEvent(html.join(""));
        yui_events["data-sources"].push(event);
      }
    }
    
    if (this.rendered) {
      // just copied from render for now...tidy up after demo
      for (var i in yui_events) {
        var panel = this.panels[i];
        var section_container = DOM.getElementsByClassName("event-section", "div", panel);
        
        for (var ii in yui_events[i]) {
          yui_events[i][ii].render(section_container[0]);
        }
      }
    }
  };
  
  Inspector.prototype.show = function() {
    var div = document.getElementById("jshub-inspector-container");
    div.style.display = "";
  };
  
  Inspector.prototype.hide = function() {
    var div = document.getElementById("jshub-inspector-container");
    div.style.display = "none";
  };
  
  
  /**
   * Set the position of the Inspector. Either position to fixed locations on the viewport
   * (top-right, bottom-right) or move just enough to keep within viewport when scrolling
   * or restore last position the user chose.
   *
   * @param {Object} position
   */
  Inspector.prototype.set_position = function(position) {
  
    var dimensions = _get_available_space(), left = 0, top = 0;
    
    var element = this.yuipanel.innerElement;
    
    var width = element.offsetWidth;
    var height = element.offsetHeight;
    
    if (position == "br") {
      left = dimensions.width - width - 20;
      top = dimensions.height + dimensions.scrollTop - height - 10;
    } else if (position == "tr") {
      left = dimensions.width - width - 20;
      top = +dimensions.scrollTop;
    } else if (position == "top") {
      left = null;
      top = +dimensions.scrollTop;
    } else if (this._manually_positioned) {
      left = this._current_x;
      top = this._current_y;
      
    }
    
    this.yuipanel.cfg.setProperty("xy", [left, top]);
    
  };
  
  Inspector.prototype.on_scroll = function(evt) {
    if (this._display_state == "state1") {
      this.set_position("br");
    } else if (this._manually_positioned) {
      this.set_position("top");
    } else {
      this.set_position("tr");
    }
  };
  
  
  function _create_header() {
    return '<span class="title">Activity Inspector</span><a class="container-close" href="#">Close</a>';
  }
  
  function _create_body() {
    return _create_status_small() +
    _create_status_large() +
    _create_search() +
    _create_event_list() +
    _create_footer_buttons("Hide Events") +
    _create_launcher();
  }
  
  function _create_status_large() {
    var html = [];
    html.push('<div class="yui-g status large">');
    html.push('<div class="yui-u text">');
    html.push('<p class="self">jsHub is</p>');
    html.push('<p class="message">Installed &amp; active</p>');
    html.push('</div>');
    html.push('</div>');
    return html.join("");
  }
  
  function _create_status_small() {
    return '<div class="yui-g status small">' +
    '<div class="yui-u text">' +
    '<p class="message">Installed &amp; active</p>' +
    '</div>' +
    '</div>';
  }
  
  function _create_footer_buttons() {
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
  
  function _create_footer() {
    return '<div class="version">Inspector v0.1 r3031</div><div class="logo"></div>';
  }
  
  function _create_launcher() {
    return '<ul class="launcher"><li class="status">&nbsp;</li></ul>';
  }
  
  function _create_search() {
    return '<div class="yui-gf search"><div class="yui-u first"><label for="inspector_search" class="search">Find</label></div><div class="yui-u"><input id="inspector_search" type="text" class="search" disabled="disabled" /></div></div>';
  }
  
  
  function _create_event_list() {
    return '<ul id="event-list"></ul>';
  }
  
  function _create_category_label(label) {
    label = label.replace("(${count})", '<span class="count">(0)</span>');
    label = label.replace("${count}", '<span class="count">0</span>');
    return label;
  }
  
  function _create_category_panel() {
    var html = [];
    
    html.push('<div class="event-section">');
    html.push('<div class="bd">');
    html.push('</div>');
    html.push('</div>');
    
    return html.join('');
  }
  
  
  
  function _create_event(event) {
    var html = [];
    
    function humanize(name) {
	  // microformats use 'n' for name e.g. product name
	  if (name === 'n') { name = 'name'; }
      return name.substring(0, 1).toUpperCase() +
        name.substring(1).replace(/-/g, " ");
    }
    
    function render_variable(html, name, value) {
      html.push('<div class="yui-gd duplicate">');
      html.push('<div class="yui-u first">');
      html.push('<p class="vendor">' + humanize(name) + ':</p>');
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
    html.push('<p class="variable">' + event_name + '</p>');
    html.push('</div>');

    if (event.type === 'duplicate-value-warning') {
      html.push('<ul class="message warning"><li>Conflicting data in the markup</li></ul>');
	  jsHub.Inspector.set_success_state('warning');
    }
    
    if (event.data) {
      for (var label in event.data) {
      
        var w = event.data[label];
        
        // filter some fields
        if (event.type === 'duplicate-value-warning' && label === 'fields') {
          for (var field_name in w) {
            render_variable(html, "Duplicate field", humanize(field_name));
            var value = w[field_name].found;
            render_variable(html, "Value used", value);
            var previous = w[field_name].previous.value +
            " (found by " + w[field_name].previous.source + ")";
            render_variable(html, "Other values", previous);
          }
          continue;
        }
        if (typeof w !== 'string' && typeof w !== 'number') {
          continue;
        }
        if (/-visibility$/.test(label)) {
          if (w === '*' || w === '') {
            continue;
          } else {
            label = '<i>(visibility)</i>';
          }
        }
        if (/-source$/.test(label)) {
          continue;
        }
        if (event.type === 'page-view' && /^page-([^name])/.test(label)) {
		  // strip long variable names on the page view event
          label = label.substring(5);
        }
        
        render_variable(html, label, w);
        if (event.data[i + '-source']) {
          html.push('<div class="yui-gd"><p class="vendor source">(from ' +
            event.data[i + '-source'] +
            ')</p></div>');
        }
        
      }
    }
    
    if (event.warning) {
      html.push('<div class="yui-g">');
      html.push('<ul class="message">');
      html.push('<li>Different values are being set:</li>');
      html.push('</ul>');
      html.push('</div> ');
      
      for (var i in event.warnings) {
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
  
  function _increment_event_count(panel) {
    var count = DOM.getElementsByClassName('count', 'span', panel);
    if (count.length) {
      var value = count[0].innerHTML;
      if (value.charAt(0) == '(') {
        value = parseInt(value.substr(1));
        value = "(" + (value + 1) + ")";
      } else {
        value = parseInt(value) + 1;
      }
      
      count[0].innerHTML = value;
    }
  }
  
  
  
  jsHub.Inspector = new Inspector;
  jsHub.Inspector.render("state1");
  jsHub.Inspector.init();
  
  
  // borrowed from leon...
  function _get_available_space() {
  
    if (typeof(window.innerHeight) == 'number') {
      var maxW = window.innerWidth;
      var maxH = window.innerHeight;
    } else if (document.documentElement && document.documentElement.clientHeight) {
      var maxW = parseInt(document.documentElement.clientWidth);
      var maxH = parseInt(document.documentElement.clientHeight);
    } else if (document.body && document.body.clientHeight) {
      var maxW = parseInt(document.body.clientWidth);
      var maxH = parseInt(document.body.clientHeight);
    } else { // we're screwed
      var maxW = 800;
      var maxH = 600;
    }
    
    //		console.log("scrollTop: " + document.body.scrollTop);
    
    if (document.documentElement) {
      var scrollTop = document.documentElement.scrollTop;
    } else {
      var scrollTop = document.body.scrollTop;
    }
    
    var dimensions = {
      top: 0,
      left: 0,
      width: maxW,
      height: maxH,
      scrollTop: scrollTop
    };
    
    if (typeof dimension != "undefined") {
      return dimensions[dimension];
    }
    
    return dimensions;
  }
  
  
  
})();

