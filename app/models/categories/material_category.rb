class MaterialCategory < Category
  has_many :materials, through: :categorizations
end