class ContactsController < ApplicationController
  
  def index
  	@contact_form = ContactForm.new
  	render template: "/contact/index"
  end

  # def new_contact_form
  #   @contact_form = ContactForm.new
  # end

  def create_contact_form
    begin
      @contact_form = ContactForm.new(params[:contact_form]) 
      @contact_form.request = request 
      if @contact_form.deliver 
        flash[:notice] = "Thank you for your message! We'll be in touch shortly." 
      else
        flash[:alert] = ":( Message delivery failed. Try again."
      end
    rescue ScriptError 
      flash[:alert] = "Sorry, we counldn't deliver your message." 
    end
  end
end