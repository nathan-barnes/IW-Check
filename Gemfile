source "https://rubygems.org"

ruby "2.4.6"

git_source(:github) do |repo_name|
  repo_name = "#{repo_name}/#{repo_name}" unless repo_name.include?("/")
  "https://github.com/#{repo_name}.git"
end

# Bundle edge Rails instead: gem "rails", github: "rails/rails"
gem "rails", "~> 5.1.0"
# Use postgresql as the database for Active Record
gem "pg", "~> 0.21.0"
# Use Puma as the app server
gem "puma", "~> 3.0"
# Use SCSS for stylesheets
gem "sass-rails", "~> 5.0"
# Use Uglifier as compressor for JavaScript assets
gem "uglifier", ">= 1.3.0"
# Turbolinks makes navigating your web application faster. Read more: https://github.com/turbolinks/turbolinks
gem "turbolinks", "~> 5"
# User authentication
gem "devise", "~> 4.2"
# This is a temporary fix until Devise pushes changes to allow for the previous line
#gem "devise", :git => "git://github.com/plataformatec/devise.git"
# Make those console db queries look sexy
gem "hirb", "~> 0.7"
# Create pretty URLs
gem "friendly_id", "~> 5.0.5"
# Use Acts As List for sorting
gem "acts_as_list", "0.7.6"
# Use Figaro for ENV variables
gem "figaro", "~> 1.1"
# AWS integration
gem "aws-sdk", "~> 2.5"
# Imgix
gem "imgix-rails", "~> 2.1.3"
# Auto prefix our CSS
gem "autoprefixer-rails", "~> 6.4"
# Use Dalli for memcached
gem "dalli", "~> 2.7"
# Use will_paginate for User index
gem "will_paginate", "~> 3.1.0"
# font-awesome
gem "font-awesome-sass", "~> 4.7.0"
# Allow for ES6
gem "sprockets-es6"
# Contact form
gem "mail_form", "~> 1.3.0"
# PDF generator (needs wkhtmltopdf on machine to function)
# Local installation: brew install caskroom/cask/wkhtmltopdf
gem "wicked_pdf"
# HTTParty for API requests
gem "httparty", "~> 0.15.5"

gem "tzinfo-data"

gem 'wdm', '>= 0.1.0', :platforms => [:x64_mingw, :mingw, :mswin]

gem "bcrypt", "~> 3.1.12"

group :development do
  # Better error pages for debugging
  gem "better_errors"
  # Call "byebug" anywhere in the code to stop execution and get a debugger console
  gem "byebug", platform: :mri
  gem "faker", "1.7.3"
  # Access an IRB console on exception pages or by using <%= console %> anywhere in the code.
  gem "web-console"
  gem "listen", "~> 3.0.5"
  # Spring speeds up development by keeping your application running in the background. Read more: https://github.com/rails/spring
  gem "spring"
  gem "spring-watcher-listen", "~> 2.0.0"
  # Allows for REPL use in Rails errors
  gem "binding_of_caller"
end

group :production do
  # Use for static asset serving and logging on Heroku
  gem "rails_12factor", "~> 0.0.0"
  # Installation of wkhtmltopdf for Heroku
  gem 'wkhtmltopdf-heroku'
end
