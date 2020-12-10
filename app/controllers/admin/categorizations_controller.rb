class Admin::CategorizationsController < AdminController
  before_action :authorize_marketing_admin
  
  def create
    Categorization.create(category_id: params[:category_id], material_id: params[:material_id], project_id: params[:project_id])

    head :ok
  end

  def destroy
    if params[:material_id]
      categorization = Categorization.find_by(category_id: params[:category_id], material_id: params[:material_id])
    else
      categorization = Categorization.find_by(category_id: params[:category_id], project_id: params[:project_id])
    end
    categorization.destroy

    head :ok
  end
end
