class Admin::MaterialsController < AdminController
  before_action :authorize_marketing_admin
  before_action :authorize_super_admin, only: [:destroy] 

  def index
    @materials = Material.all
  end

  def index_partial
    @materials = Material.all
    render partial: "admin/partials/thing_category_index", locals: { things: @materials, pathname: "materials", thing_type: "Material" }
  end

  def create
    @material = Material.create(material_params)

    redirect_to edit_admin_material_path(@material)
  end

  def edit
    material
    @categories = MaterialCategory.all
  end

  def update
    material.update(material_params)

    redirect_to admin_materials_path
  end

  def update_image
    material.update(material_params)

    if @material.image.to_s.empty?
      render partial: '/admin/partials/image_new'
    else
      render partial: '/admin/partials/image', locals: {thing: @material}
    end
  end

  def update_tile
    material.update(material_params)

    if @material.tile.to_s.empty?
      render partial: '/admin/partials/tile_new'
    else
      render partial: '/admin/partials/tile', locals: {thing: @material}
    end
  end

  def toggle_visibility
    material.update(is_visible: !@material.is_visible)
  end

  def position
    material.insert_at(params[:position] + 1)
  end

  def destroy
    material.destroy
  end

  private

  def material_params
    params.require(:material).permit(:title, :subtitle, :description, :image, :is_visible, :position, :tile, :excel_id)
  end

  def material
    @material = Material.find_by(slug: params[:slug])
  end
end