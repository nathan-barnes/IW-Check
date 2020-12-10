class Admin::ProjectCategoriesController < AdminController
  before_action :authorize_marketing_admin
  before_action :authorize_super_admin, only: [:destroy] 

  def index_partial
    render partial: "/admin/partials/category_index", locals: {categories: ProjectCategory.all, thing_pathname: "gallery"}
  end

  def new
    @category = ProjectCategory.new
  end
  
  def edit
    project_category
  end

  def create
    ProjectCategory.create(project_category_params)

    redirect_to admin_projects_path
  end

  def update
    project_category.update(project_category_params)
    redirect_to admin_projects_path
  end

  def position
    project_category.insert_at(params[:position] + 1)

    head :ok
  end

  def toggle_visibility
    project_category.update(is_visible: !@category.is_visible)
  end

  def destroy
    project_category.destroy
  end

  private

  def project_category_params
    params.require(:project_category).permit(:title, :subtitle, :description, :is_visible, :position)
  end
 
  def project_category
    @category = ProjectCategory.find_by(slug: params[:slug])
  end
end
