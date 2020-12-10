class Categorization < ApplicationRecord
  belongs_to :material
  belongs_to :project
  belongs_to :category
end