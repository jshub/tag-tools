/*!
 *  jsHub open source tag
 *  Copyright (c) 2009 jsHub.org
 *
 */

/*jslint strict: true */
"use strict";

(function() {
  var jsHub = this.js
  var tag_data = {
    Homepage: "http://www.jshub.org/",
    Version: "0.1beta",
    GeneratedBy: "http://gromit/configurator/tag_configurations",
    Configuration: "Test r5003 - defaults (revision 1, debug)"
  };
  this.jsHub = this.jsHub || {};
  for (var field in tag_data) {
  	this.jsHub[field] = tag_data[field];
  }
})();



/**
 * Core hub functionality for jsHub tag
 * @module hub
 * @class jsHub
 *//*--------------------------------------------------------------------------*/

// JSLint options
/*global jQuery */
"use strict";

(function ($) {
  
  // global namespace
  var global = this, 

    // instance of jsHub object
    jsHub,

    /**
     * Wrap Firebug console for logging.
     * Set META.DEBUG = false to switch off logging.
     * @class Logger
     * @for jsHub
     */
    // TODO: Enable sending of logging data to remote servers
    Logger = function () {
      var console = global.console;
      var logging_active = console && true;
      if (global.META && global.META.DEBUG === false) {
        logging_active = false;
      }
      this.debug = function debug() {
        if (logging_active && console.debug) {
          console.debug.apply(console, arguments);
        }
      };
      this.log = function log() {
        if (logging_active && console.log) {
          console.log.apply(console, arguments);
        }
      };
      this.warn = function warn() {
        if (logging_active && console.warn) {
          console.warn.apply(console, arguments);
        }
      };
      this.error = function error() {
        if (logging_active && console.error) {
          console.error.apply(console, arguments);
        }
      };
      this.group = function group() {
        if (logging_active && console.group) {
          console.group.apply(console, arguments);
        } else {
          this.log.apply(this, arguments);
		}
      };
      this.groupEnd = function groupEnd() {
        if (logging_active && console.groupEnd) {
          console.groupEnd.apply(console, arguments);
		}
      };
    },

    /**
     * Core event dispatcher functionality of the hub
     * @class Hub
     * @property listeners
     */
    Hub = function () {

      // stores functions listening to various events
      var listeners = {},
	  
	  /** Plugins that have registered with the hub. */
	  plugins = [],

      /**
       * a listener has an authentication token and a callback
       * @class Listener
       * @for Hub
       * @param token {string}
       * @param callback {function}
       */
      Listener = function (token, callback) {
        this.token = token;
        this.callback = callback;
      },
  
      /**
       * A simple event object
       * @class Event
       * @for Hub
       * @param name {string}
       * @param data {object}
       * @param timestamp {number} an optional timestamp value. 
       */
      Event = function (name, data, timestamp) {
        this.type = name;
    		this.timestamp = timestamp || jsHub.safe.getTimestamp();
        this.data = data;
      },
  
      // the firewall filters event data before passing to listeners
      /**
       * A simple event object
       * @class EventDispatcher
       * @for Hub
       */
      EventDispatcher = function () {
    
        /**
         * Locate a token within a comma separate string.
         * @method containsToken
         * @param string {string}
         * @param token {string}
         */
        var containsToken = function (string, token) {
          string = string.split(",");
          for (var i = 0; i < string.length; i++) {
            if (token === $.trim(string[i])) {
              return true;
            }
          }
          return false;
        },
    
        /**
         * TODO: Description
         * @method validate
         * @param token {string}
         * @param payload {object}
         */
        validate = function (token, payload) {
          var who = $.trim(payload.event_visibility);
          if (who === "" || who === "*") {
            return true;
          }
          return containsToken(who, token);
        },
    
        /**
         * TODO: Description
         * @method filter
         * @param token {string}
         * @param data {object}
         */
        filter = function (token, data) {
          // TODO remove fields from data that do not validate
          var filtered = {};
          $.each(data, function (key, value) {
            if (/_visibility$/.test(key) === false) {
              var fieldVisibility = data[key + "_visibility"];
              if (typeof fieldVisibility !== 'string'
                  || fieldVisibility === "" 
                  || fieldVisibility === "*"
                  || containsToken(fieldVisibility, token)) {
                filtered[key] = value;
              }
            }
          });
          return filtered;
        };

        /**
         * TODO: Description
         * @method dispatch
         * @param name {string} the name of the event
         * @param listener {Listener} the listener object to call back to
         * @param data {object}
         */        
        this.dispatch = function (name, listener, data) {
    		  var evt, filteredData, extraData;
      
  	      if (validate(listener.token, data)) {
  	        // remove private fields from the data for each listener
      			filteredData = filter(listener.token, data);
      			// send to the listener
  	        jsHub.logger.debug("Sending event %s to listener %s with data", name, listener.token, filteredData);
  	        evt = new Event(name, filteredData);
  	        extraData = listener.callback(evt);
      			// merge any additional data found by the listener into the data
      			if (extraData) {
    		      $.extend(true, data, extraData);
    		      jsHub.logger.debug("Listener %s added data, event is now ", listener.token, data);
      			}
  	      }
        };
      },
    
      firewall = new EventDispatcher(); 

      /**
       * Bind a listener to a named event.
       * @method bind
       * @for jsHub
       * @param eventName {string} the name of the event to bind.
       * Note that "*" is a special event name, which is taken to mean that 
       * the listener wants to be informed of every event that occurs 
       * (provided it has visibility of that event).
       * @param token {string} an identifier for the listener, which will
       * be matched against the value of the <code>data-visibility</code>
       * attribute of the DOM node containing the event.
       * @param callback {function} the function to call when an event is 
       * triggered. The function will be called with a single parameter containing
       * the event object.
       */
      this.bind = function (eventName, token, callback) {
        // TODO validate input data
        var list = listeners[eventName], found, i;
        if ('undefined' === typeof list) {
          list = [];
        }
        // if already present, then replace the callback function
        for (found = false, i = 0; i < list.length; i++) {
          if (list[i].token === token) {
            list[i].callback = callback;
            found = true;
            break;
          } 
        }
        // otherwise add it
        if (! found) {
          list.push(new Listener(token, callback));
        }
        listeners[eventName] = list;
      };

      /**
       * Fire a named event, and inform all listeners
       * @method trigger
       * @for jsHub
       * @param eventName {string}
       * @param data {object}
       */
      this.trigger = function (eventName, data) {
        jsHub.logger.group("Event %s triggered with data", eventName, (data || "'none'"));
        // empty object if not defined
        data = data || {};
        // find all registered listeners for the specific event, and for "*"
        var registered = $.merge(listeners[eventName] || [], listeners["*"] || []);
        for (var i = 0; i < registered.length; i++) {
          firewall.dispatch(eventName, registered[i], data);
        }
        jsHub.logger.groupEnd();
		// additional special behavior for particular event types
        if (eventName === "plugin-initialization-start") {
          plugins.push(data);
        }
      };
	  
	  /**
	   * Get information about plugins that have registered with
	   * the hub using trigger("plugin-initialization-start").
	   */
      this.getPluginInfo = function () {
        // take a deep copy to prevent the data being tampered with 
        var clone = [], i;
        for (i = 0; i < plugins.length; i++) {
          var plugin = plugins[i], plugin_clone = {};
          for (var field in plugin) {
            if (typeof plugin[field] === 'string' || typeof plugin[field] === 'number') {
              plugin_clone[field] = plugin[field];
            }
          }
          clone.push(plugin_clone);
        }
        return clone;
      };
    },

    /**
     * Document.forms data transport
     * Creates an HTML form in the DOM and encodes the data into the POST body for sending to a server.
     * The form is submitted to a named iframe for asynchronous cross domain delivery.
     * @class FormTransport
     */
    FormTransport = function () {
  
      /**
       * Send a request to the server as a POST or GET method form request. 
       * <p>The data is sent via a hidden iframe which is dynamically created in the page, so that the
       * form submission does not interfere with the history and behaviour of the back button in 
       * the browser.
       * <p>This function does not perform any serialization. It is the responsibility of the data
       * output plugins to prepare the data in the format required by their server.
       * @method dispatch
       * @for FormTransport
       * @param method {string} one of "GET" or "POST", not case sensitive. If the method is not
       * supplied or does not match on of these values, then the submission will be rejected and
       * the function will return without taking any action.
       * @param url {string} a URL for the endpoint to send the data to. The URL is processed by
       * the browser, and so it may be fully qualified or relative to the page, as per a normal 
       * link. If the url is not specified the method will return without taking any action.
       * @param data {object} an object containing name=value pairs that will be sent as form data.
       * The name of each field in the object will be used as the form field name. The value must
       * be either a string, a number, or an array of strings / numbers, in which case multiple
       * form fields with the same name will be created. Any parameters which do not match this
       * expected format will be ignored.
       * @return the ID of the iframe that has been created
       */
      this.dispatch = function (method, url, data) {
        jsHub.logger.group("FormTransport: dispatch(" + url + ") entered");
        var form, appendField, iframe, iframeID, field, array, i;
        
        /*
         * This data transport only supports POST or GET
         * TODO: validate url for security reasons, reject javascript: protocol etc
         */
        if (!(/^POST|GET$/i.test(method)) || !url) {
          jsHub.logger.error("Method (" + method + ") or url (" + url + ") was not defined correctly");
          jsHub.logger.groupEnd();
          return;
        }
        data = data || {};
		
        /**
         * Add a hidden field to the form
         * @param {Object} form
         * @param {Object} name
         * @param {Object} value
         */
        appendField = function (form, name, value) {
          if ("string" === typeof value || "number" === typeof value) {
            var input = $('<input type="hidden">');
            input.attr("name", name);
            input.attr("value", value);
            form.append(input);
          }
        };
		
        // Create the form from a string via jQuery
        form = $('<form action="' + url + '" method="' + method + '"></form>');
        for (field in data) {
          if (data[field] instanceof Array) {
            // TODO improve array test for security: http://blog.360.yahoo.com/blog-TBPekxc1dLNy5DOloPfzVvFIVOWMB0li?p=916
            array = data[field];
            for (i = 0; i < array.length; i++) {
              if ("string" === typeof array[i] || "number" === typeof array[i]) {
                appendField(form, field, array[i]);
              }
            }
          } else {
            appendField(form, field, data[field]);
          }
        }
        $('body').append(form);
        jsHub.logger.log("Created form:", form[0]);

        // Create the iframe from as string via jQuery
        iframeID = "jshub-iframe-" + jsHub.safe.getTimestamp();
        iframe = $('<iframe src="javascript:void(0)" name="' + iframeID + '" id="' + iframeID + '" '
          + 'style="display: none !important; width: 0px; height: 0px;" class="jshub-iframe"></iframe>');
      
        $('body').append(iframe);
        jsHub.logger.log("Created iframe:", iframe[0]);
    
        // Set the iframe as the submission target of the form, tied together by a timestamp
        form.attr("target", iframeID);

        // And send it ...
        form.submit();
        jsHub.logger.log("Form submitted");
        jsHub.trigger("form-transport-sent", {
          node: iframeID
        });
        jsHub.logger.groupEnd();
        return iframeID;
      };
    },
	
	/**
	 * Dispatches data to a webserver via an HTTP GET request.
	 * The response is placed into a non-visible image in the page, and so any
	 * data returned by the server is effectively ignored although it is expected
	 * to typically be a single pixel GIF image
	 * @class ImageTranport
	 */
	ImageTransport = function () {
		
	  /** 
	   * Append a field to a query string url
	   */
      var append = function (url, name, value) {
        return url + (url.indexOf('?') > -1 ? '&' : '?') 
          + encodeURIComponent(name) + "=" + encodeURIComponent(value);
      };

      /**
       * Send a request to the server as a GET request for an image. 
       * <p>Plugins can call this function to create an image object to send data to the
       * server. Data can be supplied in two locations: in a URL string which can be in
       * any format required by the server, and a data object.
       * <p>All text and numeric fields in the data object are URL encoded and used to build
       * a query string which is appended to the URL. 
       * @method dispatch
       * @for ImageTransport
       * @param url {string} a URL for the endpoint to send the data to. The URL is 
       * processed by the browser, and so it may be fully qualified or relative to the
       * page, as per a normal link. 
       * The URL may contain all the information required by the server, in any format
       * as specified by the plugin calling this function. Plugins must ensure that they
       * have correctly URL encoded any data fields in the URL.
       * If the url is not specified the method will return without taking any action.
       * @param data {object} an object containing name=value pairs that will be sent as 
       * query string data. The name of each field in the object will be used as the form 
       * field name. The value must be either a string, a number, or an array of strings 
       * and numbers, in which case multiple query string fields with the same name will 
       * be created. Any parameters which do not match this expected format will be ignored.
       * @return the ID of the iframe that has been created
       */
      this.dispatch = function (url, data) {
        jsHub.logger.group("ImageTransport: dispatch(" + url + ") entered");
        
		// base url must be defined
        if (typeof url !== 'string' || url.length < 1) {
          jsHub.logger.error("Base url (" + url + ") was not defined correctly");
          jsHub.logger.groupEnd();
          return null;
        }
		
		// add data to url if it is defined
        if (typeof data === 'object') {
          for (var field in data) {
            if (typeof data[field] === 'string' || typeof data[field] === 'number') {
              url = append(url, field, data[field]);
            } else if (data[field].constructor === Array) {
              var values = data[field];				
              for (var i = 0; i < values.length; i++) {
                if (typeof values[i] === 'string' || typeof values[i] === 'number') {
                  url = append(url, field, values[i]);
                }
              }
            }
          }
        }
		
        var image = $('<img>');
        image.attr('src', url);

        jsHub.logger.log("Dispatched: " + url);
        jsHub.logger.groupEnd();
        return image[0];
		
      };
    };

  // jsHub object in global namespace
  jsHub = global.jsHub = new Hub();

  // Initialise a logger instance  
  jsHub.logger = new Logger();
  
  // Create an object to return safe instances of important variables
  jsHub.safe = function (obj) {
    var safeObject;
    switch (obj) {
    case 'document' : 
      safeObject = {
        // no document DOM properties are available
        location : { 
          href : document.location.href,
          host : document.location.host,
          protocol : document.location.protocol,
          pathname : document.location.pathname
        },
        title : document.title,
        referrer : (document.referrer === null) ? "" : document.referrer,
        cookies : document.cookies,
        domain : 'Unsafe property'
      };
      break;      
    case '$' :
      // TODO this is not safe
      safeObject = jQuery;
      break;      
    default :
      safeObject = null;
    }
    return safeObject;
  };
    
  /**
   * Get a timestamp for an event.
   * TODO add sequence / random component
   */
  jsHub.safe.getTimestamp = function () {
    return new Date().getTime();
  };
  
  /** 
   * Convert an object to a JSON representation
   */
  jsHub.safe.toJSONString = function (object) {
  	return JSON.stringify(object, null, 2);
  };

  // Initialise lifecycle triggers
  jsHub.logger.log("Hub initialized, triggering page lifecycle events");
  $(document).ready(function () {
  	// Can be used to pre-configure data at page level if necessary
  	jsHub.trigger("data-capture-start");

    // Data is ready to be parsed by Data Capture plugins
    jsHub.trigger("page-view");

  	// Data capture phase is complete
    jsHub.trigger("data-capture-complete");
  });

  jsHub.dispatchViaForm = (new FormTransport()).dispatch;
  jsHub.dispatchViaImage = (new ImageTransport()).dispatch;
})(jQuery);

