# Shared by all application views
ActionView::Helpers::AssetTagHelper.register_stylesheet_expansion :jshub => [
  "jshub.css"] 

# YUI is used by unit tests
ActionView::Helpers::AssetTagHelper.register_javascript_expansion :yui3 => [
  "yui-3.0.0pr2/build/yui/yui.js",
  "yui-3.0.0pr2/build/oop/oop.js", 
  "yui-3.0.0pr2/build/event/event.js"]
ActionView::Helpers::AssetTagHelper.register_javascript_expansion :yuitest => [
  "yui-3.0.0pr2/build/dump/dump.js", 
  "yui-3.0.0pr2/build/substitute/substitute.js", 
  "yui-3.0.0pr2/build/dom/dom.js", 
  "yui-3.0.0pr2/build/node/node.js", 
  "yui-3.0.0pr2/build/json/json.js", 
  "yui-3.0.0pr2/build/yuitest/yuitest.js"]
  
# Unit test assets
ActionView::Helpers::AssetTagHelper.register_javascript_expansion :javascript_unit_test => [
  "javascript_unit_test.js"]
ActionView::Helpers::AssetTagHelper.register_stylesheet_expansion :javascript_unit_test => [
  "javascript_unit_test.css"]

# jsHUb core + dependencies
ActionView::Helpers::AssetTagHelper.register_javascript_expansion :jshub => ["jquery/jquery-1.3.2.min", "json/json2"]
  
# jsHub Inspector + dependencies
ActionView::Helpers::AssetTagHelper.register_stylesheet_expansion :inspector_yui => ["inspector/yui3/reset-context", "inspector/yui3/fonts-context", "inspector/yui3/grids-context", "inspector/yui3/base-context", "inspector/yui2/container/assets/skins/sam/container", "inspector/yui2/resize/assets/skins/sam/resize", "inspector/accordionview/accordionview"]
ActionView::Helpers::AssetTagHelper.register_javascript_expansion :inspector_yui => ["inspector/yui2/utilities/utilities", "inspector/yui2/dragdrop/dragdrop", "inspector/yui2/container/container", "inspector/yui2/resize/resize", "inspector/accordionview/accordionview"]
ActionView::Helpers::AssetTagHelper.register_stylesheet_expansion :inspector => ["inspector/inspector"]
ActionView::Helpers::AssetTagHelper.register_javascript_expansion :inspector => ["json/json2", "inspector/sha1", "inspector/inspector"]

# jsHub Inspector YUI Widget and dependencies
ActionView::Helpers::AssetTagHelper.register_stylesheet_expansion :inspector_widget => ["../javascripts/inspector/widget/yui3-cssreset/reset-context-min",
"../javascripts/inspector/widget/yui3-cssbase/base-context-min",
"../javascripts/inspector/widget/yui3-cssfonts/fonts-context-min",
"../javascripts/inspector/widget/yui3-cssgrids/grids-context-min",
"../javascripts/inspector/widget/accordionview/accordionview-min",
"inspector/widget/jshubinspector/jshubinspector"]
ActionView::Helpers::AssetTagHelper.register_javascript_expansion :inspector_widget => ["inspector/widget/utilities/utilities", 
"inspector/widget/container/container-min", 
"inspector/widget/resize/resize-min",
"inspector/widget/accordionview/accordionview-min",
"inspector/widget/json2/json2",
"inspector/widget/sha1/sha1", 
"inspector/widget/jshubinspector/jshubinspector",
"inspector/widget/jshubinspector/jshubinspector-init"]

