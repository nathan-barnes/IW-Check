class Resource < ApplicationRecord
  # Friendly ID for making nice looking slugs in the browser
  extend FriendlyId
  friendly_id :title, use: :slugged

  acts_as_list add_new_at: :top

  # Default order
  default_scope { order(position: :asc) }

  def first_category
    self.categories.order(:position).first
  end
end