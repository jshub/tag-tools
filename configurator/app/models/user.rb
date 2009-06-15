require "digest"
require 'digest/sha1' 

# A user who can authenticate to retrieve stored configurations in the tag
# configurator.
# Based on code from Agile Web Development with Ruby on Rails
class User < ActiveRecord::Base 
  
  validates_uniqueness_of :name, :message => "That user name is already taken"
  validates_length_of :name, :in => 3..30
  
  validates_presence_of :email_address
  validates_email_format_of :email_address 
  validates_uniqueness_of :email_address

  attr_accessor :password_confirmation 
  validates_confirmation_of :password 
  validate :password_non_blank 
  
  has_many :tag_configurations
  has_many :tag_configuration_revisions
  
  def self.authenticate(email, passwd) 
    user = self.find_by_email_address(email) 
    if user 
      expected_password = encrypted_password(passwd, user.salt) 
      if user.hashed_password != expected_password 
        print "hello"
        user = nil 
      end 
    end 
    user 
  end 
  
  # Override default find so that email_address is matched without case
  # sensitivity
  def self.find(*args)
    if args.last.is_a?(Hash) and args.last[:conditions] and args.last[:conditions].has_key? :email_address
      args.last[:conditions][:email_address] = args.last[:conditions][:email_address].downcase.strip
    end
    super(*args)
  end
  
  # 'password' is a virtual attribute 
  def password 
    @password 
  end 
  
  def password=(pwd) 
    @password = pwd 
    return if pwd.blank? 
    create_new_salt 
    self.hashed_password = User.encrypted_password(self.password, self.salt) 
  end 
  
  # we want urls like '/users/john' not 'users/12'
  def to_param
    name
  end

  
  private 
  
  def password_non_blank 
    errors.add_to_base("Missing password") if hashed_password.blank? 
  end 
  
  def create_new_salt 
    self.salt = self.object_id.to_s + rand.to_s 
  end 
  
  def self.encrypted_password(password, salt) 
    string_to_hash = password + "wibble" + salt 
    Digest::SHA1.hexdigest(string_to_hash) 
  end 
end 
