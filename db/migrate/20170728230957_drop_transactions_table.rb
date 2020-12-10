class DropTransactionsTable < ActiveRecord::Migration[5.1]
  def change
    def up
      drop_table :transactions
    end

    def down
      create_table "transactions" do |t|
        t.integer "user_id"
        t.integer "design_id"
        t.decimal "price"
        t.jsonb "design_data"
        t.datetime "created_at", null: false
        t.datetime "updated_at", null: false
        t.index ["design_id"], name: "index_transactions_on_design_id"
        t.index ["user_id"], name: "index_transactions_on_user_id"
      end
    end
  end
end
