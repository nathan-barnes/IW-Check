class AddExcelIdToMaterials < ActiveRecord::Migration[5.1]
  def change
  	add_column :materials, :excel_id, :text
  end
end
