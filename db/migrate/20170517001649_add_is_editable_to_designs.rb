class AddIsEditableToDesigns < ActiveRecord::Migration[5.1]
  def change
    add_column :designs, :is_editable, :boolean, default: :false
  end
end
