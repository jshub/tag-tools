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
    GeneratedBy: "http://work.scribble.local/akita-on-rails/tag_configurations",
    Configuration: "Tag Inspector (dev) (revision 2, debug)",
    Site: "For tag inspector UI dev. Removed output plugin as it hangs" 
  };
  this.jsHub = this.jsHub || {};
  for (var field in tag_data) {
  	this.jsHub[field] = tag_data[field];
  }
})();

/**
 * Core hub functionality for ETL tag
 * @module hub
 * @class ETL
 *//*--------------------------------------------------------------------------*/

// JSLint options
/*global jQuery */
"use strict";

(function ($) {
  
  // global namespace
  var global = this, 

    // instance of ETL object
    ETL,

    /**
     * Wrap Firebug console for logging
     * @class Logger
     * @for ETL
     */
    // TODO: Enable sending of logging data to remote servers
    Logger = function () {
      if (window.console) {
        this.log = console.log;
        this.warn = console.warn;
        this.error = console.error;
        // Safari's console does not support some functions
        if (console.group && console.groupEnd) {
          this.debug = console.debug;
		      this.group = console.group;
          this.groupEnd = console.groupEnd;
		    } else {
          this.debug = function () {};
          this.group = function () {};
          this.groupEnd = function () {};
        }
      } else {
        this.debug = function () {};
        this.log = function () {};
        this.warn = function (msg) {
          alert("WARN: " + msg);
        };
        this.error = function (msg) {
          alert("ERROR: " + msg);
        };      
        this.group = function () {};
        this.groupEnd = function () {};
      }
    },

    /**
     * Core event dispatcher functionality of the hub
     * @class EtlHub
     * @property listeners
     */
    EtlHub = function () {

      // stores functions listening to various events
      var listeners = {},
	  
	  /** Plugins that have registered with the hub. */
	  plugins = [],

      /**
       * a listener has an authentication token and a callback
       * @class Listener
       * @for EtlHub
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
       * @for EtlHub
       * @param name {string}
       * @param data {object}
       * @param timestamp {number} an optional timestamp value. 
       */
      Event = function (name, data, timestamp) {
        this.type = name;
    		this.timestamp = timestamp || ETL.safe.getTimestamp();
        this.data = data;
      },
  
      // the firewall filters event data before passing to listeners
      /**
       * A simple event object
       * @class EventDispatcher
       * @for EtlHub
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
  	        ETL.logger.debug("Sending event %s to listener %s with data", name, listener.token, filteredData);
  	        evt = new Event(name, filteredData);
  	        extraData = listener.callback(evt);
      			// merge any additional data found by the listener into the data
      			if (extraData) {
    		      $.extend(true, data, extraData);
    		      ETL.logger.debug("Listener %s added data, event is now ", listener.token, data);
      			}
  	      }
        };
      },
    
      firewall = new EventDispatcher(); 

      /**
       * Bind a listener to a named event.
       * @method bind
       * @for ETL
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
       * @for ETL
       * @param eventName {string}
       * @param data {object}
       */
      this.trigger = function (eventName, data) {
        ETL.logger.group("Event %s triggered with data", eventName, (data || "'none'"));
        // empty object if not defined
        data = data || {};
        // find all registered listeners for the specific event, and for "*"
        var registered = $.merge(listeners[eventName] || [], listeners["*"] || []);
        for (var i = 0; i < registered.length; i++) {
          firewall.dispatch(eventName, registered[i], data);
        }
        ETL.logger.groupEnd();
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
     * @class EtlFormTransport
     */
    EtlFormTransport = function () {
  
      /**
       * Send a request to the server as a POST or GET method form request. 
       * <p>The data is sent via a hidden iframe which is dynamically created in the page, so that the
       * form submission does not interfere with the history and behaviour of the back button in 
       * the browser.
       * <p>This function does not perform any serialization. It is the responsibility of the data
       * output plugins to prepare the data in the format required by their server.
       * @method dispatch
       * @for EtlFormTransport
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
        ETL.logger.group("EtlFormTransport: dispatch(" + url + ") entered");
        var form, 
    			appendField,
          iframe, 
          iframeID, 
          field, 
      		array,
    			i;
        
        /*
         * This data transport only supports POST or GET
         * TODO: validate url for security reasons, reject javascript: protocol etc
         */
        if (! (/^POST|GET$/i.test(method)) || ! url) {
          ETL.logger.error("Method (" + method + ") or url (" + url + ") was not defined correctly");
    		  ETL.logger.groupEnd();
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
        ETL.logger.log("Created form:", form[0]);

        // Create the iframe from as string via jQuery
        iframeID = "etl-iframe-" + ETL.safe.getTimestamp();
        iframe = $('<iframe src="javascript:void(0)" name="' + iframeID + '" id="' + iframeID + '" '
          + 'style="display: none !important; width: 0px; height: 0px;" class="etl-iframe"></iframe>');
      
        $('body').append(iframe);
        ETL.logger.log("Created iframe:", iframe[0]);
    
        // Set the iframe as the submission target of the form, tied together by a timestamp
        form.attr("target", iframeID);

    		// And send it ...
        form.submit();
        ETL.logger.log("Form submitted");
        ETL.trigger("form-transport-sent", {
        	node : iframeID
        });
        ETL.logger.groupEnd();
        return iframeID;
      };
    };

  // ETL object in global namespace
  ETL = global.ETL = new EtlHub();

  // Initialise a logger instance  
  ETL.logger = new Logger();
  
  // Create an object to return safe instances of important variables
  ETL.safe = function (obj) {
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
        referrer : document.referrer || null,
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
  ETL.safe.getTimestamp = function () {
    return new Date().getTime();
  };
  
  /** 
   * Convert an object to a JSON representation
   */
  ETL.safe.toJSONString = function (object) {
  	return JSON.stringify(object, null, 2);
  };

  // Initialise lifecycle triggers
  ETL.logger.log("Hub initialized, triggering page lifecycle events");
  $(document).ready(function () {
  	// Can be used to pre-configure data at page level if necessary
  	ETL.trigger("data-capture-start");

    // Data is ready to be parsed by Data Capture plugins
    ETL.trigger("page-view");

  	// Data capture phase is complete
    ETL.trigger("data-capture-complete");
  });

  ETL.dispatchViaForm = (new EtlFormTransport()).dispatch;
})(jQuery);

/**
 * Enhancements to jQuery for common functions 
 * used in plugins
 * @module data-capture
 * @class PluginAPI
 *//*--------------------------------------------------------------------------*/

/*jslint strict: true */
/*global ETL, jQuery, Date */
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
      var loc = ETL.safe('document').location; 

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
  var $ = ETL.safe('$');
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
      var value = null, sources, fullvalue = '';
	  
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
          value = sources.text();
        }

        /*
         * get value from multiple value elements, e.g. categories or nested formats
         * these are concatenated according to whitespace rules
         */
        else if (sources.length > 1) {
          jQuery.each(sources, function (idx, elm) {
            separator = separator || ',';
            fullvalue += jQuery(elm).text();
            // if this is the last value we don't want an extra separator
            if (idx !== sources.length - 1) {
              fullvalue += separator;
            }
          });
          value = fullvalue;
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
        else if (jQuery(this).text() !== '') {
          value = jQuery(this).text();
        }
      }
      
      /*
       * trim whitespace at beginning and end of value
       */
      // TODO: normalize whitespace within the value
      if (value !== null) {
        value = jQuery.trim(value);
      }
      
      return value;
    },
    
    /**
     * Implements visibility rules for the value of a property
     * @method getMicroformatVisibilityValue
     * @param root {string} The visibility of the root element for the property
     * @return The visibility of the property or *
     */
    getMicroformatVisibilityAttribute: function (root) {
      /*
       * By default the visibility is open
       */
      var visibility = '*';
      /*
       * get the visibility of the property or inherit the default on the root element
       */
      visibility = jQuery(this).attr("data-visibility") || root || visibility;
      visibility = jQuery.trim(visibility);
      
      // TODO: validate and tokenise the URI values and return in an array or similar
      
      return visibility;
    }
    
  };
  
  /*
   * Add the API as object methods on the any jQuery object
   */
  var $ = ETL.safe('$');
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
 
