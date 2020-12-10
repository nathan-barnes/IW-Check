class AdminController < ApplicationController
  force_ssl if: :ssl_configured?
  layout "admin"
  before_action :authenticate_user!
  before_action :authorize_admin

  def index
    @users = User.all
    @designs = Design.all
    render template: '/admin/index'
  end

  def about
  end

  def contact
  end

  private

  def authorize_admin
    if !current_user || !current_user.is_admin
      redirect_to root_url, alert: 'Admin only'
    end
  end

  def authorize_sales_admin
    if !(current_user.is_sales_admin || current_user.is_super_admin)
      redirect_to root_url, alert: 'Sales Admin only'
    end
  end

  def authorize_marketing_admin
    if !(current_user.is_marketing_admin || current_user.is_super_admin)
      redirect_to root_url, alert: 'Marketing Admin only'
    end
  end

  def authorize_super_admin
    if !current_user.is_super_admin
      head :unauthorized
    end
  end

  # def authorize_super_admin
  #   return unless !current_user.is_super_admin
  #   redirect_to root_path, alert: 'Superuser only'
  # end

  def ssl_configured?
    !Rails.env.development?
  end

end