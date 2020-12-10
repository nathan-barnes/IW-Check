class CreateCategorizations < ActiveRecord::Migration[5.0]
  def change
    create_table :categorizations do |t|
      t.integer :project_id
      t.integer :material_id
      t.integer :category_id

      t.timestamps
    end
    add_index :categorizations, :project_id
    add_index :categorizations, :material_id
    add_index :categorizations, :category_id
  end
end
