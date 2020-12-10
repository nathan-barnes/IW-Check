class Material < ApplicationRecord
  has_many :designs
  has_many :projects
  has_many :categorizations
  has_many :categories, through: :categorizations

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