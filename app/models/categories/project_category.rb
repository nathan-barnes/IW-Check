class ProjectCategory < Category
  has_many :projects, through: :categorizations
end