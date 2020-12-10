class CreateTransactions < ActiveRecord::Migration[5.0]
  def change
    create_table :transactions do |t|
      t.integer :user_id
      t.integer :design_id

      t.decimal :price
      t.jsonb :design_data

      t.timestamps
    end
    add_index :transactions, :user_id
    add_index :transactions, :design_id
  end
end
