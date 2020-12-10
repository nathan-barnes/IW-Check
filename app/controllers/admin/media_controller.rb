class Admin::MediaController < AdminController
  before_action :authorize_marketing_admin

  def create
    @medium = Medium.create(medium_params)

    render partial: '/admin/partials/medium', locals: {medium: @medium}
  end

  def edit
  end

  def position
    medium.insert_at(params[:position] + 1)
  end

  def destroy
    medium.destroy
  end

  private

  def medium_params
    params.require(:medium).permit(:mediable_type, :mediable_id, :type, :url, :is_visible, :position)
  end

  def medium
    Medium.find(params[:id])
  end
end