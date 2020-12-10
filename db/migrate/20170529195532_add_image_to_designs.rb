class AddImageToDesigns < ActiveRecord::Migration[5.1]
  def change
  	add_column :designs, :image, :text
  end
end
