class Users::RegistrationsController < Devise::RegistrationsController
# before_action :configure_sign_up_params, only: [:create]
# before_action :configure_account_update_params, only: [:update]

  # GET /resource/sign_up
  # def new
  #   super
  # end

  # POST /resource
  def create
    if request.headers['X-Requested-With'] == "XMLHttpRequest"
      resource = User.new(email: params[:registration][:email], password: params[:registration][:password], password_confirmation: params[:registration][:password_confirmation])
 
      if resource.save

        # Update MailChimp list with new user.

        data = { 
          email_address: params[:registration][:email], 
          status: 'subscribed',
          interests: {
            a7543a7e1a: true
          }
        }
        auth = { username: 'apikey', password: ENV['mailchimp_key'] }

        # Add to Zahner list.
        response = HTTParty.post('https://us2.api.mailchimp.com/3.0/lists/18475d665a/members/', body: data.to_json, basic_auth: auth)
        
        if response["error"]
          puts "Error sending to Mailchimp"
        else
          puts "Sent to Mailchimp"

          # Add to 'ImageWall.com' segment
          response = HTTParty.post('https://us2.api.mailchimp.com/3.0/lists/18475d665a/segments/258481/members/', body: { email_address: params[:registration][:email] }.to_json, basic_auth: auth)

          if response["error"]
            puts "Error adding to segment"
          else
            puts "Added to segment"
          end
        end

        if resource.active_for_authentication?
          set_flash_message :notice, :signed_up, {now: true} if is_navigational_format?
          sign_in(resource)
          return render partial: "/partials/menu"
        else
          # Not sure what would cause active_for_authentication to return false
          set_flash_message :notice, :"signed_up_but_#{resource.inactive_message}", {now: true} if is_navigational_format?
          expire_session_data_after_sign_in!
          return render partial: "/partials/menu"
        end
      else
        clean_up_passwords resource
        invalid_signup_attempt
      end
    else
      super
    end
  end
 

  # GET /resource/edit
  # def edit
  #   super
  # end

  # PUT /resource
  # def update
  #   super
  # end

  # DELETE /resource
  # def destroy
  #   super
  # end

  # GET /resource/cancel
  # Forces the session data which is usually expired after sign
  # in to be expired now. This is useful if the user wants to
  # cancel oauth signing in/up in the middle of the process,
  # removing all OAuth session data.
  # def cancel
  #   super
  # end

  protected

  def invalid_signup_attempt
    set_flash_message(:alert, :invalid, {now: true})
    render json: flash[:alert], status: 401
  end

  # If you have extra params to permit, append them to the sanitizer.
  # def configure_sign_up_params
  #   devise_parameter_sanitizer.permit(:sign_up, keys: [:attribute])
  # end

  # If you have extra params to permit, append them to the sanitizer.
  # def configure_account_update_params
  #   devise_parameter_sanitizer.permit(:account_update, keys: [:attribute])
  # end

  # The path used after sign up.
  # def after_sign_up_path_for(resource)
  #   super(resource)
  # end

  # The path used after sign up for inactive accounts.
  # def after_inactive_sign_up_path_for(resource)
  #   super(resource)
  # end
end
