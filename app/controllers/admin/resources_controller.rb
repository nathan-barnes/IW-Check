class Admin::ResourcesController < AdminController
  before_action :authorize_marketing_admin
  before_action :authorize_super_admin, only: [:destroy] 

  def index
    @resources = Resource.all
  end

  def index_partial
    @resources = Resource.all
    render partial: "admin/partials/thing_category_index", locals: { things: @resources, pathname: "resources", thing_type: "Resource" }
  end

  def create
    @resource = Resource.create(resource_params)

    redirect_to edit_admin_resource_path(@resource)
  end

  def edit
    resource
  end

  def update
    resource.update(resource_params)

    redirect_to admin_resources_path
  end

  def update_file
    resource.update(resource_params)

    if @resource.file.to_s.empty?
      render partial: '/admin/partials/file_new'
    else
      render partial: '/admin/partials/file', locals: {thing: @resource}
    end
  end

  def update_image
    resource.update(resource_params)

    if @resource.image.to_s.empty?
      render partial: '/admin/partials/image_new'
    else
      render partial: '/admin/partials/image', locals: {thing: @resource}
    end
  end

  def toggle_visibility
    resource.update(is_visible: !@resource.is_visible)
  end

  def position
    resource.insert_at(params[:position] + 1)
  end

  def destroy
    resource.destroy
  end

  private

  def resource_params
    params.require(:resource).permit(:title, :subtitle, :description, :file, :image, :is_visible, :position)
  end

  def resource
    @resource = Resource.find_by(slug: params[:slug])
  end
end