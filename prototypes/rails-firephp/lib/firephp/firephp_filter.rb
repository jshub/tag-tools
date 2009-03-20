module ActionController
  class Base

  # message types
  LOG = "LOG"
  INFO = "INFO"
  WARN = "WARN"
  ERROR = "ERROR"
  DUMP = "DUMP"
  TRACE = "TRACE"
  EXCEPTION = "EXCEPTION"
  TABLE = "TABLE"
  
  private
    class FirePHPMessage
      attr_accessor :type, :object, :timestamp
    end
 
    # for custom Processor and Renderer
    # ref: http://www.firephp.org/Wiki/Reference/CustomizeDisplay
    def setProcessorUrl(url)
      headers["X-FirePHP-ProcessorURL"] = 'url'
    end
    def setRendererUrl(url)
      headers["X-FirePHP-RendererURL"] = 'url'
    end  
    
    # can be called as:
    #  fb(object)
    #  fb(object, type)
    #  fb(message, object, type)
    def fb(object, *args)           
      
      # eval number of extra args for behaviour
      return if (args.length < 1)
      return if (args.length > 2)
      if (args.length == 1)
        # is it a message type we recognise? if not merge the type name with the object for reporting
        type = args[0].upcase
        obj = [args[0], object] if !(type =~ /^(LOG|INFO|WARN|ERROR|DUMP|TRACE|EXCEPTION|TABLE)$/)
      end
      if (args.length == 2)
        type = args[1].upcase
        obj = [args[0], object]
      end
      
      # set any remaining defaults
      obj = obj ||= object
      type = type ||= LOG
      # any message type not recognised becomes LOG
      type = LOG if !(type =~ /^(LOG|INFO|WARN|ERROR|DUMP|TRACE|EXCEPTION|TABLE)$/)
      
      # Make a message
      message = FirePHPMessage.new
      message.object = obj
      message.type = type
      message.timestamp = firephp_timestamp
      
      # add message to queue for bulk conversion to headers
      @queue ||= []
      @queue << message
    end
    # compatibility with v0.0.1
    alias firephp fb
    
    def firephp_timestamp
      # 538  35958501
      #  |    |
      #  |    - Microseconds
      #  - Seconds based on last 3 digits of a unix timestamp
      # ref http://www.firephp.org/Wiki/Reference/Protocol
      return "#{sprintf("%03d", Time.now.sec)}#{sprintf("%08d", Time.now.usec)}"
    end

    def firephp_filter
      # Check browser has FirePHP plugin
      # original regex '/\sFirePHP\/([\.|\d]*)\s?/si' and version '>= 0.0.6'
      return if !(request.headers["HTTP_USER_AGENT"] =~ /FirePHP\//)
      # Check we have messages to log
      return if @queue.blank?
      
      # Standard headers to create contiguous JSON string
      # ref http://www.firephp.org/Wiki/Reference/Protocol
      headers["X-FirePHP-Data-100000000001"] = '{'
      headers["X-FirePHP-Data-200000000001"] = '"FirePHP.Dump":{'
      headers["X-FirePHP-Data-200000000002"] = "\"Rails version\":\"#{RAILS_GEM_VERSION}\","
      headers["X-FirePHP-Data-200000000003"] = "\"Rails environment\":\"#{RAILS_ENV}\","
      # Dump headers are inserted between 200000000002 to 299999999998
      headers["X-FirePHP-Data-299999999999"] = '"__SKIP__":"__SKIP__"},'
      headers["X-FirePHP-Data-300000000001"] = '"FirePHP.Firebug.Console":['
      # Console headers are inserted between 300000000002 to 399999999998
      headers["X-FirePHP-Data-399999999999"] = '["__SKIP__"]],'
      headers["X-FirePHP-Data-999999999999"] = '"__SKIP__":"__SKIP__"}'

      # loop over the queue - the plugin will also sort the order out via the timestanp
      # TODO chunk into 5000 char parts        
      @queue.each do |message|
        # TODO implement TRACE and EXCEPTION
        if (message.type =~ /^(TRACE|EXCEPTION)$/)
          headers["X-FirePHP-Data-3#{message.timestamp}"] = '["WARN","TRACE and EXCEPTION not currently implemented"],'          
        end
        if (message.type =~ /^(DUMP)$/)
          headers["X-FirePHP-Data-2#{message.timestamp}"] = "\"#{message.object[0].to_s}\":#{message.object[1].to_json},"          
        end
        next if !(message.type =~ /^(LOG|INFO|WARN|ERROR|TABLE)$/)
        headers["X-FirePHP-Data-3#{message.timestamp}"] = "[\"#{message.type}\",#{message.object.to_json}],"
      end
    end
    
    def firephp_debug
      # Dump firephp data structure
      fb(@queue, INFO)
    end
    
    # Convienience methods for Rails Controller globals
    def firephp_params
      @params_table = [["Parameter", "Value"]].concat(params.to_a)
      fb(["Controller 'params'", @params_table],"TABLE")
    end
    def firephp_headers
      @headers_table = [["Header", "Value"]].concat(headers.to_a)
      fb(["Controller 'headers'", @headers_table],"TABLE")
    end   
    def firephp_cookies
      @cookies_table = [["Cookie", "Values"]].concat(cookies.to_a)
      fb(["Controller 'cookies'", @cookies_table],"TABLE")
    end
  end
end