// do not execute unless required dependencies are present
/*global window */
if (window.jQuery && window.ETL) {
  (function () {
    /**
     * Event driven anonymous function bound to 'page.viewEvent'
     * @method capture
     * @param payload {Object}    Config object for the plugin.
     * @property metadata
     * @event technographic.StartParsing
     * @event hub.technographicEvent
     * @event technographic.CompleteParsing
     */  

    var capture = function capture(payload) {

      /*
       * Metadata about this plug-in for use by UI tools and the Hub
       */
      var metadata = {
        name: 'Technographic Plugin',
        version: 0.1,
        author: 'Liam Clancy',
        email: 'liamc@jshub.org',
        vendor: 'jsHub.org'
      };
               
      // note that ETL is a valid global variable in the plugin
      ETL.trigger("technographic.StartParsing", metadata);
      // extract hPage from html dom
      var $ = ETL.safe('$'),
        scope = (function () {
          if (payload && payload.nodeType) {
            // it's a DOM node
            // TODO this has to be safe
            return payload;
          } else if (payload && payload.node) {
            return payload.node;
          }
        })(),
        browser = ETL.safe('document'),
        browserData = {};
    
      /* 
       * collect technographic environment data, e.g. screen size, browser plugins, js version etc or call an existing Analytics tag? 
       */
      browserData.url = browserData.url || ETL.safe('document').location.href;
      browserData.referrer = browserData.referrer || ETL.safe('document').referrer;
    
      // and send to output plugins
      ETL.trigger("hub.technographicEvent", browserData);
    
         
      ETL.trigger("technographic.CompleteParsing");

    };
  
    // Register the code to run when a dom.ready event is fired, 
    // note may have a different semantic meaning in a screen reader, mobile browser etc
    ETL.bind("dom.ready", "technographic-plugin", capture);
  })();
}



