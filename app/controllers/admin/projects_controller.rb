class Admin::ProjectsController < AdminController
  before_action :authorize_marketing_admin
  before_action :authorize_super_admin, only: [:destroy] 

  def index
    @projects = Project.all
  end

  def index_partial
    @projects = Project.all
    render partial: "admin/partials/thing_category_index", locals: { things: @projects, pathname: "gallery", thing_type: "Project" }
  end
  
  def create
    @project = Project.create(project_params)

    redirect_to edit_admin_project_path(@project)
  end

  def edit
    project
    @categories = ProjectCategory.all
    @materials = Material.where(is_visible: true)
  end

  def update
    project.update(project_params)

    redirect_to admin_projects_path
  end

  def toggle_visibility
    project.update(is_visible: !@project.is_visible)
  end

  def position
    project.insert_at(params[:position] + 1)
  end

  def destroy
    project.destroy
  end

  private

  def project_params
    params.require(:project).permit(:title, :subtitle, :description, :is_visible, :position, :material_id, :location, :year, :designer)
  end
 
  def project
    @project = Project.find_by(slug: params[:slug])
  end
end
