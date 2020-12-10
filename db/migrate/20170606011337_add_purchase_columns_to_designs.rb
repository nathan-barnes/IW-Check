class AddPurchaseColumnsToDesigns < ActiveRecord::Migration[5.1]
  def change
  	add_column :designs, :purchase_subtotal, :decimal
  	add_column :designs, :purchase_shipping, :decimal
  	add_column :designs, :purchase_total, :decimal
  	add_column :designs, :purchase_tax, :decimal
  	add_column :designs, :purchase_grand_total, :decimal
  	add_column :designs, :is_paid_half, :boolean, default: false
  	add_column :designs, :is_paid_full, :boolean, default: false
  end
end
