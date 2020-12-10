class EditDesign < ActiveRecord::Migration[5.1]
  def change
    remove_column :designs, :is_demo, :boolean
    add_column :designs, :type, :string, default: "design"
    add_column :designs, :purchaser_id, :integer
    add_column :designs, :purchaser_email, :string
  end
end
