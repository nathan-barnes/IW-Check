class MaterialsController < ApplicationController
  def index
    @material_categories = MaterialCategory.where(is_visible: true)
  end
end
