class AddImageToResource < ActiveRecord::Migration[5.1]
  def change
  	add_column :resources, :image, :text
  end
end
