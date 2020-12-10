class Users::PasswordsController < Devise::PasswordsController
  # GET /resource/password/new
  # def new
  #   super
  # end

  # This is used when password is forgotten
  # POST /resource/password
  # def create
    # super

    # # This is original code
    # self.resource = resource_class.send_reset_password_instructions(resource_params)
    # yield resource if block_given?

    # if successfully_sent?(resource)
    #   respond_with({}, location: after_sending_reset_password_instructions_path_for(resource_name))
    # else
    #   respond_with(resource)
    # end
  # end

  # GET /resource/password/edit?reset_password_token=abcdef
  # def edit
  #   super
  # end

  # This is used when password is changed
  # PUT /resource/password
  # def update
  #   super
  # end

  # protected

  # def after_resetting_password_path_for(resource)
  #   super(resource)
  # end

  # The path used after sending reset password instructions
  # def after_sending_reset_password_instructions_path_for(resource_name)
  #   super(resource_name)
  # end
end