/** 
 * A plugin to parse the hPage syntax microformat and pass it to the
 * ETL event hub for delivery.
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
  ETL.trigger("plugin-initialization-start", metadata);
  
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
    ETL.trigger("hpage-parse-start", event);
    
    /*
     * All local vars set here so nothing is accidentally made global.
     */
    var $, console, context, sources, data, properties;
    
    /*
     * Reference to a 'safe' version of jQuery with restricted access to the DOM (like AdSafe).
     * The plugin should only use this API and will be subject to static analysis
     * to demonstrate this.
     */
    $ = ETL.safe('$');
    
    /*
     * Pass logging messages via ETL Hub for remote error reporting, etc
     */
    console = ETL.logger;
    
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
    sources = $('.hpage:visible', context);
    sources = sources.not(sources.find('.hpage'));
    
    /*
     * The parser will populate an object to represent the data according
     * to the parsing rules.
     * This may involve merging data from multiple sources.
     */
    data = {};
    
    /*
     * Most classes and their values can be resolved using the Value Excerpting design-pattern
     */
    properties = ["name", "title", "referrer", "type", "lifetime", "fragment", "categories"];
    
    
    sources.each(function(idx, elm) {
    
      /*
       * Object for this hpage
       */
      var hpage = {};
      
      // TODO resolve includes first
      
      // jQuery gives an empty string if the element / attribute is not present so cascade through values to defaults
      // root visibility used for all elements unless set explicitly
      var root = $(elm);
      var rootVisibility = root.getMicroformatVisibilityAttribute();
      
      /*
       * get the property data and its visibility with failover to inherited or technographic data
       * if required and not explicitly defined
       */
      // use the array of class names
      // TODO this can be refactored to the API
      $.each(properties, function(count, name) {
        var node, value, visibility, classname = '.page-' + name;
        // exclude properties in nested hPages
        node = root.find(classname);
        node = node.not(node.find('.hpage'));
        value = node.getMicroformatPropertyValue(true);
        if (value !== null) {
          hpage['page-' + name] = value;
          visibility = node.getMicroformatVisibilityAttribute(rootVisibility);
          hpage['page-' + name + "-visibility"] = visibility;
          hpage['page-' + name + "-source"] = metadata.id;
        }
      });
      
      // custom string handling for some properties, e.g. multi value properties
      var categories = $('.page-category', elm);
      categories = categories.not(categories.find('.hpage .page-category'));
      hpage['page-category'] = categories.getMicroformatPropertyValue(false, ',');
      hpage['page-category-visibility'] = hpage['page-category-visibility'] || rootVisibility;
      hpage['page-category-source'] = metadata.id;
      if (hpage['page-category'] === null) {
        delete hpage['page-category'];
        delete hpage['page-category-visibility'];
        delete hpage['page-category-source'];
      }
      
      // special value cases, where we can fail over to the environment successfully
      if (! hpage['page-title']) {
        hpage['page-title'] = ETL.safe('document').title;
        hpage['page-title-source'] = 'document.title';
	  }
      hpage['page-title-visibility'] = hpage['page-title-visibility'] || rootVisibility;
      if (!hpage['page-referrer']) {
        hpage['page-referrer'] = ETL.safe('document').referrer;
        hpage['page-referrer-source'] = 'document.referrer';
      }
      hpage['page-referrer-visibility'] = hpage['page-referrer-visibility'] || rootVisibility;
      
      ETL.trigger("hpage-data-found", {
        count: idx + 1,
        element: elm,
        hpage: hpage
      });
      
      /*
       * Merge this hPage object into the data to return
       */
      // TODO: use data-indexes to override source order 
      $.extend(true, data, hpage);
    });
    
    ETL.trigger("hpage-parse-complete", data);
    
    // data to merge into the source event
    return data;
  };
  
  /*
   * Bind the plugin to the Hub to look for hPage microformats and add the data
   * to page view events
   */
  ETL.bind("page-view", metadata.id, parse);
  
  /*
   * Bind the plugin to the Hub to look for hPage microformats and add data to
   * page view events when AJAX loads a new partial page view
   */
  ETL.bind("content-updated", metadata.id, parse);
  
  /*
   * Last trigger an event to show that the plugin has bene registered
   */
  ETL.trigger("plugin-initialization-complete", metadata);
  
})();


