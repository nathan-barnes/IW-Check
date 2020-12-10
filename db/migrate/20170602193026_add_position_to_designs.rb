class AddPositionToDesigns < ActiveRecord::Migration[5.1]
  def change
  	add_column :designs, :position, :integer
  end
end
