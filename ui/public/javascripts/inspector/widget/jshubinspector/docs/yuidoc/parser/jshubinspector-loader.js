/*!
 *  jsHub open source tag
 *  Copyright (c) 2009 jsHub.org
 *  Authors: Liam Clancy, Fiann O'Hagan, Steve Heron
 */

(function(){
  // Wrap logging during development
  function log(){ 
    if (window.console  && META.DEBUG === true) {
      console.log.apply(console, arguments); 
    }
  };
  
  // Create a new loader to get all Widgets and dependent files
  var loader = new YAHOO.util.YUILoader();

  // Constant representing the loader's metadata properties
  var META = {
        "DEBUG": true // enable debugging and logging
      };

  
  // Declare the Inspector to the loader
  loader.addModule({
    name: 'JSHUB_ORG.Inspector',
    type: 'js',
    requires: [ 'JSHUB_ORG.Inspector.YUI3.CSSResetContext',
                'JSHUB_ORG.Inspector.YUI3.CSSBaseContext',
                'JSHUB_ORG.Inspector.YUI3.CSSFontsContext',
                'JSHUB_ORG.Inspector.YUI3.CSSGridsContext',
                'utilities', 
                'container', 
                'resize',
                'accordionview',
                'json2',
                'sha1',
                'JSHUB_ORG.Inspector.CSS'
              ],
    fullpath: '/ui/javascripts/inspector/widget/jshubinspector/jshubinspector.js'
  });
  // Declare the Inspector Skin - note generated on demand by SASS
  loader.addModule({
    name: 'JSHUB_ORG.Inspector.CSS',
    type: 'css',
    fullpath: '/ui/stylesheets/inspector/widget/jshubinspector/jshubinspector.css'
  });

  // Declare YUI3 CSS required by the JSHUB_ORG.Inspector
  loader.addModule({
    name: 'JSHUB_ORG.Inspector.YUI3.CSSResetContext',
    type: 'css',
    fullpath: '/ui/javascripts/inspector/widget/yui3-cssreset/reset-context-min.css'
  });
  loader.addModule({
    name: 'JSHUB_ORG.Inspector.YUI3.CSSBaseContext',
    type: 'css',
    fullpath: '/ui/javascripts/inspector/widget/yui3-cssbase/base-context-min.css'
  });
  loader.addModule({
    name: 'JSHUB_ORG.Inspector.YUI3.CSSFontsContext',
    type: 'css',
    fullpath: '/ui/javascripts/inspector/widget/yui3-cssfonts/fonts-context-min.css'
  });
  loader.addModule({
    name: 'JSHUB_ORG.Inspector.YUI3.CSSGridsContext',
    type: 'css',
    fullpath: '/ui/javascripts/inspector/widget/yui3-cssgrids/grids-context-min.css'
  });
  
  // 3rd party YUI modules used by the Inspector
  loader.addModule({
    name: 'accordionview',
    type: 'js',
    requires: [ 'yahoo', 'dom', 'event', 'element', 'animation', 'accordionview-css' ],
    fullpath: '/ui/javascripts/inspector/widget/accordionview/accordionview-min.js'
  });
  loader.addModule({
    name: 'accordionview-css',
    type: 'css',
    fullpath: '/ui/javascripts/inspector/widget/accordionview/accordionview-min.css'
  });
  loader.addModule({
    name: 'json2',
    type: 'js',
    fullpath: '/ui/javascripts/inspector/widget/json2/json2.js'
  });  
  loader.addModule({
    name: 'sha1',
    type: 'js',
    fullpath: '/ui/javascripts/inspector/widget/sha1/sha1.js'
  });  
  
  // set the list of required modules
  loader.require('JSHUB_ORG.Inspector');
  // load the modules into their own sandboxed namespace
  loader.sandbox({
    base: '/ui/javascripts/inspector/widget/',
    onSuccess: function(sandbox){ 
      // sandbox.reference is the sandboxed YAHOO object
      var YUI2 = sandbox.reference;
      log("Loader: Sandboxed YUI2 is equal to global YAHOO? %o", (YUI2 === YAHOO)); // should be false
      
      // Create an Inspector instance from sandboxed object
      var oInspector = new YUI2.JSHUB_ORG.Inspector('jshub_inspector', {
        width: '265px',  // TODO: this should be dependent on state
        //height: '', // do not use as it breakes the resizing
        close: true, // default true
        draggable: true, // default true
        dragOnly: true, // default false
        autofillheight: "body", // default body
        constraintoviewport: true,
        underlay: "none", //default none
        state: 1, // set state on creation (default 1)
        status: "info" // set status on creation (default info)
      });
      
      // Enhancements to Inspector Events for this instance
      /*
      Inspector.beforeRenderEvent.subscribe(function() {
        log('beforeRenderEvent called on instance');
      })

      // Enhancements to Inspector Events
      Inspector.renderEvent.subscribe(function() {
        log('renderEvent called on instance');
      })
      */
      
      // Public API
      window.jsHub = window.jsHub || {};
      window.jsHub.Inspector = oInspector;
      // Enable inspection of the instance
      log("Public instance: %o", window.jsHub.Inspector);
      
    },
    onFailure: function(msg){ 
      log('onFailure: '+ msg); 
    }
	});
})();