/** 
 * A plugin to parse the hProduct syntax microformat and pass it to the
 * ETL event hub for delivery.
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
    version: 0.1,
    author: 'Liam Clancy',
    email: 'liamc@jshub.org',
    vendor: 'jsHub.org',
    type: 'data-capture'
  };
  
  /*
   * First trigger an event to show that the plugin is being registered
   */
  ETL.trigger("plugin-initialization-start", metadata);
  
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
    ETL.trigger("hproduct-parse-start", event);
    
    /*
     * All local vars set here so nothing is accidentally made global.
     */
    var $, console, context, sources, data;
    
    /*
     * Reference to a 'safe' version of jQuery with restricted access to the DOM (like AdSafe).
     * The plugin should only use this API and will be subject to static analysis
     * to demonstrate this.
     */
    $ = ETL.safe('$');
    
    /*
     * Pass logging messages via ETL Hub for remote error reporting, etc
     */
    console = ETL.logger;
    
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
    sources = $('.hproduct:visible', context);
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
      
      // TODO resolve includes first
      
      // jQuery gives an empty string if the element / attribute is not present so cascade through values to defaults
      // root visibility used for all elements unless set explicitly
	  var root = $(elm);
      var rootVisibility = root.getMicroformatVisibilityAttribute();
      
      /*
       * get the property data and its visibility
       */
      // use the array of class names 
      // TODO this can be refactored to the API
      $.each(properties, function(count, name) {
        var node, value, visibility, classname = '.' + name;
        // exclude properties in nested microformats
        node = root.find(classname);
		node = node.not(node.find('.hproduct'));
		value = node.getMicroformatPropertyValue();
        if (value !== null) {
          hproduct[name] = value;
          visibility = node.getMicroformatVisibilityAttribute(rootVisibility);
          hproduct[name + "-visibility"] = visibility;
        }
      });
      
      ETL.trigger("hproduct-data-found", {
        count: idx + 1,
        element: elm,
        data: hproduct
      });
      
      // issue an product view event to be logged
      ETL.trigger("product-view", hproduct);
      
      /*
       * Append this hProduct object into the data to return
       */
      data.products.push(hproduct);
    });
    
    ETL.trigger("hproduct-parse-complete", data);
    
    return data;
  };
  
  /*
   * Bind the plugin to the Hub to look for hAuthentication microformats and add the data
   * to page view events
   */
  ETL.bind("page-view", "hProduct-plugin", parse);
    
  /*
   * Last trigger an event to show that the plugin has bene registered
   */
  ETL.trigger("plugin-initialization-complete", metadata);
  
})();






/** 
 * A plugin to capture markup data from Google Analytics markup on the page.
 *
 * @module data-capture
 * @class google-analytics-markup-plugin
 */
/*--------------------------------------------------------------------------*/

/*jslint strict: true */
"use strict";

