class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable

  has_many :designs

  # Validations
  validates_presence_of :email, :password, on: :create, message: "can't be blank"

  # Default order
  default_scope { order(created_at: :desc) }

  def is_admin
    return self.is_sales_admin || self.is_marketing_admin || self.is_super_admin
  end

  def self.search_by_email(queryStr)
    santizedStr = "%" + queryStr.strip + "%"
    User.where("email ILIKE ?", santizedStr)
  end
end