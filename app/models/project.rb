class Project < ApplicationRecord
  # After create methods
  after_create :build_metadata

  belongs_to :material
  
  has_one :metadatum, as: :metadatable, dependent: :destroy
  has_many :media, -> { order(position: :asc) }, as: :mediable, dependent: :destroy
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

  private
  
  def build_metadata
    title = "#{self.title} — ImageWall"
    Metadatum.create( metadatable_id: self.id, metadatable_type: "Feature", title: title)
  end

  def should_generate_new_friendly_id?
    title_changed? || super
  end

end