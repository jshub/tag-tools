class StaticController < ApplicationController
  
  # Put all static templates in /app/views/static and create subfolders to group them. 
  # If the given path is a folder, the index template inside it will be rendered, 
  # or if the path doesnÕt exist, a RoutingError exception will be thrown (which will render as a 404 in production mode)
  # Uses fragment caching - use @NOCACHE@ to specify pages which should never be cached
  # routes.rb (last entry): map.connect '*path', :controller => 'static'
  # ref: http://snafu.diarrhea.ch/blog/article/4-serving-static-content-with-rails
  
  NO_CACHE = [
    'static/about/website',
  ]

  def index
    if template_exists? path = 'static/' + params[:path].join('/')
      render_cached path
    elsif template_exists? path += '/index'
      render_cached path
    else
      raise ::ActionController::RoutingError,
            "Recognition failed for #{request.path.inspect}"
    end
  end

private
  def render_cached(path)
    if NO_CACHE.include? path
      render :template => path
    else
      key = path.gsub('/', '-')
      unless content = read_fragment(key)
        content = render_to_string :template => path, :layout => false
        write_fragment(key, content)
      end
      render :text => content, :layout => true
    end
  end
  
end
