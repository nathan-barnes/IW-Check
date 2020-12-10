class CreateProjects < ActiveRecord::Migration[5.0]
  def change
    create_table :projects do |t|
      t.integer :material_id

      t.string :title
      t.text :subtitle
      t.text :description

      t.string  :slug
      t.boolean :is_visible, default: false
      t.integer :position
      t.timestamps
    end
    add_index :projects, :material_id
    add_index :projects, :slug, unique: true
  end
end
