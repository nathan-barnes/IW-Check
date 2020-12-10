class Admin::MaterialCategoriesController < AdminController
  before_action :authorize_marketing_admin
  before_action :authorize_super_admin, only: [:destroy] 

  def index_partial
    render partial: "/admin/partials/category_index", locals: {categories: MaterialCategory.all, thing_pathname: "materials"}
  end

  def new
    @category = MaterialCategory.new
  end
  
  def edit
    material_category
  end

  def create
    MaterialCategory.create(material_category_params)

    redirect_to admin_materials_path
  end

  def update
    material_category.update(material_category_params)

    redirect_to admin_materials_path
  end

  def position
    material_category.insert_at(params[:position] + 1)

    head :ok
  end

  def toggle_visibility
    material_category.update(is_visible: !@category.is_visible)
  end

  def destroy
    material_category.destroy
  end

  private

  def material_category_params
    params.require(:material_category).permit(:title, :subtitle, :description, :is_visible, :position)
  end
 
  def material_category
    @category = MaterialCategory.find_by(slug: params[:slug])
  end
end
