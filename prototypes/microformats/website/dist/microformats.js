/*  Microformats, version 0.0.1
 *  (c) 2008 Liam Clancy
 *
 *  Microformats is freely distributable under
 *  the terms of an MIT-style license.
 *  For details, see the web site: liamc.local
 *
 *--------------------------------------------------------------------------*/

var Microformats = {
  Version: '0.0.1',
};

/**
 * @author liamc
 * Common jQuery utils and plugins we use
 */
;(function($){

  // enhance jQuery with a chainable logger plug-in
  // ref: http://happygiraffe.net/blog/2007/09/26/jquery-logging/
  // e.g  $(root).find('li.source > input:checkbox').log("sources to uncheck").removeAttr("checked");
  // e.g. ETL.log('Plugin data', data)
  if (window.console && $.fn.jquery) {
    $.log = $.fn.log = function (msg) {
      console.log("%s: %o", msg, this);
      return this;
    }
  }

  // from Michael Kaply
  // ref: Operator Firefox Extension
  jQuery.fn.normalizeISO8601 = function (string, punctuation)
  {
    var dateArray = string.match(/(\d\d\d\d)(?:-?(\d\d)(?:-?(\d\d)(?:[T ](\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(?:([-+Z])(?:(\d\d)(?::?(\d\d))?)?)?)?)?)?/);

    var dateString;
    var tzOffset = 0;
    if (!dateArray) {
      return;
    }
    if (dateArray[1]) {
      dateString = dateArray[1];
      if (dateArray[2]) {
          if (punctuation) {
        dateString += "-";
      }

        dateString += dateArray[2];
        if (dateArray[3]) {
          if (punctuation) {
        dateString += "-";
      }
          dateString +=  dateArray[3];
          if (dateArray[4]) {
            dateString += "T" + dateArray[4];
            if (dateArray[5]) {
            if (punctuation) {
          dateString += ":";
        }
              dateString += dateArray[5];
            } else {
                if (punctuation) {
            dateString += ":";
          }

              dateString += "00";
            }
            if (dateArray[6]) {

              if (punctuation) {
          dateString += ":";
        }

              dateString += dateArray[6];
            } else {
              if (punctuation) {
          dateString += ":";
        }

              dateString += "00";
            }
            if (dateArray[7]) {
              if (punctuation) {
            dateString += ".";
          }


              dateString += dateArray[7];
            }
            if (dateArray[8]) {
              dateString += dateArray[8];
              if ((dateArray[8] == "+") || (dateArray[8] == "-")) {
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
  }

  // from Michael Kaply
  // ref: Operator Firefox Extension
  jQuery.fn.dateFromISO8601 = function (string) {
    var dateArray = string.match(/(\d\d\d\d)(?:-?(\d\d)(?:-?(\d\d)(?:[T ](\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(?:([-+Z])(?:(\d\d)(?::?(\d\d))?)?)?)?)?)?/);

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
      if (dateArray[8] == "-") {
        if (dateArray[9] && dateArray[10]) {
          date.setHours(date.getHours() + parseInt(dateArray[9], 10));
          date.setMinutes(date.getMinutes() + parseInt(dateArray[10], 10));
        }
      } else if (dateArray[8] == "+") {
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
  }

  // fix relative pathed URLs from James Edwards
  // ref: http://www.sitepoint.com/blogs/2007/08/10/dealing-with-unqualified-href-values/
  function qualifyHREF(href)
  {
      //get the current document location object
      var loc = document.location;

      //build a base URI from the protocol plus host (which includes port if applicable)
      var uri = loc.protocol + '//' + loc.host;

      //if the input path is relative-from-here
      //just delete the ./ token to make it relative
      if(/^(\.\/)([^\/]?)/.test(href))
      {
          href = href.replace(/^(\.\/)([^\/]?)/, 'oomph2');
      }

      //if the input href is already qualified, copy it unchanged
      if(/^([a-z]+)\:\/\//.test(href))
      {
          uri = href;
      }

      //or if the input href begins with a leading slash, then it's base relative
      //so just add the input href to the base URI
      else if(href.substr(0, 1) == '/')
      {
          uri += href;
      }

      //or if it's an up-reference we need to compute the path
      else if(/^((\.\.\/)+)([^\/].*oomph)/.test(href))
      {
          //get the last part of the path, minus up-references
          var lastpath = href.match(/^((\.\.\/)+)([^\/].*oomph)/);
          lastpath = lastpath[lastpath.length - 1];

          //count the number of up-references
          var references = href.split('../').length - 1;

          //get the path parts and delete the last one (this page or directory)
          var parts = loc.pathname.split('/');
          parts = parts.splice(0, parts.length - 1);

          //for each of the up-references, delete the last part of the path
          for(var i=0; i<references; i++)
          {
              parts = parts.splice(0, parts.length - 1);
          }

          //now rebuild the path
          var path = '';
          for(i=0; i<parts.length; i++)
          {
              if(parts[i] != '')
              {
                  path += '/' + parts[i];
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
          for(var i=0; i<parts.length; i++)
          {
              if(parts[i] != '')
              {
                  path += '/' + parts[i];
              }
          }
          path += '/';

          //then add the path and input href to the base URI
          uri += path + href;
      }

      //return the final uri
      return uri;
    }

})(jQuery);