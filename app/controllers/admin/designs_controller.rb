class Admin::DesignsController < AdminController
  require "will_paginate/array"

  before_action :authorize_super_admin, only: [:destroy]

  def index
    @demos = Design.where(type: "demo").take(10)
    @designs = Design.where(type: "design").take(10)
    @purchases = Design.where(type: "purchase").take(10)
  end

  def show
    @param = params[:token].singularize 
    @designs = Design.where(type: @param)
    @designs = @designs.paginate(page: params[:page])
  end

  def edit
    design
  end

  def create
  end

  def update
    design.update(design_params)

    redirect_to admin_designs_path
  end

  def update_image
    design.update(design_params)

    if @design.image.to_s.empty?
      render partial: '/admin/partials/image_new'
    else
      render partial: '/admin/partials/image', locals: {thing: @design}
    end
  end

  def position
    design.insert_at(params[:position] + 1)
  end

  def toggle_visibility
    design.update(is_visible: !@design.is_visible)
  end

  def destroy
    design.destroy
  end

  private

  def design_params
    params.require(:design).permit(:type, :title, :image, :position, :is_visible)
  end
 
  def design
    @design = Design.find_by(token: params[:token])
  end
end
