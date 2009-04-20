class InspectorController < ApplicationController

  def index
    @inspector = Inspector.new    
  end

  def index2
    @inspector = Inspector.new
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

end
