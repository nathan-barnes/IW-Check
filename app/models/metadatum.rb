class Metadatum < ApplicationRecord
  # Parents
  belongs_to :metadatable, polymorphic: true

  # Validations
  validates :metadatable_id, :metadatable_type, presence: true
end