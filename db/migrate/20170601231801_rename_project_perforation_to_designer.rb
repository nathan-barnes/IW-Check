class RenameProjectPerforationToDesigner < ActiveRecord::Migration[5.1]
  def change
  	rename_column :projects, :perforation, :designer
  end
end
