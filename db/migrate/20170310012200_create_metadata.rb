class CreateMetadata < ActiveRecord::Migration[5.0]
  def change
    create_table :metadata do |t|
      t.string :metadatable_type
      t.integer :metadatable_id
      
      t.string :title
      t.text :image
      t.text :description
      t.timestamps
    end
    add_index :metadata, [:metadatable_id, :metadatable_type], unique: true
  end
end
