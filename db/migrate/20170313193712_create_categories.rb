class CreateCategories < ActiveRecord::Migration[5.0]
  def change
    create_table :categories do |t|
      t.string :type

      t.string :title
      t.text :subtitle
      t.text :description

      t.string :slug
      t.boolean :is_visible, default: false
      t.integer :position
      t.timestamps
    end
    add_index :categories, :slug, unique: true
  end
end
