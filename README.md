# README

## Installation
1. Install Ruby version 2.4.6.
	* *Windows* - Use RubyInstaller2, [here](https://github.com/oneclick/rubyinstaller2/releases/tag/2.4.0-8)
1. Install Rails: `gem install rails`
1. Clone this repository and run `bundle install` in the root.
1. Install PostgreSQL.
	1. In pg_hba.conf (On Windows 10, at `C:\Program Files\PostgreSQL\XXX\data\pg_hba.conf`), change authentication method to "trust" for local connections (Password not required).
	1. *Windows* - add to path (e.g. "C:\Program Files\PostgreSQL\9.6\bin")
	1. Add a role for your user name: 
		1. `createuser -U postgres <USERNAME>`
		1. `ALTER USER <USERNAME> WITH SUPERUSER`
	1. Add a database for the app: `createdb imagewall_development -U <USERNAME>`
	1. Bring the database up to date: `rails db:migrate`
1. Get the file `config/application.yml` from IT and add it. (The file holds access keys and passwords - too sensitive for bitbucket!)
1. Run the app: `rails s` in the app root.

## Setup
1. Create a user in the app.
1. Run `UPDATE users SET is_sales_admin = 't', is_marketing_admin = 't', is_super_admin = 't' WHERE email = '<EMAIL>';` in psql (`psql imagewall_development`).
1. Create the default material in the app. Currently this is Solanum (Excel id: solanumSteel).

## Deployment
We use Heroku to host the website. There is a bitbucket pipeline set up which syncs the master branch of the repository with Heroku. So, if you push to master and have access to Heroku, it should build and publish automatically. You can also push to Heroku manually:
1. Install Heroku CLI
1. `heroku login`
1. `heroku git:remote -a zahnerimagewall`
1. `git push heroku master`

## Notes
1. 2018-09-24 Removed the ability to buy a design directly from the website. Hadn't been used, and will allow us to discontinue our TaxJar subscription. Key functions were left in place in anticipation of turning this back on at some point in the future. If it becomes clear that won't happen, all references to purchasing, taxes, and Stripe can be removed.
	