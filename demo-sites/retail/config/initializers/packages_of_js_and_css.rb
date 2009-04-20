# Store + dependencies
ActionView::Helpers::AssetTagHelper.register_stylesheet_expansion :store_yui => ["inspector/yui3/reset-context", "inspector/yui3/fonts-context", "inspector/yui3/grids-context", "inspector/yui3/base-context"]
ActionView::Helpers::AssetTagHelper.register_stylesheet_expansion :store => ["store", "hproduct", "microformats"]
ActionView::Helpers::AssetTagHelper.register_javascript_expansion :store => ["jquery/jquery-1.3.2.min", "store"]  

# jsHUb core + dependencies
ActionView::Helpers::AssetTagHelper.register_javascript_expansion :jshub => ["jquery/jquery-1.3.2.min", "json/json2"]
  
# jsHub Inspector + dependencies
ActionView::Helpers::AssetTagHelper.register_stylesheet_expansion :inspector_yui => ["inspector/yui3/reset-context", "inspector/yui3/fonts-context", "inspector/yui3/grids-context", "inspector/yui3/base-context", "inspector/yui2/container/assets/skins/sam/container", "inspector/yui2/resize/assets/skins/sam/resize", "inspector/accordionview/accordionview"]
ActionView::Helpers::AssetTagHelper.register_javascript_expansion :inspector_yui => ["inspector/yui2/utilities/utilities", "inspector/yui2/dragdrop/dragdrop", "inspector/yui2/container/container", "inspector/yui2/resize/resize", "inspector/accordionview/accordionview"]
ActionView::Helpers::AssetTagHelper.register_stylesheet_expansion :inspector => ["inspector/inspector"]
ActionView::Helpers::AssetTagHelper.register_javascript_expansion :inspector => ["json/json2", "inspector/sha1", "inspector/inspector"]
