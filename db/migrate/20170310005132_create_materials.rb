class CreateMaterials < ActiveRecord::Migration[5.0]
  def change
    create_table :materials do |t|
      t.string :title
      t.text :subtitle
      t.text :description
      t.decimal :price
      t.text :image

      t.string  :slug
      t.boolean :is_visible, default: false
      t.integer :position
      t.timestamps
    end
    add_index :materials, :slug, unique: true
  end
end
