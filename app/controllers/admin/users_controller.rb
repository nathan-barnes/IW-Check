class Admin::UsersController < AdminController
  require "will_paginate/array"

  before_action :authorize_sales_admin
  before_action :authorize_super_admin, only: [:destroy] 

  def index
    if (params[:search])
      @users = User.search_by_email(params[:search])
    else
      @users = User.all
    end
    if (params[:admin] && params[:admin] != "false")
      @users = @users.select {|user| user.is_admin }
    end
    @users = @users.paginate(page: params[:page])
  end

  def show
  end

  def edit
    user
    @user_designs = user.designs.all
  end

  def create
  end

  def update
    user.update(user_params)
  end

  def toggle_admin
    # have to use is_x_admin variable because the models were not updating
    # before the partials were rendered
    case params[:admin_type]
    when "sales"
      is_sales_admin = !user.is_sales_admin
      @user.update(is_sales_admin: is_sales_admin)
      render partial: "/admin/partials/sales_admin_toggle", locals: {admin: is_sales_admin}
    when "marketing"
      is_marketing_admin = !user.is_marketing_admin
      @user.update(is_marketing_admin: is_marketing_admin)
      render partial: "/admin/partials/marketing_admin_toggle", locals: {admin: is_marketing_admin}
    when "super"
      is_super_admin = !user.is_super_admin
      @user.update(is_super_admin: is_super_admin)
      render partial: "/admin/partials/super_admin_toggle", locals: {admin: is_super_admin}
    else
      render nothing: true, status: 401
    end
  end

  def destroy
  end

  private

  def user_params
    params.require(:user).permit(:is_sales_admin, :is_marketing_admin, :is_super_admin)
  end

  def user
    @user = User.find(params[:id])
  end

end
