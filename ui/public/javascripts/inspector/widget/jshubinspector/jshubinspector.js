/*!
 *  jsHub open source tag
 *  Copyright (c) 2009 jsHub.org
 *  Authors: Liam Clancy, Fiann O'Hagan, Steve Heron
 */

(function(){

  // Wrap logging during development
  function log(){ 
    if (window.console && META.DEBUG === true) {
      console.log.apply(console, arguments); 
    }
  };

  /**
   * The jsHub Inspector provides a visible UI for the inspection of data and events 
   * collected by the jsHub core tag. See http://jshub.org/ for more details.
   * @module jshubinspector
   * @requires utilities container resize accordionview json2 sha1
   */
 
  // YUI Library shortcuts
  var Lang = YAHOO.lang
      Dom = YAHOO.util.Dom,
      Event = YAHOO.util.Event,
      CustomEvent = YAHOO.util.CustomEvent,
      Element = YAHOO.util.Element,
      Panel = YAHOO.widget.Panel,
      AccordionView = YAHOO.widget.AccordionView,
      Resize = YAHOO.util.Resize,
      UA = YAHOO.env.ua;   

  /**
  * Inspector is an implementation of Panel with custom rendering of data added 
  * to an Accordion from events fired by the jsHub.org core tag (and more).
  * @namespace YAHOO.JSHUB_ORG
  * @class Inspector
  * @extends YAHOO.widget.Panel
  * @constructor
  * @param {String} el The element ID representing the Inspector <em>OR</em>
  * @param {HTMLElement} el The element representing the Inspector
  * @param {Object} userConfig The configuration object literal containing 
  * the configuration that should be set for this Inspector. See configuration 
  * documentation for more details.  
  */
  var Inspector = function(id, oConfigs){
  
    // Widget constructor
    Inspector.superclass.constructor.call(this, id || Dom.generateId(), oConfigs);
  } 

  // Browser environment data
  /**
  * Constant representing the browser environment
  * @property BROWSER
  * @private
  * @final
  * @type Object
  */
  var BROWSER = {
        "viewport": [
           Dom.getViewportWidth(),
           Dom.getViewportHeight()
        ]
      }; 
  
  /**
  * Constant representing the Inspector's metadata properties
  * @property META
  * @private
  * @final
  * @type Object
  */   
  var META = {
        "NAME": 'jsHub.org Inspector',
        "VERSION": '2.0',
        "BUILD": '001',
        "DEBUG": true // enable debugging and logging
      };
 
  /**
  * Constant representing the name of the Inspector's YUI events
  * @property EVENT_TYPES
  * @private
  * @final
  * @type Object
  */
  var EVENT_TYPES = {
        "FOUND_CODE": "foundCode",
        "CHECKSUM_CODE": "checksumCode",
        "CHANGE_STATE": "changeState",
        "CHANGE_STATUS": "changeStatus"
      };
        
  /**
  * Constant representing the Inspector's YUI configuration properties
  * @property DEFAULT_CONFIG
  * @private
  * @final
  * @type Object
  */  
  var DEFAULT_CONFIG = {
        "STATE": {
          key: "state",
          value: 1,
          validator: Lang.isNumber
        },
        "STATUS": {
          key: "status",
          value: "info",
          validator: Lang.isString
        },
        "STRINGS" : {
          key: "strings",
          validator: Lang.isObject,
          value: {
            header_text: "Activity Inspector",
            footer_text: "Inspector v"+ META.VERSION +" r"+ META.BUILD,
            close: "Close"
          }
        }        
      };

  // Other properties
  
  /**
  * Constant holder for references to related/nested components, 
  * e.g. Content Modules, AccordionViews, Resizers, etc 
  * @property COMPONENTS
  * @private
  * @final
  * @type Object  
  */
  var COMPONENTS = {}
  

  /**
  * Constant representing the Inspector's AccordionView Panels
  * @property PANELS
  * @private
  * @final
  * @type Object
  */ 
  var PANELS = {
        "tagging-issues": {
          label: "Tag status",
          content: "<!-- ready to recieve data -->"
        },
        "page": {
          label: "Page events",
          content: "<!-- ready to recieve data -->"
        },
        "user-interactions": {
          label: "Ecommerce events",
          content: "<!-- ready to recieve data -->"
        },
        "data-sources": {
          label: "Data sources",
          content: "<!-- ready to recieve data -->"
        },
        "inline-content-updates": {
          label: "Inline content updates",
          content: "<!-- ready to recieve data -->"
        }
      };  

  /**
  * Constant representing the mapping of jsHub events to AccordionView Panels for display
  * @property PANEL_MAPPINGS
  * @private
  * @final
  * @type Object
  */ 
  var PANEL_MAPPINGS = {
        "data-capture-start": "page",
        "page-view": "page",
        "authentication": "user-interactions",
        "product-view": "user-interactions",
        "product-purchase": "user-interactions",
        "cart-add": "user-interactions",
        "cart-remove": "user-interactions",
        "cart-update": "user-interactions",
        "checkout": "user-interactions",
        "duplicate-value-warning": "tagging-issues"
      };
  
  /**
  * Constant representing the default ID used for an Inspector's 
  * wrapping container
  * @property YAHOO.JSHUB_ORG.Inspector.ID_CONTAINER
  * @static
  * @final
  * @type String
  */
  Inspector.ID_CONTAINER = "jshub_inspector_container";
  
  /**
  * Constant representing the prefix used for an Inspector's state CSS class
  * in combination with the DEFAULT_CONFIG.STATE property
  * @property Inspector.CSS_STATE_PREFIX
  * @static
  * @final
  * @type String
  */
  Inspector.CSS_STATE_PREFIX = "state";

  /**
  * Constant representing the default ID used for an Inspector's nested 
  * AccordionView instance
  * @property Inspector.ID_ACCORDION
  * @static
  * @final
  * @type String
  */
  Inspector.ID_ACCORDION = "event_list"

  // Private methods - pass 'me' to be able to access Inspector as 'this'

  /** 
  * find all the Accordion panel(s) content areas
  * This is dependent on the DOM structure of the Accordion staying as UL>LI>A+DIV
  * TODO: use CSS selectors and COMPONENTS.event_list.CLASSES.CONTENT
  * @method getAllAccordionPanelContent
  * @private
  */
  function getAllAccordionPanelContent() {
    var aPanels = COMPONENTS.event_list.getPanels();
    var aPanelContent = [];
    for (var i = 0; i < aPanels.length; i++) {
      eContent = Dom.getLastChild(aPanels[i]);
      aPanelContent.push(eContent);
    }
    // TODO: if only 1 element act like jQuery?
    return aPanelContent;
  };
  
  /** 
  * find the Accordion open/active panel(s) content area
  * This is dependent on the DOM structure of the Accordion staying as UL>LI>A+DIV
  * TODO: use CSS selectors and COMPONENTS.event_list.CLASSES.TOGGLE && CONTENT
  * @method getActiveAccordionPanelContent
  * @private
  */
  function getActiveAccordionPanelContent() {
    var aPanels = COMPONENTS.event_list.getPanels();
    var aPanelContent = [];
    for (var i = 0; i < aPanels.length; i++) {
      var eToggle = Dom.getFirstChild(aPanels[i]);
      if (Dom.hasClass(eToggle, COMPONENTS.event_list.CLASSES.ACTIVE)) {
        eContent = Dom.getLastChild(aPanels[i]);
        aPanelContent.push(eContent);
      }
    }
    // TODO: if only 1 element act like jQuery?
    return aPanelContent;
  };  

  /**
  * See if a jsHub core lib is present, bind to it and add a class to indicate the jsHub core state in the UI
  * @method jsHubIsPresent
  * @private
  */
  function jsHubIsPresent(me) {
    if (window.jsHub && window.jsHub.bind) {
      // jHub core lib is present
      Dom.addClass(me.body, 'success');
      // listen out for Hub events
      jsHub.bind("*", "inspector", function(a, b) {
        recievedJsHubEvent(a, b);
      });
      // notify that the jsHub core lib is available
      me.foundCodeEvent.fire(window.jsHub);
    } else {
      // jHub core lib is not present
      Dom.addClass(me.body, me.cfg.getProperty(DEFAULT_CONFIG.STATUS.key));
    }
  };

  function recievedJsHubEvent(a, b) {
    log('TODO: recievedJsHubEvent - Do something with an event, e.g. raise a CustomEvent');
    log("recievedJsHubEvent:  a: %o, b: %o, this: %o", a, b, this);    
  };
  
  // Private CustomEvent listeners, usage depends a bit on how subscribed:
  // 'this.subscribe' automatically receive 'type, args, me' parameters
  // 'object.on' receive only args parameters

  /**
  * "foundCode" event handler that creates a SHA1 hash for a src JS file and checks it against a Configurator.
  * @method srcChecksum
  * @private
  */
  function srcChecksum(type, args, me) {
    log('TODO: srcChecksum - Check the jsHub core src SHA1, using metadata properties in the CONFIG');
    log("srcChecksum:  type: %o, args: %o, me: %o, this: %o", type, args, me, this);
    this.checksumCodeEvent.fire(Inspector);
  };
  
  /**
  * "beforeRender" event handler that creates a context DIV element 
  * before rendering for context based CSS in YUI3.
  */
  function createCssContext(type, args, me) {
    var eContainerContext = Dom.get(Inspector.ID_CONTAINER);
    if (!eContainerContext) {
      // create the container div and add classes needed
      eContainerContext = new Element(document.createElement('div'));
      eContainerContext.set('id', Inspector.ID_CONTAINER);
      eContainerContext.addClass("yui-cssreset yui-cssfonts yui-cssgrids yui-cssbase jshub inspector yui-skin-sam");
      eContainerContext.appendTo(document.body);
      log('Made Inspector CSS context');      
    }      
  };

  /** 
  * "beforeRender" event handler that creates the title for an Inspector in the header
  */  
  function templateTitle(type, args, me) {
    var oStrings = this.cfg.getProperty("strings")
    this.setHeader('<span class="title">'+ oStrings.header_text +'</span>');
  }    
  /** 
  * "beforeRender" event handler that creates the version for an Inspector in the footer
  */ 
  function templateVersion(type, args, me) {
    var oStrings = this.cfg.getProperty("strings")
    this.setFooter('<div class="version">'+ oStrings.footer_text +'</div><div class="logo"></div>');
  }

  /** 
  * "render" event handler that creates the Accordion in an element in the the body of the Inspector 
  */  
  function createEventList(type, args, me) {
    // Check we haven't already added this
    if (COMPONENTS.event_list) {
      log('Accordion already created: %o', COMPONENTS.event_list);
      return false;
    }

    // Create placeholder for the AccordionView to be added to (state3)
    //this.setBody('<div id="'+ Inspector.ID_ACCORDION +'"></div>');
    var mEventlistModule = new YAHOO.widget.Module("mEventlistModule");
    mEventlistModule.setBody('<div id="'+ Inspector.ID_ACCORDION +'"></div>');
    mEventlistModule.render(this.body);
    mEventlistModule.show();
    COMPONENTS.mEventlistModule = mEventlistModule;
    log("Content: mEventlistModule: %o", mEventlistModule);
    
    // Create the Accordion and manipulate before rendering/appending
    var oEventList = new YAHOO.widget.AccordionView('memory', {
      width: '100%',
      collapsible: true,
      expandable: false,
      animate: false
    });
    
    // generate panels from config
    for (var panelId in PANELS) {
      oEventList.addPanel(PANELS[panelId]);
    }
    // start with a panel open
    //oEventList.openPanel(0);
    // add the Accordion into the placeholder in the Panel body
    oEventList.appendTo(Inspector.ID_ACCORDION);

    // subscribe to events to get info for resizing
    oEventList.subscribe('stateChanged', function() {log('Accordion Custom event: type: stateChanged, arguments: %o, this: %o', arguments, this)});
    oEventList.subscribe('afterPanelClose', function() {log('Accordion Custom event: type: afterPanelClose, arguments: %o, this: %o', arguments, this)});
    oEventList.subscribe('afterPanelOpen', function() {log('Accordion Custom event: type: afterPanelOpen, arguments: %o, this: %o', arguments, this)});
    
    // expose for later access, e.g. resizing
    COMPONENTS.event_list = oEventList;
    log('Created an Accordion: %o', COMPONENTS.event_list);
  };
  
  /** 
  * "render" event handler that makes the Inspector Panel resizable 
  * ref: http://developer.yahoo.com/yui/examples/container/panel-resize.html
  */  
  function makeResizable(type, args, me) {
    // Check we havn't already added this
    if (COMPONENTS.resizer) {
      log('Inspector already resizable: %o', COMPONENTS.resizer);
      return false;
    }

    var oResizer = new Resize(this.id, {
      handles: ['br'],
      autoRatio: false,
      height: this.cfg.getProperty("height"),
      minWidth: 265,
      //minHeight: 290,
      status: false
    });

    // bind resize actions using 'on' to get data
    oResizer.on('resize', resizeInspectorBody, this, true);      
    oResizer.on('endResize', resizeInspectorBody, this, true);      
    oResizer.on('resize', resizeAccordionPanel, this, true);      

    // expose for later access, e.g. resizing
    COMPONENTS.resizer = oResizer;
    log('Made Inspector resizable: %o', COMPONENTS.resizer);
  };


  /** 
  * "resize" and "endResize" event handler that suppresses the Inspector resize, and so
  * keeping automatic resizing of the body based on content height.
  * The visible size change is done by resizing the Accordion
  * NOTE: event 'args' and 'this' are different due to using 'on' vs. 'subscribe'
  */  
  function resizeInspectorBody(args) {
    this.cfg.setProperty("height", '');
    //this.cfg.setProperty("height", args.height+'px');
    log('resizeInspectorBody args: %o, args.height: %o, this: %o, cfg.height: %o, Inspector.height: %o', args, args.height, this, this.cfg.getProperty("height"), this.element.offsetHeight);
  };

  /** 
  * "resize" event handler that makes the currently open Accordion panel grow to match the element 
  * that the resizer is bound to
  * NOTE: event 'args' and 'this' are different due to using 'on' vs. 'subscribe'
  */  
  function resizeAccordionPanel(args) { 
    // set a new height on the Accordion Panel Content
    // use CSS min-/max-height to enforce a max height
    // TODO: split change by number of open Panels
    var aPanelContent = getActiveAccordionPanelContent();
    var ePanel = aPanelContent[0];
    var delta = args.height - this.element.offsetHeight;
    var existing_height = ePanel.offsetHeight;
    var new_height = existing_height + delta;
    ePanel.style.height = new_height + 'px';
    
    log('resizeAccordionPanel args: %o, args.height: %o, this: %o, panel: %o, panel.offsetHeight: %o, Inspector.height: %o', args, args.height, this, ePanel, ePanel.offsetHeight, this.element.offsetHeight);
  };
  
  /** 
  * "render" event handler that makes the Modules for content before the Event List
  */  
  function createContentModules1(type, args, me) {
    // Small status text with background icon (state3)
    var mStatusModuleSmall = new YAHOO.widget.Module("mStatusModuleSmall");      
    mStatusModuleSmall.setBody('<p class="message">Inspector small message</p>');
    mStatusModuleSmall.render(this.body);
    Dom.addClass(mStatusModuleSmall.element, 'yui-g status small');
    Dom.addClass(mStatusModuleSmall.body, 'yui-u text');
    mStatusModuleSmall.show();
    COMPONENTS.mStatusModuleSmall = mStatusModuleSmall;
    log("Added Content: mStatusModuleSmall: %o", mStatusModuleSmall);

    // Large status text with background icon (state2)
    var mStatusModuleLarge = new YAHOO.widget.Module("mStatusModuleLarge");
    // TODO: review 2 column setup
    mStatusModuleLarge.setBody('<p class="self">jsHub is</p><p class="message">Inspector large message</p>');
    mStatusModuleLarge.render(this.body);
    Dom.addClass(mStatusModuleLarge.element, 'yui-g status large');
    Dom.addClass(mStatusModuleLarge.body, 'yui-u text');
    mStatusModuleLarge.show();
    COMPONENTS.mStatusModuleLarge = mStatusModuleLarge;
    log("Added Content: mStatusModuleLarge: %o", mStatusModuleLarge);

    // Search section (state3)
    var mSearchModule = new YAHOO.widget.Module("mSearchModule");      
    mSearchModule.setBody('<div class="yui-u first"><label class="search" for="inspector_search">Find</label></div><div class="yui-u"><input type="text" disabled="disabled" class="search" id="inspector_search"/></div>');
    mSearchModule.render(this.body);
    Dom.addClass(mSearchModule.body, 'yui-gf search');
    mSearchModule.show();
    COMPONENTS.mSearchModule = mSearchModule;
    log("Added Content: mSearchModule: %o", mSearchModule);
  }; 

  /** 
  * "render" event handler that makes the Modules for content after the Event List
  */    
  function createContentModules2(type, args, me) {
    // Large buttons (state2)
    var mButtonsModuleLarge = new YAHOO.widget.Module("mButtonsModuleLarge");      
    mButtonsModuleLarge.setBody('<a href="#" class="button events">View Events</a><a href="http://www.jshub.org/" class="button get">Get jsHub</a>');
    mButtonsModuleLarge.render(this.body);
    Dom.addClass(mButtonsModuleLarge.element, 'buttons large');
    mButtonsModuleLarge.show();
    COMPONENTS.mButtonsModuleLarge = mButtonsModuleLarge;
    log("Added Content: mButtonsModuleLarge: %o", mButtonsModuleLarge);

    // Small buttons (state3)
    var mButtonsModuleSmall = new YAHOO.widget.Module("mButtonsModuleSmall");      
    mButtonsModuleSmall.setBody('<a href="#" class="button">Hide Events</a>');
    mButtonsModuleSmall.render(this.body);
    Dom.addClass(mButtonsModuleSmall.element, 'buttons small');
    mButtonsModuleSmall.show();
    COMPONENTS.mButtonsModuleSmall = mButtonsModuleSmall;
    log("Added Content: mButtonsModuleSmall: %o", mButtonsModuleSmall);

    // Floating launcher (state1)
    var mLauncherModule = new YAHOO.widget.Module("mLauncherModule");      
    mLauncherModule.setBody('<ul class="launcher"><li class="status">&nbsp;</li></ul>');
    mLauncherModule.render(this.body);
    mLauncherModule.show();
    COMPONENTS.mLauncherModule = mLauncherModule;
    log("Added Content: mLauncherModule: %o", mLauncherModule);
  };

  /**
  * "render" event handler that adds a Module to an Accordion Panel depending on Data type
  */
  function addEventToEventList(type, args, me) {
    log("addEventToEventList:  type: %o, args: %o, me: %o, this: %o", type, args, me, this);
 
    // TODO: look this up based on jsHub event.type
    var aPanelContent = getAllAccordionPanelContent();
    var ePanel = aPanelContent[0];
    log("Adding event to: %o", ePanel);
    
    // Sample event (state3)
    var mSampleEventModule1 = new YAHOO.widget.Module(Dom.generateId());
    // TODO: there are multiple templates for layout
    mSampleEventModule1.setBody('<p>Sample Event</p>');
    mSampleEventModule1.render(ePanel);
    Dom.addClass(mSampleEventModule1.element, 'event-item');
    mSampleEventModule1.show();
    COMPONENTS.mSampleEventModule1 = mSampleEventModule1;
    log("Content: mSampleEventModule1: %o", mSampleEventModule1);

    var mSampleEventModule2 = new YAHOO.widget.Module(Dom.generateId());
    // TODO: there are multiple templates for layout
    mSampleEventModule2.setBody('<p>Sample Event</p>');
    mSampleEventModule2.render(ePanel);
    Dom.addClass(mSampleEventModule2.element, 'event-item');
    mSampleEventModule2.show();
    COMPONENTS.mSampleEventModule2 = mSampleEventModule2;
    log("Content: mSampleEventModule2: %o", mSampleEventModule2);
  };
  
  function setUIState(type, args, me) {
      log('Config event: type: %o, args: %o, me: %o, this: %o', type, args, me, this)
      log(args[0]);
      Dom.removeClass(this.innerElement, Inspector.CSS_STATE_PREFIX + 1);      
      Dom.removeClass(this.innerElement, Inspector.CSS_STATE_PREFIX + 2);      
      Dom.removeClass(this.innerElement, Inspector.CSS_STATE_PREFIX + 3);      
      Dom.addClass(this.innerElement, Inspector.CSS_STATE_PREFIX + args[0]);      
  }
  function setUIStatus(type, args, me) {
      log('Config event: type: %o, args: %o, me: %o, this: %o', type, args, me, this)
      log(args[0]);
      Dom.removeClass(this.body, "info");      
      Dom.removeClass(this.body, "success");      
      Dom.removeClass(this.body, "warning");      
      Dom.removeClass(this.body, "error");      
      Dom.addClass(this.body, args[0]);      
  }
  
  // End Private methods for Event handlers
  
  // We declare the Inspector constructor to inherit from Panel and override existing or add additional methods
  YAHOO.lang.extend(Inspector, Panel, {
  
    /**
    * The Inspector initialization method is automatically called by the 
    * constructor, and  sets up all custom events and event handlers.
    * @method init
    * @param {String} el The element ID representing the Inspector <em>OR</em>
    * @param {HTMLElement} el The element representing the Inspector
    * @param {Object} userConfig The configuration object literal 
    * containing the configuration that should be set for this Inspector. 
    * See configuration documentation for more details.
    */  
    init : function(el, userConfig) {
      log("jsHub.org Inspector init start");

      // First calls the superclass Panel init so our Panel has its predefined configuration attributes
      // Note that we don't pass the user config in here yet because we only want it executed once
      Inspector.superclass.init.call(this, el/*, userConfig*/);

      this.beforeInitEvent.fire(Inspector);

      // subscribe to monitor Inspector config changes
      this.cfg.subscribe('configChanged', function(type, args, me) {log('Config event: type: %o, args: %o, me: %o, this: %o', type, args, me, this)});
      this.cfg.subscribe('autoFillHeight', function(type, args, me) {log('Config event: type: %o, args: %o, me: %o, this: %o', type, args, me, this)});
      this.cfg.subscribeToConfigEvent('height', function(type, args, me) {log('Config event: type: %o, args: %o, me: %o, this: %o', type, args, me, this)}, this, this);
      this.cfg.subscribeToConfigEvent('state', setUIState);
      this.cfg.subscribeToConfigEvent('status', setUIStatus);

      // now apply the users config
      if (userConfig) {
        this.cfg.applyConfig(userConfig, true);
      } 
       
      // Subscribe to Inspector UI life-cycle events
      this.subscribe('beforeRender', createCssContext);
      this.subscribe('beforeRender', templateTitle);
      this.subscribe('beforeRender', templateVersion);

      this.subscribe('render', makeResizable);
      this.subscribe('render', createContentModules1);
      this.subscribe('render', createEventList);
      this.subscribe('render', createContentModules2);
      this.subscribe('render', addEventToEventList);
      
      this.subscribe('changeContent', function(type, args, me) {log('Custom event: type: %o, args: %o, me: %o, this: %o', type, args, me, this)});
      this.subscribe('show', function(type, args, me) {log('Custom event: type: %o, args: %o, me: %o, this: %o', type, args, me, this)});
      this.subscribe('hide', function(type, args, me) {log('Custom event: type: %o, args: %o, me: %o, this: %o', type, args, me, this)});

      // custom functionality events
      this.subscribe('foundCode', srcChecksum);
      this.subscribe('checksumCode', function(type, args, me) {log('Custom event: type: %o, args: %o, me: %o, this: %o', type, args, me, this)});

      // Setup UI

      // References to generated HTMLElements
      // jshub_inspector_c = this.element
      // jshub_inspector = this.innerElement
      // jshub_inspector_h = this.header
      
      // add the current state as a CSS class
      Dom.addClass(this.innerElement, Inspector.CSS_STATE_PREFIX + this.cfg.getProperty(DEFAULT_CONFIG.STATE.key));      
      // make sure we have a Body as early as possible
      this.setBody('<!-- Create a body element in Init to add Modules to -->');
      
      // Do custom functionality
      jsHubIsPresent(this);
      
      // Last
      log("jsHub.org Inspector init complete");
      this.initEvent.fire(Inspector);
    },
    
    /**
    * Initializes the custom events for the Inspector which are fired 
    * automatically at appropriate times.
    */
    initEvents: function () {
      log("jsHub.org Inspector initEvents start");

      // First calls the superclass Panel initEvents so our Panel has its predefined custom events
      Inspector.superclass.initEvents.call(this);
      
      var SIGNATURE = CustomEvent.LIST;
      
      /**
      * CustomEvent fired after detecting the jsHub core lib
      * @event foundCodeEvent
      */
      this.foundCodeEvent = this.createEvent(EVENT_TYPES.FOUND_CODE);
      this.foundCodeEvent.signature = SIGNATURE;

      /**
      * CustomEvent fired after SHA1 checksumming a src JS file
      * @event checksumCodeEvent
      */
      this.checksumCodeEvent = this.createEvent(EVENT_TYPES.CHECKSUM_CODE);
      this.checksumCodeEvent.signature = SIGNATURE;

      /**
      * CustomEvent fired after changing the state of the UI
      * @event changeStatusEvent
      */
      this.changeStateEvent = this.createEvent(EVENT_TYPES.CHANGE_STATE);
      this.changeStateEvent.signature = SIGNATURE;

      /**
      * CustomEvent fired after changing the status of the UI
      * @event changeStatusEvent
      */
      this.changeStatusEvent = this.createEvent(EVENT_TYPES.CHANGE_STATUS);
      this.changeStatusEvent.signature = SIGNATURE;

      log("jsHub.org Inspector initEvents complete");
    },
    
    /**
    * Initializes the class's configurable properties which can be changed 
    * using the Inspector's Config object (cfg).
    * @method initDefaultConfig
    */
    initDefaultConfig : function() {
      log("jsHub.org Inspector initDefaultConfig start");

      // First calls the superclass Panel initDefaultConfig so our Panel has its predefined configuration attributes
      Inspector.superclass.initDefaultConfig.call(this);
      
      // then we start adding our own
      
			/** 
			* Sets the intial state of the Inspector.
			* '1' = Floating
			* '2' = Minimised
			* '3' = Maximised with event viewer
			* @config STATE
			* @type Number
			* @default 1
			*/
			this.cfg.addProperty(DEFAULT_CONFIG.STATE.key, {
				value: DEFAULT_CONFIG.STATE.value,
				validator: DEFAULT_CONFIG.STATE.validator
			});

			/** 
			* Sets the intial status of the Inspector.
			* 'info' = No jsHub core lib on page or other
			* 'warning' = Either the checksum of the jsHub core lib failed or there are duplicate metadata entries on the page
			* 'error' = Something went wrong
			* 'success' = Evething is working fine
			* @config STATUS
			* @type string
			* @default info
			*/
			this.cfg.addProperty(DEFAULT_CONFIG.STATUS.key, {
				value: DEFAULT_CONFIG.STATUS.value,
				validator: DEFAULT_CONFIG.STATUS.validator
			});
			
      /**
      * UI Strings used by the Panel
      * 
      * @config strings
      * @type Object
      * @default An object literal with the properties shown below:
      *     <dl>
      *         <dt>close</dt><dd><em>String</em> : The string to use for the close icon. Defaults to "Close".</dd>
      *     </dl>
      */
      this.cfg.addProperty(DEFAULT_CONFIG.STRINGS.key, { 
        value:DEFAULT_CONFIG.STRINGS.value,
        handler:this.configStrings,
        validator:DEFAULT_CONFIG.STRINGS.validator,
      });			

      log("jsHub.org Inspector initDefaultConfig complete");
    },
  
    /**
    * The Inspector can only be rendered inside its correct CSS context which is created on beforeRenderEvent.
    * @method render
    * @return {boolean} Success or failure of the render
    */  
    render : function() {  
      log('jsHub.org Inspector render start');
      return Inspector.superclass.render.call(this, Inspector.ID_CONTAINER);
      log('jsHub.org Inspector render complete');
    },

    // Custom public methods

    /**
    * Gets the Inspectors current state.
    * @method getCurrentState
    * @return {Integer} 
    */  
    getCurrentState : function() {
      var state = this.cfg.getProperty(DEFAULT_CONFIG.STATE.key);
      log('jsHub.org Inspector state: %o', state);
      return state;
    },

    /**
    * Gets the Inspectors current status.
    * @method getCurrentStatus
    * @return {String} the string identifier (used for CSS classes, etc)
    */  
    getCurrentStatus : function() {
      var status = this.cfg.getProperty(DEFAULT_CONFIG.STATUS.key);
      log('jsHub.org Inspector status: %o', status);
      return status;
    },

    /**
    * Sets the Inspectors current state (for UI dev only).
    * @method _setCurrentState
    * @private
    * @return {Integer} 
    */  
    _setCurrentState : function(state) {
      var state = this.cfg.setProperty(DEFAULT_CONFIG.STATE.key, state);
      log('jsHub.org Inspector state: %o', state);
      return state;
    },

    /**
    * Gets the Inspectors current status (for UI dev only).
    * @method _setCurrentStatus
    * @private    
    * @return {String} the string identifier (used for CSS classes, etc)
    */  
    _setCurrentStatus : function(status) {
      var status = this.cfg.setProperty(DEFAULT_CONFIG.STATUS.key, status);
      log('jsHub.org Inspector status: %o', status);
      return status;
    },
    
    /**
    * Adds an event to a Panel (for UI dev only).
    * @method _addHubEvent
    * @private    
    * @return {Object} the event object submitted
    */  
    _addHubEvent : function(event) {
      log('jsHub.org Inspector new event: %o', event);
      return event;      
    },    
    
    /**
    * Provides a readable name for the Inspector instance.
    * @method toString
    * @return {String} String representation of the object 
    */  
    toString : function() {
        return META.NAME +" v"+ META.VERSION +" r"+ META.BUILD; 
    }
    
  });
  
  // Namespace our widget and expose it for use
  YAHOO.namespace('JSHUB_ORG');
  YAHOO.JSHUB_ORG.Inspector = Inspector;  
  // Last: Register the module with YAHOO for use with the YUILoader
  YAHOO.register('JSHUB_ORG.Inspector', YAHOO.JSHUB_ORG.Inspector, {version: META.VERSION, build: META.BUILD});

})();