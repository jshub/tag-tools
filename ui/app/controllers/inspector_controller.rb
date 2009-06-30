class InspectorController < ApplicationController

  def index
  end

  def css
  end

  def api
  end

  def install
  end

  def widget
    render :layout => 'javascript_test'
  end
  
  def xpi
    @inspector = Inspector.new
  end

  def bundle_xpi
    inspector = Inspector.new
    inspector.bundle_xpi
    flash[:notice] = 'XPI was successfully created.'
    redirect_to :action => 'xpi'
  end

  def zip
    @inspector = Inspector.new
  end

  def bundle_zip
    inspector = Inspector.new
    inspector.bundle_zip
    flash[:notice] = 'XPI was successfully created.'
    redirect_to :action => 'zip'
  end

end
