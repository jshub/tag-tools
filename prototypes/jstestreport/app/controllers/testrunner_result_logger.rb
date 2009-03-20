class TestrunnerResultLogger
  # Logs query params and metrics before and after a request
  def before(controller) 
    @start = Time.now
  end
  def after(controller)   
    log = TestrunnerResult.new
    log.request = controller.request.raw_post
    log.start_time = @start 
    log.end_time = Time.now 
    log.total = log.end_time.to_f - @start.to_f 
    log.action = controller.action_name 
    log.save 
  end
end