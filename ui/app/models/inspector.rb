# Model to generate an XPI file from a path for Firefox Extension development
# ref: http://www.superwick.com/archives/2007/06/14/generating-zip-file-archives-via-ruby-on-rails/
# ref: http://erratic.inkdeep.com/2006/10/17/joy-of-rubyzip
# ref: http://www.cuberick.com/2007/11/zip-directory-with-ruby.html

require 'zip/zip'
require 'find'
require 'fileutils'
include FileUtils

class Inspector

  def name
   "inspector"
  end

  def version
   "0.1.0"
  end

  # Folder to hold the XPI related files relative to the public directory with no trailing slash
  def xpi_download_folder
   "xpis"
  end

  # URL to the XPI
  def xpi_download_path
   "#{self.xpi_download_folder}/#{self.name}-#{self.version}.xpi"
  end
  
  def bundle_xpi(name = self.name, version = self.version, xpi_download_folder = self.xpi_download_folder)
  
    src = "#{RAILS_ROOT}/public/#{xpi_download_folder}/#{name}"
    output_path = "#{RAILS_ROOT}/public/#{xpi_download_folder}/#{name}-#{version}.xpi"

    # check to see if the file exists already, and if it does, delete it.
    if File.file?(output_path)
      File.delete(output_path)
    end 
  
    Zip::ZipFile.open(output_path, Zip::ZipFile::CREATE) do |zipfile|
     Find.find(src) do |path|
      # ignore hidden files and scm folders startin with '.'
      Find.prune if File.basename(path)[0] == ?.
      # remove the filesystem path from the zip file to create a valid XPI file
      dest = /#{xpi_download_folder}\/#{name}\/(\w.*)/.match(path)
      zipfile.add(dest[1],path) if dest
     end 
    end  

    # set read permissions on the file
    File.chmod(0644, output_path)
  
  end
  
end