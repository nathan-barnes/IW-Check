class CreateMedia < ActiveRecord::Migration[5.0]
  def change
    create_table :media do |t|
      t.string :mediable_type, null: false
      t.integer :mediable_id, null: false
      
      t.string :type
      t.text :url

      t.boolean :is_visible, default: false
      t.integer :position
      t.timestamps
    end
    add_index :media, [:mediable_id, :mediable_type]
  end
end
