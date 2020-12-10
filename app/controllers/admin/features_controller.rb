class Admin::FeaturesController < AdminController
  before_action :authorize_marketing_admin
  before_action :authorize_super_admin, only: [:destroy] 

  def index
    @features = Feature.all
  end

  def show  
  end

  def create
    @feature = Feature.create(feature_params)

    redirect_to edit_admin_feature_path(@feature)
  end

  # def new
  #   @feature = Feature.new
  # end

  def edit
    feature
  end

  def update
    feature.update(feature_params)

    redirect_to admin_features_path
  end

  def update_image
    feature.update(feature_params)

    if @feature.image.to_s.empty?
      render partial: '/admin/partials/image_new'
    else
      render partial: '/admin/partials/image', locals: {thing: @feature}
    end
  end

  def toggle_visibility
    feature.update(is_visible: !@feature.is_visible)
  end

  def position
    feature.insert_at(params[:position] + 1)
  end

  def destroy
    feature.destroy
  end

  private


  # def authorize_super_admin
  #   return unless !current_user.is_super_admin
  #   redirect_to root_path, alert: 'Superuser only'
  # end

  def feature_params
    params.require(:feature).permit(:title, :subtitle, :description, :image, :is_visible, :position)
  end

  def feature
    @feature = Feature.find_by(slug: params[:slug])
  end
end