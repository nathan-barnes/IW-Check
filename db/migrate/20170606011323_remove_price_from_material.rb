class RemovePriceFromMaterial < ActiveRecord::Migration[5.1]
  def change
  	remove_column :materials, :price, :decimal
  end
end
