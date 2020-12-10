# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20170728230957) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "categories", id: :serial, force: :cascade do |t|
    t.string "type"
    t.string "title"
    t.text "subtitle"
    t.text "description"
    t.string "slug"
    t.boolean "is_visible", default: false
    t.integer "position"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["slug"], name: "index_categories_on_slug", unique: true
  end

  create_table "categorizations", id: :serial, force: :cascade do |t|
    t.integer "project_id"
    t.integer "material_id"
    t.integer "category_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["category_id"], name: "index_categorizations_on_category_id"
    t.index ["material_id"], name: "index_categorizations_on_material_id"
    t.index ["project_id"], name: "index_categorizations_on_project_id"
  end

  create_table "designs", id: :serial, force: :cascade do |t|
    t.integer "user_id"
    t.integer "material_id"
    t.integer "original_id"
    t.jsonb "data", default: "{}"
    t.string "title"
    t.string "token"
    t.boolean "is_visible", default: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "type", default: "design"
    t.integer "purchaser_id"
    t.string "purchaser_email"
    t.boolean "is_editable", default: false
    t.text "image"
    t.integer "position"
    t.decimal "purchase_subtotal"
    t.decimal "purchase_shipping"
    t.decimal "purchase_total"
    t.decimal "purchase_taxes"
    t.decimal "purchase_grand_total"
    t.boolean "is_paid_half", default: false
    t.boolean "is_paid_full", default: false
    t.string "purchaser_fname"
    t.string "purchaser_lname"
    t.decimal "purchase_deposit"
    t.index ["material_id"], name: "index_designs_on_material_id"
    t.index ["token"], name: "index_designs_on_token", unique: true
    t.index ["user_id"], name: "index_designs_on_user_id"
  end

  create_table "features", id: :serial, force: :cascade do |t|
    t.string "title"
    t.text "subtitle"
    t.text "description"
    t.text "image"
    t.string "slug"
    t.boolean "is_visible", default: false
    t.integer "position"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["slug"], name: "index_features_on_slug", unique: true
  end

  create_table "materials", id: :serial, force: :cascade do |t|
    t.string "title"
    t.text "subtitle"
    t.text "description"
    t.text "image"
    t.string "slug"
    t.boolean "is_visible", default: false
    t.integer "position"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "tile"
    t.text "excel_id"
    t.index ["slug"], name: "index_materials_on_slug", unique: true
  end

  create_table "media", id: :serial, force: :cascade do |t|
    t.string "mediable_type", null: false
    t.integer "mediable_id", null: false
    t.string "type"
    t.text "url"
    t.boolean "is_visible", default: false
    t.integer "position"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["mediable_id", "mediable_type"], name: "index_media_on_mediable_id_and_mediable_type"
  end

  create_table "metadata", id: :serial, force: :cascade do |t|
    t.string "metadatable_type"
    t.integer "metadatable_id"
    t.string "title"
    t.text "image"
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["metadatable_id", "metadatable_type"], name: "index_metadata_on_metadatable_id_and_metadatable_type", unique: true
  end

  create_table "projects", id: :serial, force: :cascade do |t|
    t.integer "material_id"
    t.string "title"
    t.text "subtitle"
    t.text "description"
    t.string "slug"
    t.boolean "is_visible", default: false
    t.integer "position"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "location"
    t.integer "year"
    t.text "designer"
    t.index ["material_id"], name: "index_projects_on_material_id"
    t.index ["slug"], name: "index_projects_on_slug", unique: true
  end

  create_table "resources", force: :cascade do |t|
    t.string "title"
    t.text "subtitle"
    t.text "description"
    t.text "file"
    t.string "slug"
    t.boolean "is_visible", default: false
    t.integer "position"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "image"
    t.index ["slug"], name: "index_resources_on_slug", unique: true
  end

  create_table "transactions", id: :serial, force: :cascade do |t|
    t.integer "user_id"
    t.integer "design_id"
    t.decimal "price"
    t.jsonb "design_data"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["design_id"], name: "index_transactions_on_design_id"
    t.index ["user_id"], name: "index_transactions_on_user_id"
  end

  create_table "users", id: :serial, force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.inet "current_sign_in_ip"
    t.inet "last_sign_in_ip"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "is_sales_admin", default: false
    t.boolean "is_marketing_admin", default: false
    t.boolean "is_super_admin", default: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

end
