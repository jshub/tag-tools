# Inspector files
ActionView::Helpers::AssetTagHelper.register_javascript_expansion :yui => ["inspector/yui2/utilities/utilities", "inspector/yui2/dragdrop/dragdrop", "inspector/yui2/container/container", "inspector/yui2/resize/resize", "inspector/accordionview/accordionview"]
ActionView::Helpers::AssetTagHelper.register_stylesheet_expansion :yui => ["inspector/yui3/reset-context", "inspector/yui3/fonts-context", "inspector/yui3/grids-context", "inspector/yui3/base-context", "inspector/yui2/container/assets/skins/sam/container", "inspector/yui2/resize/assets/skins/sam/resize", "inspector/accordionview/accordionview"]

  
ActionView::Helpers::AssetTagHelper.register_javascript_expansion :jshub => ["jquery/jquery-v1.2.6", "json/json2"]
  
ActionView::Helpers::AssetTagHelper.register_javascript_expansion :inspector => ["inspector/sha1", "inspector/inspector"]
ActionView::Helpers::AssetTagHelper.register_stylesheet_expansion :inspector => ["inspector/inspector"]