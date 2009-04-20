class InspectorController < ApplicationController

  def index
  end

  def index2
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
