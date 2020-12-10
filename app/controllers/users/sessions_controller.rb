class Users::SessionsController < Devise::SessionsController
# before_action :configure_sign_in_params, only: [:create]

  # GET /resource/sign_in
  # def new
  #   super
  # end

  # POST /login
  def create
    if request.headers['X-Requested-With'] == "XMLHttpRequest"
      resource = User.find_for_database_authentication(email: params[:session][:email])
      return invalid_login_attempt unless resource

      if resource.valid_password?(params[:session][:password])
        sign_in :user, resource
        set_flash_message(:notice, :signed_in, {now: true})
        return render partial: "/partials/menu"
      else
        invalid_login_attempt
      end
    else
      super
    end
  end

  # DELETE /resource/sign_out
  # def destroy
  #   super
  # end

  protected

  def invalid_login_attempt
    set_flash_message(:alert, :invalid, {now: true})
    render json: flash[:alert], status: 401
  end

  # If you have extra params to permit, append them to the sanitizer.
  # def configure_sign_in_params
  #   devise_parameter_sanitizer.permit(:sign_in, keys: [:attribute])
  # end
end