/**
 * Enhancements to jQuery for common functions 
 * used in plugins
 * @module data-capture
 * @class PluginAPI
 *//*--------------------------------------------------------------------------*/

/*jslint strict: true */
/*global jsHub, jQuery, Date */
"use strict";
 
(function () {
  var PluginAPI = {

    /**
     * This function normalizes an ISO8601 date by adding punctuation and
     * ensuring that hours and seconds have values
     * ref: http://en.wikipedia.org/wiki/ISO_8601
     * credits: Michael Kaply, Firefox Operator extension
     * @method normalizeISO8601
     * @param string {string} String to parse into ISO8601 format date
     * @return {string}       ISO8601 format date as a String 
     */
    normalizeISO8601: function (string) {
      var dateArray = string.match(/(\d\d\d\d)(?:-?(\d\d)(?:-?(\d\d)(?:[T ](\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(?:([+-Z])(?:(\d\d)(?::?(\d\d))?)?)?)?)?)?/),
          dateString,
          tzOffset = 0;
        
      if (!dateArray) {
        return;
      }
    
      // build-up a ISO8601 string
      if (dateArray[1]) {
        dateString = dateArray[1];
        if (dateArray[2]) {
          dateString += "-" + dateArray[2];
          if (dateArray[3]) {
            dateString += "-" + dateArray[3];
            if (dateArray[4]) {
              dateString += "T" + dateArray[4];
              if (dateArray[5]) {
                dateString += ":" + dateArray[5];
              } else {
                dateString += ":" + "00";
              }
              if (dateArray[6]) {
                dateString += ":" + dateArray[6];
              } else {
                dateString += ":" + "00";
              }
              if (dateArray[7]) {
                dateString += "." + dateArray[7];
              }
              if (dateArray[8]) {
                dateString += dateArray[8];
                if ((dateArray[8] === "+") || (dateArray[8] === "-")) {
                  if (dateArray[9]) {
                    dateString += dateArray[9];
                    if (dateArray[10]) {
                      dateString += dateArray[10];
                    }
                  }
                }
              }
            }
          }
        }
      }
      return dateString;
    },
    /**
     * Converts an ISO8601 date into a JavaScript date object, honoring the TZ
     * offset and Z if present to convert the date to local time
     * NOTE: I'm using an extra parameter on the date object for this function.
     * I set date.time to true if there is a date, otherwise date.time is false.
     * ref: http://en.wikipedia.org/wiki/ISO_8601
     * credits: Michael Kaply, Firefox Operator extension
     * @method dateFromISO8601
     * @param  string {string}  ISO8601 formatted date
     * @return {string}         JavaScript date object that represents the ISO date. 
     */
    dateFromISO8601: function dateFromISO8601(string) {
      var dateArray = string.match(/(\d\d\d\d)(?:-?(\d\d)(?:-?(\d\d)(?:[T ](\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(?:([+-Z])(?:(\d\d)(?::?(\d\d))?)?)?)?)?)?/);
      
      var date = new Date(dateArray[1], 0, 1);
      date.time = false;

      if (dateArray[2]) {
        date.setMonth(dateArray[2] - 1);
      }
      if (dateArray[3]) {
        date.setDate(dateArray[3]);
      }
      if (dateArray[4]) {
        date.setHours(dateArray[4]);
        date.time = true;
        if (dateArray[5]) {
          date.setMinutes(dateArray[5]);
          if (dateArray[6]) {
            date.setSeconds(dateArray[6]);
            if (dateArray[7]) {
              date.setMilliseconds(Number("0." + dateArray[7]) * 1000);
            }
          }
        }
      }
      if (dateArray[8]) {
        if (dateArray[8] === "-") {
          if (dateArray[9] && dateArray[10]) {
            date.setHours(date.getHours() + parseInt(dateArray[9], 10));
            date.setMinutes(date.getMinutes() + parseInt(dateArray[10], 10));
          }
        } else if (dateArray[8] === "+") {
          if (dateArray[9] && dateArray[10]) {
            date.setHours(date.getHours() - parseInt(dateArray[9], 10));
            date.setMinutes(date.getMinutes() - parseInt(dateArray[10], 10));
          }
        }
        /* at this point we have the time in gmt */
        /* convert to local if we had a Z - or + */
        if (dateArray[8]) {
          var tzOffset = date.getTimezoneOffset();
          if (tzOffset < 0) {
            date.setMinutes(date.getMinutes() + tzOffset); 
          } else if (tzOffset > 0) {
            date.setMinutes(date.getMinutes() - tzOffset); 
          }
        }
      }
      return date;
    },
    /**
     * Converts a Javascript date object into an ISO 8601 formatted date
     * NOTE: I'm using an extra parameter on the date object for this function.
     * If date.time is NOT true, this function only outputs the date.
     * ref: http://en.wikipedia.org/wiki/ISO_8601
     * credits: Michael Kaply, Firefox Operator extension
     * @method iso8601FromDate
     * @param  date {object}            Javascript Date object
     * @param  punctuation {boolean}  True if the date should have -/:
     * @return {string}               String with the ISO date. 
     */
    iso8601FromDate: function iso8601FromDate(date, punctuation) {
      var string = date.getFullYear().toString();
      if (punctuation) {
        string += "-";
      }
      string += (date.getMonth() + 1).toString().replace(/\b(\d)\b/g, '0$1');
      if (punctuation) {
        string += "-";
      }
      string += date.getDate().toString().replace(/\b(\d)\b/g, '0$1');
      if (date.time) {
        string += "T";
        string += date.getHours().toString().replace(/\b(\d)\b/g, '0$1');
        if (punctuation) {
          string += ":";
        }
        string += date.getMinutes().toString().replace(/\b(\d)\b/g, '0$1');
        if (punctuation) {
          string += ":";
        }
        string += date.getSeconds().toString().replace(/\b(\d)\b/g, '0$1');
        if (date.getMilliseconds() > 0) {
          if (punctuation) {
            string += ".";
          }
          string += date.getMilliseconds().toString();
        }
      }
      return string;
    },

    /** 
     * Fix relative pathed URLs
     * ref: http://www.sitepoint.com/blogs/2007/08/10/dealing-with-unqualified-href-values/
     * TODO: pass in context to account for BASE or IFRAME variations
     * @method qualifyHREF
     * @param href {string} The href to qualify, e.g. page.html, ../page.html, /page.html
     * @return {string}     Full qualified URI
     */
    qualifyHREF: function (href) {
      //get the current safe document location object 
      var loc = jsHub.safe('document').location; 

      //build a base URI from the protocol plus host (which includes port if applicable) 
      var uri = loc.protocol + '//' + loc.host; 

      //if the input path is relative-from-here 
      //just delete the ./ token to make it relative 
      if (/^(\.\/)([^\/]?)/.test(href)) 
      { 
        href = href.replace(/^(\.\/)([^\/]?)/, '$2'); 
      } 

      //if the input href is already qualified, copy it unchanged 
      if (/^([a-z]+)\:\/\//.test(href)) 
      { 
        uri = href; 
      } 

      //or if the input href begins with a leading slash, then it's base relative 
      //so just add the input href to the base URI 
      else if (href.substr(0, 1) === '/') 
      { 
        uri += href; 
      } 

      //or if it's an up-reference we need to compute the path 
      else if (/^((\.\.\/)+)([^\/].*$)/.test(href)) 
      { 
        //get the last part of the path, minus up-references 
        var lastpath = href.match(/^((\.\.\/)+)([^\/].*$)/); 
        lastpath = lastpath[lastpath.length - 1]; 

        //count the number of up-references 
        var references = href.split('../').length - 1; 

        //get the path parts and delete the last one (this page or directory) 
        var parts = loc.pathname.split('/'); 
        parts = parts.splice(0, parts.length - 1); 

        //for each of the up-references, delete the last part of the path 
        for (var i = 0; i < references; i++) 
        { 
          parts = parts.splice(0, parts.length - 1); 
        } 

        //now rebuild the path 
        var path = ''; 
        for (var j = 0; j < parts.length; j++) 
        { 
          if (parts[j] !== '') 
          { 
            path += '/' + parts[j]; 
          } 
        } 
        path += '/'; 

        //and add the last part of the path 
        path += lastpath; 

        //then add the path and input href to the base URI 
        uri += path; 
      } 

      //otherwise it's a relative path, 
      else 
      { 
        //calculate the path to this directory 
        path = ''; 
        parts = loc.pathname.split('/'); 
        parts = parts.splice(0, parts.length - 1); 
        for (var k = 0; k < parts.length; k++) 
        { 
          if (parts[k] !== '') 
          { 
            path += '/' + parts[k]; 
          } 
        } 
        path += '/'; 

        //then add the path and input href to the base URI 
        uri += path + href; 
      } 

      //return the final uri 
      return uri; 
    }
  };
  /*
   * Add the API as global functions on the core jQuery object
   */
  var $ = jsHub.safe('$');
  $.extend($, PluginAPI);
})();


/**
 * Enhancements to jQuery for common functions
 * used in microformat plugins
 * @module data-capture
 * @class MicroformatAPI
 */
/*--------------------------------------------------------------------------*/

(function () {
  var MicroformatAPI = {
  	
    /**
     * Implements value excepting rules for working out the value of a property
     * @method getMicroformatPropertyValue
     * @parmeter last {boolean} optional flag to return only the last source ordered value rather than concatenate multiple values
     * @parameter separator {string} optional sepeartor to use to concatenate multiple values
     * default separator is ', ' if not specified
     * @return The value of the property or null
     */
    getMicroformatPropertyValue: function (last, separator) {
    
      /*
       * Note: jQuery gives an empty string if the element / attribute is not present
       * so testing against this is needed to return null
       */
      var value = null, sources;
	  
      /*
       * <abbr> design pattern (contriversial)
       * ref: http://microformats.org/wiki/abbr-design-pattern
       */
      if (jQuery(this).find('abbr').length === 1) {
        value = jQuery(this).find('abbr').attr('title');
      }
	  
      /*
       * get value from explicit 'value' declarations
       */
      else {
        sources = jQuery(this).find('.value');
        sources = sources.not(sources.find('.value'));
        if (sources.length === 1) {
          value = sources.html();
        }

        /*
         * get value from multiple value elements, e.g. categories or nested formats
         * these are concatenated according to whitespace rules
         */
        else if (sources.length > 1) {
          value = '';
          jQuery.each(sources, function (idx, elm) {
            separator = separator || ' ';
            value += jQuery(elm).text();
            // if this is the last value we don't want an extra separator
            if (idx !== sources.length - 1) {
              value += separator;
            }
          });
        }

        /*
         * get last value from multiple value elements, e.g. categories or nested formats
         * these are overriden according to source order rules
         */
        else if (jQuery(this).text() !== '' && this.length > 1 && last === true) {
          jQuery.each(this, function (idx, elm) {
            value = jQuery(elm).text();
          });
        }
        
        /*
         * finally use the contained text as the value (removes HTML tags)
         */
        else if (jQuery(this).html() !== '') {
          value = jQuery(this).html();
        }
      }
      
      /*
       * trim whitespace at beginning and end of value
       */
      if (value !== null) {
        value = jQuery.trim(value);
        value = value.replace(/\s+/g, ' ');
      }
      
      return value;
    },
    
    /**
     * Implements value excepting rules for working out the value of a property
     * @method excerptMultipleValues
     * @return An array containing all values found for the property or null
     */
    excerptMultipleValues: function (last, separator) {
    
      /*
       * Note: jQuery gives an empty string if the element / attribute is not present
       * so testing against this is needed to return null
       */
      var value = [], node = jQuery(this), sources;
	  
      /*
       * get value from explicit 'value' declarations
       */
      sources = node.find('.value');
      sources = sources.not(sources.find('.value'));
      if (sources.length >= 1) {
        jQuery.each(sources, function (idx, elm) {
          var nodeValue = sources.text().split(/\s+/);
          jQuery.each(nodeValue, function (entry) {
            value.push(entry);
          });
        });
      }

      /*
       * or use the contained text as the value (removes HTML tags).
       * $(node).text() concatenates multiple node text without any separator, so we have
       * to split each value, not the whole string.
       */
      else if (node.text() !== '') {
        node.each(function () {
          jQuery.each(jQuery(this).text().split(/\s+/), function (idx, word) {
            value.push(word);
          });
        });
      }
      
      return (value.length > 0) ? value : null;
    },
    
    /**
     * Implements value class pattern excepting rules for working out the value of a property
     * @method excerptValueClassData
     * @return a JSON object containing the fields <code>type</code> and <code>value</code> if
     * present, or null if no data is found
     */
    excerptValueClassData: function () {
    
      /*
       * Default value if not specified is 'true'
       */
      var type, value, defaultValue = 'true', typeNodes = jQuery(this).find('.type'), valueNodes;
	  
	  
      /*
       * If the type is not specified, then the whole content of the attribute node is the
       * type, and the default value is implied. If the whole content is empty, the attribute 
       * invalid.
       */
      if (typeNodes.length === 0) {
        type = jQuery(this).html();
        if (type === "") {
          return null;
        }
        return {
          type: type,
          value: defaultValue
        };
      }
	  
	  /*
	   * If a single .type node is found, then concatenate .value nodes, or use the default
	   * value if no .value nodes are found.
	   */
	  else if (typeNodes.length === 1) {
        type = typeNodes.html();
        valueNodes = jQuery(this).find('.value');
        valueNodes = valueNodes.not(valueNodes.find('.value'));
        if (valueNodes.length === 0) {
          value = defaultValue;
        } else {
          value = "";
          valueNodes.each(function () {
            value += jQuery(this).html();
          });
        }
        return {
          type: type,
          value: value
        };
      }

      /*
       * If there is more than one .type node, the context is not valid
       */
      return null;
    }
    
  };
  
  /*
   * Add the API as object methods on the any jQuery object
   */
  var $ = jsHub.safe('$');
  $.extend($.fn, MicroformatAPI);
})(jQuery);

/*
 * Data Capture Plug-ins
 *//*--------------------------------------------------------------------------*/

/** 
 * A plugin to create an analytics object from technographic data 
 *
 * @module data-capture
 * @class technographic-plugin
 *//*--------------------------------------------------------------------------*/

/*jslint strict: true */
"use strict";
 
 
(function() {

  /*
   * Metadata about this plug-in for use by UI tools and the Hub
   */
  var metadata = {
    name: 'Technographic Plugin',
    id: 'technographic-plugin',
    version: 0.1,
    author: 'Liam Clancy',
    email: 'liamc@jshub.org',
    vendor: 'jsHub.org',
    type: 'data-capture'
  };
  
  /*
   * First trigger an event to show that the plugin is being registered
   */
  jsHub.trigger("plugin-initialization-start", metadata);
  
  /**
   * Capture technographic data, when triggered by the 'page-view' event
   * @method capture
   * @param event {Object} Config object for the plugin, containing data found by other plugins, and
   * the context (DOM node) to start parsing from.
   * @property metadata
   * @event technographic.StartParsing
   * @event hub.technographicEvent
   * @event technographic.CompleteParsing
   */
  var capture = function capture(event) {
  
    // Notify start lifecycle event
    jsHub.trigger("technographic-parse-start", event);

    // extract hPage from html dom
    var $ = jsHub.safe('$'), document = jsHub.safe('document'), data = event.data, found = {};
    
    /*
     * collect technographic environment data, e.g. screen size, browser plugins, 
     * js version etc
     */ 
	
	// Page URL is the default for hPage.url
	// Force a cast to string as document.location.href is not a string when
	// returned by env.js / rhino
    found.url = document.location.href;
	if (! data.url) {
		data.url = found.url;
		data['url-source'] = "window.location";
	}
	
	// Page title is the default for hPage.title
    found.title = document.title;
	if (! data.title) {
		data.title = found.title;
		data['title-source'] = "document.title";
	}
	
	// Document referrer is the default for hPage.referrer
    found.referrer = document.referrer;
	if (! data.referrer) {
		data.referrer = found.referrer;
		data['referrer-source'] = "document.referrer";
	}
	
    // and send to output plugins
    jsHub.trigger("technographic-parse-complete", data);
	
	return data;
  };
  
  /*
   * Bind the plugin to the Hub to look for hPage microformats and add the data
   * to page view events
   */
  jsHub.bind("page-view", metadata.id, capture);

  /*
   * Last trigger an event to show that the plugin has bene registered
   */
  jsHub.trigger("plugin-initialization-complete", metadata);
  
})();


/** 
 * A plugin to parse the hAuthentication syntax microformat and pass it to the
 * jsHub event hub for delivery.
 *
 * @module data-capture
 * @class hAuthentication-plugin
 */
/*--------------------------------------------------------------------------*/

"use strict";

(function () {

  /*
   * Metadata about this plug-in for use by UI tools and the Hub
   */
  var metadata = {
    name: 'hAuthentication Microformat Parser Plugin',
    id: 'hAuthentication-plugin',
    version: 0.1,
    author: 'Liam Clancy',
    email: 'liamc@jshub.org',
    vendor: 'jsHub.org',
    type: 'microformat'
  };
  
  /*
   * First trigger an event to show that the plugin is being registered
   */
  jsHub.trigger("plugin-initialization-start", metadata);
  
  /**
   * Event driven anonymous function bound to 'page-view'
   * @method parse
   * @param event {Object}    Config object for the plugin.  Currently it is expected to contain a optional "context" property
   * @property metadata
   * @property propertyNames
   * @event  hauthentication-parse-start
   * @event  hauthentication-data-found
   * @event  hauthentication-parse-complete
   */
  var parse = function parse(event) {
  
    // Notify start lifecycle event
    jsHub.trigger("hauthentication-parse-start", event);
    
    /*
     * All local vars set here so nothing is accidentally made global.
     */
    var $, console, context, sources, data;
    
    /*
     * Reference to a 'safe' version of jQuery with restricted access to the DOM (like AdSafe).
     * The plugin should only use this API and will be subject to static analysis
     * to demonstrate this.
     */
    $ = jsHub.safe('$');
    
    /*
     * Pass logging messages via jsHub Hub for remote error reporting, etc
     */
    console = jsHub.logger;
    
    /*
     * Where to start parsing for hAuthentication data
     */
    if (event && event.data && event.data.context) {
      context = event.data.context;
    }
    
    /*
     * Extract the hAuthentication from HTML DOM (not source code), excluding nested hAuthentications
     * If a context is provided this is used as a starting point, else the whole
     * page is parsed as if there were a 'hauthentication' css class on the body element
     */
    sources = $('.hauthentication', context);
	sources = sources.not(sources.find('.hauthentication'));
	console.debug("Found %s .hauthentication islands in context %s", sources.length, context);
    
    /*
     * The parser will populate an object to represent the data according
     * to the parsing rules.
     * This may involve merging data from multiple sources.
     */
    data = {
      authentication: []
    };
    
    /*
     * Most classes and their values can be resolved using the Value Excerpting design-pattern
     */
    var properties = ["user-id", "auth-method"];
    
    
    sources.each(function (idx, elm) {
    
      /*
       * Object for this hAuthentication
       */
      var hauthentication = {};
	  var root = $(elm);
      
      /*
       * get the property data using class names
       */
      $.each(properties, function(count, name) {
        var node, value, classname = '.' + name;
        // exclude properties in nested microformats
        node = root.find(classname);
		node = node.not(node.find('.hauthentication'));
		value = node.getMicroformatPropertyValue();
        if (value !== null) {
          hauthentication[name] = value;
        }
      });
            
      jsHub.trigger("hauthentication-data-found", {
        count: idx + 1,
        element: elm,
        data: hauthentication
      });

      // issue an authentication event to be logged
      jsHub.trigger("authentication", hauthentication);
      
	  // append this event to the summary
	  data.authentication.push(hauthentication);
    });
    
    jsHub.trigger("hauthentication-parse-complete", data);
    
    // don't merge into source event, authentication data is not part of the
	// page view event, just triggered by it
    return;
  };
  
  /*
   * Bind the plugin to the Hub to look for hAuthentication microformats and add the data
   * to page view events
   */
  jsHub.bind("page-view", "hAuthentication-plugin", parse);
  jsHub.bind("content-updated", "hAuthentication-plugin", parse);
    
  /*
   * Last trigger an event to show that the plugin has bene registered
   */
  jsHub.trigger("plugin-initialization-complete", metadata);
  
})();

/** 
 * A plugin to parse the hPage syntax microformat and pass it to the
 * jsHub event hub for delivery.
 *
 * @module data-capture
 * @class hPage-plugin
 */
/*--------------------------------------------------------------------------*/

"use strict";

(function() {

  /*
   * Metadata about this plug-in for use by UI tools and the Hub
   */
  var metadata = {
    name: 'hPage Microformat Parser Plugin',
    id: 'hPage-plugin',
    version: 0.1,
    author: 'Liam Clancy',
    email: 'liamc@jshub.org',
    vendor: 'jsHub.org',
    type: 'data-capture'
  };
  
  /*
   * First trigger an event to show that the plugin is being registered
   */
  jsHub.trigger("plugin-initialization-start", metadata);
  
  /**
   * Event driven anonymous function bound to 'page-view'
   * @method hPage-plugin-capture
   * @param event {Object}    Config object for the plugin.  Currently it is expected to contain a optional "data.context" property
   * @property metadata
   * @property propertyNames
   * @event  hpage-parse-start
   * @event  hpage-data-found
   * @event  hpage-parse-complete
   */
  var parse = function parse(event) {
  
    // Notify start lifecycle event
    jsHub.trigger("hpage-parse-start", event);
    
    /*
     * All local vars set here so nothing is accidentally made global.
     */
    var $, console, context, sources, hPage, properties;
    
    /*
     * Reference to a 'safe' version of jQuery with restricted access to the DOM (like AdSafe).
     * The plugin should only use this API and will be subject to static analysis
     * to demonstrate this.
     */
    $ = jsHub.safe('$');
    
    /*
     * Pass logging messages via jsHub Hub for remote error reporting, etc
     */
    console = jsHub.logger;
    
    /*
     * Where to start parsing for hPage data
     */
    if (event && event.data && event.data.context) {
      context = event.data.context;
    }
    
    /*
     * Extract the hPage from HTML DOM (not source code), excluding nested hPages
     * If a context is provided this is used as a starting point, else the whole
     * page is parsed as if there were a 'hpage' css class on the body element
     */
    sources = $('.hpage', context);
    sources = sources.not(sources.find('.hpage'));
    
    /*
     * The parser will populate an object to represent all the hPage data found in 
     * the context, according to the parsing rules.
     * This may involve merging data from multiple sources.
     */
    hPage = {};
    
    /*
     * Most classes and their values can be resolved using the Value Excerpting design-pattern
     */
    properties = ["version", "name", "title", "referrer", "type", "lifetime", "fragment"];
    
    
    sources.each(function(idx, elm) {
    
      /*
       * Object for this hpage
       */
      var nodeData = {};
      
      // TODO resolve includes first
      
      // jQuery gives an empty string if the element / attribute is not present so cascade through values
	  // to defaults
      var root = $(elm);
      
      /*
       * get the property data with failover to inherited or technographic data supplied by another plugin
       */
      // use the array of class names
      // TODO this can be refactored to the API
      $.each(properties, function(count, name) {
        var node, value, classname = '.' + name;
        // exclude properties in nested hPages
        node = root.find(classname);
        node = node.not(node.find('.hpage'));
        value = node.getMicroformatPropertyValue(true);
        if (value !== null) {
          nodeData[name] = value;
          nodeData[name + "-source"] = metadata.id;
        }
      });

      /*
       * Merge the data for the singular fields from this hPage node, into the hPage for 
       * the whole context
       */
      // TODO: use data-indexes to override source order 
      $.extend(true, hPage, nodeData);
      
      // custom string handling for some properties, e.g. multi value properties
      var categories = [], categoryNodes = $('.category', elm);
      categoryNodes = categoryNodes.not(categoryNodes.find('.hpage .category'));
      categories = categoryNodes.excerptMultipleValues();
      if (categories !== null) {
        nodeData.category = categories;
        nodeData['category-source'] = metadata.id;
        // the categories for the overall hPage are the union of what was found previously
        // and in this node. NB $.unique uses identity not value so it doesn't strip duplicate strings
		hPage.category = (hPage.category || []);
		$.each(categories, function (idx, entry) {
          if ($(hPage.category).index(entry) === -1) {
		  	hPage.category.push(entry);
		  }
		});
      }
	  
	  // attributes use value class pattern http://microformats.org/wiki/value-class-pattern
	  // we can have multiple attributes, each one has a type and a value
	  // output in the data is an array: [ {name:value}, {name:value} ]
	  var attributes = $('.attribute', elm);
	  nodeData.attributes = [];
	  attributes.each(function () {
        var attribute = $(this).excerptValueClassData();
        if (attribute !== null) {
          nodeData.attributes.push(attribute);
          // the attributes for the overall hPage are the union of what was found previously
          // and in this node. 
          hPage.attributes = (hPage.attributes || []);
          for (var found = false, i = 0; i < hPage.attributes.length; i++) {
            if (hPage.attributes[i].type == attribute.type && hPage.attributes[i].value == attribute.value) {
              found = true;
              break;
            }
          }
          if (!found) {
            hPage.attributes.push(attribute);
          }
        }
      });
      
      jsHub.trigger("hpage-node-found", {
        count: idx + 1,
        element: elm,
        data: nodeData
      });
      
    });
    
	/*
	 * The hPage for the context is only valid if the required fields are all present.
	 * If not, don't put any of the data into the page view event.
	 */
	if (hPage.name) {
      jsHub.trigger("hpage-found", {
        context: context,
        hpage: hPage
      });
    } else {
	  hPage = null;
	}
	
    // Fire a debug event
    jsHub.trigger("hpage-parse-complete");
    return hPage;
  };
  
  /*
   * Bind the plugin to the Hub to look for hPage microformats and add the data
   * to page view events
   */
  jsHub.bind("page-view", metadata.id, parse);
  
  /*
   * Bind the plugin to the Hub to look for hPage microformats and add data to
   * page view events when AJAX loads a new partial page view
   */
  jsHub.bind("content-updated", metadata.id, parse);
  
  /*
   * Last trigger an event to show that the plugin has bene registered
   */
  jsHub.trigger("plugin-initialization-complete", metadata);
  
})();

/** 
 * A plugin to parse the hProduct syntax microformat and pass it to the
 * jsHub event hub for delivery.
 *
 * @module data-capture
 * @class hProduct-plugin
 */
/*--------------------------------------------------------------------------*/

"use strict";

(function () {

  /*
   * Metadata about this plug-in for use by UI tools and the Hub
   */
  var metadata = {
    name: 'hProduct Microformat Parser Plugin',
	id: 'hProduct-plugin',
    version: 0.1,
    author: 'Liam Clancy',
    email: 'liamc@jshub.org',
    vendor: 'jsHub.org',
    type: 'microformat'
  };
  
  /*
   * First trigger an event to show that the plugin is being registered
   */
  jsHub.trigger("plugin-initialization-start", metadata);
  
  /**
   * Event driven anonymous function bound to 'page-view'
   * @method parse
   * @param event {Object}    Config object for the plugin.  Currently it is expected to contain a optional "context" property
   * @property metadata
   * @property propertyNames
   * @event  hproduct-parse-start
   * @event  hproduct-data-found
   * @event  hproduct-parse-complete
   */
  var parse = function parse(event) {
  
    // Notify start lifecycle event
    jsHub.trigger("hproduct-parse-start", event);
    
    /*
     * All local vars set here so nothing is accidentally made global.
     */
    var $, console, context, sources, data;
    
    /*
     * Reference to a 'safe' version of jQuery with restricted access to the DOM (like AdSafe).
     * The plugin should only use this API and will be subject to static analysis
     * to demonstrate this.
     */
    $ = jsHub.safe('$');
    
    /*
     * Pass logging messages via jsHub Hub for remote error reporting, etc
     */
    console = jsHub.logger;
    
    /*
     * Where to start parsing for hAuthentication data
     */
    if (event && event.data && event.data.context) {
      context = event.data.context;
    }
    
    /*
     * Extract the hProduct nodes from HTML DOM (not source code), excluding nested hProducts
     * If a context is provided this is used as a starting point, else the whole
     * page is parsed to look for elements with a 'hproduct' css class
     */
    sources = $('.hproduct', context);
	sources = sources.not(sources.find('.hproduct'));
    //console.debug("Found %s .hproduct islands in context %s", sources.length, context);
    
    /*
     * The parser will populate an object to represent the data according
     * to the parsing rules.
     * This may involve merging data from multiple sources.
     */
    data = {
      products : []
	};
    
    /*
     * Most classes and their values can be resolved using the Value Excerpting design-pattern
     */
    // TODO support currency design pattern
    var properties = ["n", "price", "quantity"];
    
    
    sources.each(function (idx, elm) {
    
      /*
       * Object for this hProduct
       */
      var hproduct = {};
	  var root = $(elm);
      
      /*
       * get the property data from class names
       */
      $.each(properties, function(count, name) {
        var node, value, classname = '.' + name;
        // exclude properties in nested microformats
        node = root.find(classname);
		node = node.not(node.find('.hproduct'));
		value = node.getMicroformatPropertyValue();
        if (value !== null) {
          hproduct[name] = value;
        }
      });
      
      jsHub.trigger("hproduct-data-found", {
        count: idx + 1,
        element: elm,
        data: hproduct
      });
      
      // issue an product view event to be logged
      jsHub.trigger("product-view", hproduct);
      
      /*
       * Append this hProduct object into the data to return
       */
      data.products.push(hproduct);
    });
    
    jsHub.trigger("hproduct-parse-complete", data);
    
    return data;
  };
  
  /*
   * Bind the plugin to the Hub to look for hAuthentication microformats and add the data
   * to page view events
   */
  jsHub.bind("page-view", metadata.id, parse);
    
  /*
   * Last trigger an event to show that the plugin has bene registered
   */
  jsHub.trigger("plugin-initialization-complete", metadata);
  
})();

/** 
 * A plugin to parse the hPurchase syntax microformat and pass it to the
 * jsHub event hub for delivery.
 *
 * @module data-capture
 * @class hPurchase-plugin
 */
/*--------------------------------------------------------------------------*/

"use strict";

(function() {

  /*
   * Metadata about this plug-in for use by UI tools and the Hub
   */
  var metadata = {
    name: 'hPurchase Microformat Parser Plugin',
	id: 'hPurchase-plugin',
    version: 0.1,
    author: 'Liam Clancy',
    email: 'liamc@jshub.org',
    vendor: 'jsHub.org',
    type: 'microformat'
  };
  
  /*
   * First trigger an event to show that the plugin is being registered
   */
  jsHub.trigger("plugin-initialization-start", metadata);
  
  /**
   * Event driven anonymous function bound to 'page-view'
   * @method parse
   * @param event {Object}    Config object for the plugin.  Currently it is expected to contain a optional "context" property
   * @property metadata
   * @property propertyNames
   * @event  hpurchase-parse-start
   * @event  hpurchase-data-found
   * @event  hpurchase-parse-complete
   */
  var parse = function parse(event) {
  
    // Notify start lifecycle event
    jsHub.trigger("hpurchase-parse-start", event);
    
    /*
     * All local vars set here so nothing is accidentally made global.
     */
    var $, console, context, sources, data;
    
    /*
     * Reference to a 'safe' version of jQuery with restricted access to the DOM (like AdSafe).
     * The plugin should only use this API and will be subject to static analysis
     * to demonstrate this.
     */
    $ = jsHub.safe('$');
    
    /*
     * Pass logging messages via jsHub Hub for remote error reporting, etc
     */
    console = jsHub.logger;
    
    /*
     * Where to start parsing for hAuthentication data
     */
    if (event && event.data && event.data.context) {
      context = event.data.context;
    }
    
    /*
     * Extract the hAuthentication from HTML DOM (not source code), excluding nested hAuthentications
     * If a context is provided this is used as a starting point, else the whole
     * page is parsed as if there were a 'hauthentication' css class on the body element
     */
    sources = $('.hpurchase', context);
    sources = sources.not(sources.find('.hpurchase'));
    
    /*
     * The parser will populate an object to represent the data according
     * to the parsing rules.
     * This may involve merging data from multiple sources.
     */
    data = {};
    
    /*
     * Most classes and their values can be resolved using the Value Excerpting design-pattern
     */
    var properties = ["product-id", "cart-id", "cart-price", "discount", "shipping-price", "taxes", "net-price", "payment-method", "status"];
    
    
    sources.each(function(idx, elm) {
    
      /*
       * Object for this hPurchase
       */
      var hpurchase = {};
      var root = $(elm);
      
      /*
       * get the property data and its visibility
       */
      // use the array of class names 
      // TODO this can be refactored to the API
      $.each(properties, function(count, name) {
        var value, visibility, classname = '.' + name;
        // exclude properties in nested microformats
        node = root.find(classname);
		node = node.not(node.find('.hpurchase'));
		value = node.getMicroformatPropertyValue();
        if (value !== null) {
          hpurchase[name] = value;
        }
      });
      
      jsHub.trigger("hpurchase-data-found", {
        count: idx + 1,
        element: elm,
        hpurchase: hpurchase
      });
      
      // issue an checkout event to be logged  
      jsHub.trigger("checkout", hpurchase);
      
    });
    
    jsHub.trigger("hpurchase-parse-complete", data);
    
    /*
     * Don't merge the data, the purchase is a separate event from the page view
     * the triggered the parsing.
     */
    return;
  };
  
  /*
   * Bind the plugin to the Hub to look for hAuthentication microformats and add the data
   * to page view events
   */
  jsHub.bind("page-view", metadata.id, parse);
  
  /*
   * Last trigger an event to show that the plugin has bene registered
   */
  jsHub.trigger("plugin-initialization-complete", metadata);
  
})();






/*
 * Data Transport Plug-ins
 *//*--------------------------------------------------------------------------*/

/** 
 * A sample plugin to capture jsHub events and send them to a server via a 
 * single pixel gif image.
 * 
 * You can use this as a starting point to customize the data to generate a
 * URL in the format expected by your server.
 *
 * @module data-transport
 * @class sample-get-plugin
 */
/*--------------------------------------------------------------------------*/

"use strict";

(function() {

  /**
   * Metadata about this plug-in for use by UI tools and the Hub
   */
  var metadata = {
  	id: 'sample-get-plugin',
    name: 'Sample HTTP GET transport plugin',
    version: 0.1,
    author: "Fiann O'Hagan",
    email: 'fiann.ohagan@jshub.org',
    vendor: 'jsHub'
  },  
  
  /**
   * The events that will be captured and sent to the server
   */
  boundEvents = ['page-view', 'authentication', 'checkout'],  
  
  /**
   * Event driven anonymous function bound to 'page-view'
   * @method send
   * @param event {Object} the event to serialize and send to the server
   * @property metadata
   */
  send = function(event) {
  
    jsHub.logger.group("Sample get transport: sending '%s' event", event.type);
    
    /**
     * Account ID for the client
     * Note that the field <code>account_id</code> in the string is replaced
     * when the tag is generated.
     */
    var account = "1234";
    
    /**
     * URL to dispatch to the server
     * Note that the field <code>server_url</code> in the string is replaced
     * when the tag is generated.
     */
    var url = "http://jshub.org/blackhole/";
	url = url.substring(url.length-1, url.length) == "/" ? "" : "/";
	url += "account/" + account;
    
	/**
	 * Each field in this object is serialized as a name=value pair in the query
	 * string of the URL that is created for the image request.
	 * You can put any data in this object. If the value of a field is an array,
	 * then it will be used to generate multiple name=value pairs in the resulting
	 * query string.
	 */
    var data = {
      sender: metadata.name + " v" + metadata.version,
      pagename: event.data.name
    };
    
    // dispatch via API function
    jsHub.dispatchViaImage(url, data);
    jsHub.logger.groupEnd();
  };
  
  /*
   * Bind the plugin to the Hub so as to run when events we are interested in occur
   */
  jsHub.bind("page-view", metadata.id, send);
  
  // lifecycle notification
  jsHub.trigger("plugin-initialization-complete", metadata);
})();




