class AddDataToProjects < ActiveRecord::Migration[5.1]
  def change
  	add_column :projects, :year, :integer
  	add_column :projects, :perforation, :text
  end
end
