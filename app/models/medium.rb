class Medium < ApplicationRecord
  # Disable STI on type column
  self.inheritance_column = nil

  # Parents
  belongs_to :mediable, polymorphic: true, touch: true

  # Validations
  validates :mediable_id, :mediable_type, presence: true

  # Position
  acts_as_list scope: [:mediable_id, :mediable_type], add_new_at: :top

  # Default order
  default_scope { order(position: :asc) }
end