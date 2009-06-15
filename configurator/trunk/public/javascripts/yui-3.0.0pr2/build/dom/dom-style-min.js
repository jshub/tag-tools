/*
Copyright (c) 2008, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 3.0.0pr2
*/
YUI.add("dom-style",function(B){var h="documentElement",X="defaultView",N="ownerDocument",i="style",e="float",C="cssFloat",R="styleFloat",S="transparent",k="visible",G="width",Z="height",J="borderTopWidth",d="borderRightWidth",D="borderBottomWidth",c="borderLeftWidth",j="getComputedStyle",F=B.config.doc,a=undefined,b=/color$/i;B.mix(B.DOM,{CUSTOM_STYLES:{},setStyle:function(o,Y,p,n){n=o[i],CUSTOM_STYLES=B.DOM.CUSTOM_STYLES;if(n){if(Y in CUSTOM_STYLES){if(CUSTOM_STYLES[Y].set){CUSTOM_STYLES[Y].set(o,p,n);return ;}else{if(typeof CUSTOM_STYLES[Y]==="string"){Y=CUSTOM_STYLES[Y];}}}n[Y]=p;}},getStyle:function(p,Y){var o=p[i],n=B.DOM.CUSTOM_STYLES,q="";if(o){if(Y in n){if(n[Y].get){return n[Y].get(p,Y,o);}else{if(typeof n[Y]==="string"){Y=n[Y];}}}q=o[Y];if(q===""){q=B.DOM[j](p,Y);}}return q;},"setStyles":function(Y,n){B.each(n,function(o,p){B.DOM.setStyle(Y,p,o);},B.DOM);},getComputedStyle:function(n,Y){var p="",o=n[N];if(n[i]){p=o[X][j](n,"")[Y];}return p;}});if(F[h][i][C]!==a){B.DOM.CUSTOM_STYLES[e]=C;}else{if(F[h][i][R]!==a){B.DOM.CUSTOM_STYLES[e]=R;}}if(B.UA.opera){B.DOM[j]=function(o,n){var Y=o[N][X],p=Y[j](o,"")[n];if(b.test(n)){p=B.Color.toRGB(p);}return p;};}if(B.UA.webkit){B.DOM[j]=function(o,n){var Y=o[N][X],p=Y[j](o,"")[n];if(p==="rgba(0, 0, 0, 0)"){p=S;}return p;};}var A="toString",Q=parseInt,P=RegExp;B.Color={KEYWORDS:{black:"000",silver:"c0c0c0",gray:"808080",white:"fff",maroon:"800000",red:"f00",purple:"800080",fuchsia:"f0f",green:"008000",lime:"0f0",olive:"808000",yellow:"ff0",navy:"000080",blue:"00f",teal:"008080",aqua:"0ff"},re_RGB:/^rgb\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\)$/i,re_hex:/^#?([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i,re_hex3:/([0-9A-F])/gi,toRGB:function(Y){if(!B.Color.re_RGB.test(Y)){Y=B.Color.toHex(Y);}if(B.Color.re_hex.exec(Y)){Y="rgb("+[Q(P.$1,16),Q(P.$2,16),Q(P.$3,16)].join(", ")+")";}return Y;},toHex:function(p){p=B.Color.KEYWORDS[p]||p;if(B.Color.re_RGB.exec(p)){var o=(P.$1.length===1)?"0"+P.$1:Number(P.$1),n=(P.$2.length===1)?"0"+P.$2:Number(P.$2),Y=(P.$3.length===1)?"0"+P.$3:Number(P.$3);p=[o[A](16),n[A](16),Y[A](16)].join("");}if(p.length<6){p=p.replace(B.Color.re_hex3,"$1$1");}if(p!=="transparent"&&p.indexOf("#")<0){p="#"+p;}return p.toLowerCase();}};var E="clientTop",T="clientLeft",L="parentNode",g="right",U="hasLayout",l="px",I="filter",f="filters",O="opacity",W="auto",M="currentStyle";if(document[h][i][O]===a&&document[h][f]){B.DOM.CUSTOM_STYLES[O]={get:function(n){var p=100;try{p=n[f]["DXImageTransform.Microsoft.Alpha"][O];}catch(o){try{p=n[f]("alpha")[O];}catch(Y){}}return p/100;},set:function(n,o,Y){if(typeof Y[I]=="string"){Y[I]="alpha("+O+"="+o*100+")";if(!n[M]||!n[M][U]){Y.zoom=1;}}}};}var V=/^width|height$/,H=/^(\d[.\d]*)+(em|ex|px|gd|rem|vw|vh|vm|ch|mm|cm|in|pt|pc|deg|rad|ms|s|hz|khz|%){1}?/i;var m={CUSTOM_STYLES:{},get:function(Y,o){var n="",p=Y[M][o];if(o===O){n=B.DOM.CUSTOM_STYLES[O].get(Y);}else{if(!p||(p.indexOf&&p.indexOf(l)>-1)){n=p;}else{if(B.DOM.IE.COMPUTED[o]){n=B.DOM.IE.COMPUTED[o](Y,o);}else{if(H.test(p)){n=B.DOM.IE.ComputedStyle.getPixel(Y,o);}else{n=p;}}}}return n;},getOffset:function(o,t){var q=o[M][t],Y=t.charAt(0).toUpperCase()+t.substr(1),r="offset"+Y,n="pixel"+Y,p="";if(q==W){var s=o[r];if(s===a){p=0;}p=s;if(V.test(t)){o[i][t]=s;if(o[r]>s){p=s-(o[r]-s);}o[i][t]=W;}}else{if(!o[i][n]&&!o[i][t]){o[i][t]=q;}p=o[i][n];}return p+l;},getBorderWidth:function(Y,o){var n=null;if(!Y[M][U]){Y[i].zoom=1;}switch(o){case J:n=Y[E];break;case D:n=Y.offsetHeight-Y.clientHeight-Y[E];break;case c:n=Y[T];break;case d:n=Y.offsetWidth-Y.clientWidth-Y[T];break;}return n+l;},getPixel:function(n,Y){var p=null,q=n[M][g],o=n[M][Y];n[i][g]=o;p=n[i].pixelRight;n[i][g]=q;return p+l;},getMargin:function(n,Y){var o;if(n[M][Y]==W){o=0+l;}else{o=B.DOM.IE.ComputedStyle.getPixel(n,Y);}return o;},getVisibility:function(n,Y){var o;while((o=n[M])&&o[Y]=="inherit"){n=n[L];}return(o)?o[Y]:k;},getColor:function(n,Y){var o=n[M][Y];if(!o||o===S){B.DOM.elementByAxis(n,L,null,function(p){o=p[M][Y];if(o&&o!==S){n=p;return true;}});}return B.Color.toRGB(o);},getBorderColor:function(n,Y){var o=n[M];var p=o[Y]||o.color;return B.Color.toRGB(B.Color.toHex(p));}};var K={};K[G]=K[Z]=m.getOffset;K.color=K.backgroundColor=m.getColor;K[J]=K[d]=K[D]=K[c]=m.getBorderWidth;K.marginTop=K.marginRight=K.marginBottom=K.marginLeft=m.getMargin;K.visibility=m.getVisibility;K.borderColor=K.borderTopColor=K.borderRightColor=K.borderBottomColor=K.borderLeftColor=m.getBorderColor;if(!B.config.win[j]){B.DOM[j]=m.get;}B.namespace("DOM.IE");B.DOM.IE.COMPUTED=K;B.DOM.IE.ComputedStyle=m;},"3.0.0pr2",{skinnable:false,requires:["dom-base"]});