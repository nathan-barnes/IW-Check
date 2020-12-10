class AddLocationToProjects < ActiveRecord::Migration[5.1]
  def change
  	add_column :projects, :location, :string
  end
end