// do not execute unless required dependencies are present
/*global window */
if (window.jQuery && window.ETL) {
  (function() {
  
    /*
     * Metadata about this plug-in for use by UI tools and the Hub
     */
    var metadata = {
      name: 'Google Analytics Markup Plugin',
	  id: 'google-analytics-markup',
      version: '0.1 experimental',
      author: "Fiann O'Hagan",
      email: 'fiann.ohagan@jshub.org',
      vendor: 'jsHub.org',
      type: 'data-capture'
    };
    
    /*
     * First trigger an event to show that the plugin is being registered
     */
    ETL.trigger("plugin-initialization-start", metadata);
    
    /**
     * Event driven anonymous function bound to 'page.viewEvent'
     * @method capture
     * @param event {Object}    Event object with current data for the page view.
     * @property metadata
     * @event google-analytics-parse-start
     * @event google-analytics-parse-complete
     */
    var capture = function capture(event) {
		
      // All local vars set here so nothing is accidentally made global.
      var $, context, pagenames, data, previous;
		
      // extract GA <script> block from html dom
      $ = ETL.safe('$');
	  if (event && event.data && event.data.context) {
        context = event.data.context;
      }
 
	  // initially empty
	  pagenames = [];
	  
	  // data we find here goes back into the event.data field
	  data = event.data || {};
	  
      // we need to know if there is already a value defined
      previous = {
        "value": data['page-name'],
        "source": data['page-name-source']
      };
      
      // note that ETL is a valid global variable in the plugin
      ETL.trigger("google-analytics-parse-start");
      
      // if there is a GA script node, then look for the page name being sent from it
      $('script', context).each(function() {
        var source = $(this).text(), matches, pagename;
        if (typeof source === 'string') {
          matches = source.match(/pageTracker\._trackPageview\((.*)\);/);
          if (matches) {
            if (matches[1].match(/^\s*$/)) {
              // _trackPageview() without args records the page url
			  pagename = ETL.safe('document').location.pathname;
              data['page-name-source'] = 'location.pathname';
            } else {
              // otherwise it has been explicitly specified
			  pagename = matches[1].replace(/^\s+/, '').replace(/\s+$/, '');
	          pagename = pagename.match(/^(['"]?)(.+)(\1)$/)[2];
              data['page-name-source'] = metadata.id;
            }
            pagenames.push(pagename);
            // last value specified wins as the output
            data['page-name'] = pagename;
          }
        }
      });

      
      // we want to raise a warning if we have found more than page name
      // it is also a warning if the field has been previously set to a different value
      // by another parsing plugin
      if ((pagenames.length > 1) || (pagenames.length > 0 && previous.value)) {
        ETL.trigger("duplicate-value-warning", {
          "source": metadata.name,
          "fields": {
            "page-name": {
              "previous": previous,
              "found": pagenames.join(", ")
            }
          }
        });
		data.warnings = data.warnings || {};
        data.warnings[metadata.id] = pagenames.join(", ");
        if (previous.source) {
          data.warnings[previous.source] = data.warnings[previous.value];
        }
      }
	  
      ETL.trigger("google-analytics-parse-complete", pagenames);
	  
	  return data;
    };
    
    // Register the code to run when a page-view event is fired
    ETL.bind("page-view", metadata.id, capture);
	
    
    ////////// Inline events //////////////
    
    /**
     * Create a proxy that intercepts calls to the pageTracker._trackPageview() function.
     * The proxy creates a jsHub event, and then passes on the message to the underlying
     * GA tracker.
     * Bound to the data-capture-start event.
     * @method initializeInlineTracking
     * @event google-analytics-initialize-tracking
     */
    var initializeInlineTracking = function initializeInlineTracking() {
      ETL.trigger("google-analytics-initialize-tracking", {
        _gat: window._gat
      });
      if (window._gat) {
        var createProxyTracker = function(realPageTracker) {
          var proxy = {};
          for (field in realPageTracker) {
		  	if (field) { // we really do want everything, but jslint enforces this 
              proxy[field] = realPageTracker[field];
			}
          }
          
          // Intercept the call to the GA tag, record it, then pass it on
          proxy._trackPageview = function(pagename) {
            var data = {
			  "context": "#do-not-drill-down-on-this-event",
              "page-name": pagename
            };
            ETL.trigger("page-view", data);
            realPageTracker._trackPageview(pagename);
          };
          
		  return proxy;
        };
		
		// make sure the proxy tracker is in the page
        if (window.pageTracker) {
          window.pageTracker = createProxyTracker(window.pageTracker);
        }
		
        var realGAT = window._gat, proxyGAT = {};
        for (field in realGAT) {
          if (field) { // we really do want everything, but jslint enforces this 
            proxyGAT[field] = realGAT[field];
          }
        }
		proxyGAT._getTracker = function(acct) {
		  var realTracker = realGAT._getTracker(acct);
		  return createProxyTracker(realTracker);
		};
      }
    };
	
	ETL.bind("data-capture-start", metadata.id, initializeInlineTracking);
  })();
}





/*
 * Data Transport Plug-ins
 *//*--------------------------------------------------------------------------*/




