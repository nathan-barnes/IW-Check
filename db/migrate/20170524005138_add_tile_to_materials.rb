class AddTileToMaterials < ActiveRecord::Migration[5.1]
  def change
    add_column :materials, :tile, :text
  end
end
