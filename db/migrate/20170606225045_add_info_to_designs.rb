class AddInfoToDesigns < ActiveRecord::Migration[5.1]
  def change
  	add_column :designs, :purchaser_fname, :string
  	add_column :designs, :purchaser_lname, :string
  	add_column :designs, :purchase_deposit, :decimal
  	rename_column :designs, :purchase_tax, :purchase_taxes
  end
end
