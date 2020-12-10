class CreateResources < ActiveRecord::Migration[5.1]
  def change
    create_table :resources do |t|
      t.string :title
      t.text :subtitle
      t.text :description
      t.text :file

      t.string  :slug
      t.boolean :is_visible, default: false
      t.integer :position
      t.timestamps
    end

    add_index :resources, :slug, unique: true
  end
end