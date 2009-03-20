/**
 * @author liamc
 * Simple microformat parser for common formats based on existing plugin
 * ref: http://github.com/jasherai/jquery-microformats/tree/master
 */
(function(){
  var Plugin = {
		
		// for convienience
		$ : ETL.$,
    hcard : function(id) {
			var vendor = {
				name : "hCard",
				home_url : "", // vendor documentation home
				privacy_url : "", // where the opt-in/out functionality is
				server_urls : [], // array of URL's where data can be sent to
				event_type : "hcard" // TODO ETL event type - should be a css_class instance?
			}
		  
		  // use existing plugin functions to parse and return data
			$.microformats.parseLocal({microformats: 'hCard'});

			var hcards = $.microformats.hCards;			
			return hcards;
		}
  };
	
	// expose the api
  window.ETL = window.ETL || {};
  ETL.Plugin = ETL.Plugin || {};
  ETL.Plugin.hcard = Plugin.hcard;
})();


/**
 * Changelog: renamed all 'class' to 'css_class' as reserved JS word in Safari
 */
jQuery.fn.parseMicroformatAttribute = function() {
	if(jQuery(this).find('abbr').length == 1) {
		return jQuery(this).find('abbr').attr('title');	
	} else {
		return jQuery(this).text();	
	}
};
jQuery.microformats = { 
	availableFormats: ['hCard', 'hEvent', 'hReview', 'XFN'],
	hCards: [],
	hEvents: [],
	hReviews: [],
	XF: [],
	lastRemote: false,
	documentParsed: {
		hCard 		: false,
		hCalender	: false,
		hEvent		: false,
		XFN			: false	
	},
	hCard: function(target, settings){
		var foundHCards = [];
		var standardAttributes = [
				{name: 'fn', css_class: '.fn'},
				{name: 'familyName', css_class: '.family-name'},
				{name: 'givenName', css_class: '.given-name'},
				{name: 'additionalName', css_class: '.additional-name'},
				{name: 'honorificPrefix', css_class: '.honorific-prefix'},
				{name: 'honorificSuffix', css_class: '.honorific-suffix'},
				{name: 'nickname', css_class: '.nickname'},
				{name: 'email', css_class: '.email'},
				{name: 'title', css_class: '.title'},
				{name: 'logo', css_class: '.logo'},
				{name: 'sound', css_class: '.sound'},
				{name: 'bday', css_class: '.bday'},
				{name: 'org', css_class: '.org'}
			];
		var nestedAttributes = [
				{name: 'geo', css_class: '.geo', objects: [
						{name: 'latitude', css_class: '.latitude'},
						{name: 'longitude', css_class: '.longitude'}
					]
				},
				{name: 'adr', css_class: '.adr', objects: [
						{name: 'postOfficeBox', css_class: '.post-office-box'},
						{name: 'extendedAddress', css_class: '.extended-address'},
						{name: 'streetAddress', css_class: '.street-address'},
						{name: 'locality', css_class: '.locality'},
						{name: 'region', css_class: '.region'},
						{name: 'postalCode', css_class: '.postal-code'},
						{name: 'countryName', css_class: '.country-name'},
					]
				}
			];
		jQuery(target).find('.vcard').each(function() {
			var vCardObject = {};
			var current = this;
			jQuery.each(standardAttributes, function() {
				vCardObject[this.name] = $(current).find(this.css_class).parseMicroformatAttribute();
			});
			jQuery.each(nestedAttributes, function() {
				var i = this;
				vCardObject[this.name] = {};
				jQuery.each(this.objects, function() {
					vCardObject[i.name][this.name] = $(current).find(i.css_class).find(this.css_class).parseMicroformatAttribute();
				});
			});
			
			vCardObject.url = $(this).find('a.url').attr('href');
			vCardObject.photo = $(this).find('img.photo').attr('src');
			vCardObject.logo = $(this).find('img.logo').attr('src');
			vCardObject.tel = [];
			var telcss_class = $(this).find('.tel');
			if(jQuery(telcss_class).find('.type')) {
				jQuery(telcss_class).find('.type').each(function() {
					var type = jQuery(this).text();
					if(jQuery(this).parent().find('abbr').length == 1) {
						var number = jQuery(this).parent().find('abbr').attr('title');
					} else {
						var numberWrap = jQuery(this).parent().text();
						var number = numberWrap.replace(jQuery(this).text(),'');
						number = jQuery.trim(number);
					}
					var telObj = { type : type, number : number };
					vCardObject.tel.push(telObj);
				});
			} else {
				if(jQuery(telcss_class).find('abbr').length == 1) {
					var number = jQuery(telcss_class).find('abbr').attr('title');
				} else {
					var number = jQuery(telcss_class).text();
				}
				var telObj = { type : "undefined", number : number };
				vCardObject.tel.push(telObj);
			}
			if(settings.appendToLocal == true) {
				jQuery.microformats.hCards.push(vCardObject);
			}
			foundHCards.push(vCardObject);
		});	
		this.documentParsed.hCard = true;
		return this.hCards;		
	},
	hEvent : function(target, settings) {
		var foundHEvents = [];
		var standardAttributes = [
				{name: 'summary', css_class: '.summary'},
				{name: 'location', css_class: '.location'},
				{name: 'description', css_class: '.description'},
				{name: 'dtstart', css_class: '.dtstart'},
				{name: 'dtend', css_class: '.dtend'}
			];
		jQuery(target).find('.vevent').each(function() {
			var vEventObject = {};
			var tags = [];
			var current = this;
			jQuery.each(standardAttributes, function() {
				vEventObject[this.name] = $(current).find(this.css_class).parseMicroformatAttribute();
			});
			vEventObject.url = $(this).find('a.url').attr('href');
			jQuery(current).find("a[rel='tag']").each(function() {
				tags.push(jQuery(this).text());
			});
			vEventObject.tags = tags;
			if(settings.appendToLocal == true) {
				jQuery.microformats.hEvents.push(vEventObject);
			}
			foundHEvents.push(vEventObject);
		});	
		this.documentParsed.hEvent = true;
		return this.hEvents;
	},
	hReview : function(settings) {
		
	},
	XFN: function(settings) {
		
	},
	parseLocal : function(settings) {
		settings = jQuery.extend({
			microformats: "all",
			appendToLocal: true
		}, settings);
		if(typeof(settings.microformats) == "string") {
			if(settings.microformats == 'all') {
				settings.microformats = this.availableFormats;
			} else {
				settings.microformats = [settings.microformats];	
			}
		}
		var passedSettings = {
			appendToLocal: settings.appendToLocal	
		}
		for(i = 0; i < settings.microformats.length; i++) {
			if(jQuery.isFunction(eval('jQuery.microformats.'+settings.microformats[i]))) {
				eval('jQuery.microformats.'+settings.microformats[i]+'(document, passedSettings)');
			}
		}
	},
	parseRemote : function(target, settings) {
		return true;
	}
};