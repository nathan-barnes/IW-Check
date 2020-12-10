class Category < ApplicationRecord
  has_many :categorizations

  acts_as_list add_new_at: :top

  # Default order
  default_scope { order(position: :asc) }
  
  # Friendly ID for making nice looking slugs in the browser
  extend FriendlyId
  friendly_id :title, use: :slugged
end