class CreateDesigns < ActiveRecord::Migration[5.0]
  def change
    create_table :designs do |t|
      t.integer :user_id
      t.integer :material_id
      t.integer :original_id
      
      t.jsonb :data, default: "{}"
      t.boolean :is_demo, default: false
      t.string :title
      t.string :token
      t.boolean :is_visible, default: false

      t.timestamps
    end
    add_index :designs, :token, unique: true
    add_index :designs, :material_id
    add_index :designs, :user_id
  end
end