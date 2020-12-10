class ContactForm < MailForm::Base
  attribute :first_name, validate: true
  attribute :last_name,  validate: true
  attribute :email,      validate: /\A([\w\.%\+\-]+)@([\w\-]+\.)+([\w]{2,})\z/i
  attribute :message
  attribute :hidden,     captcha: true

  # Declare the e-mail headers. It accepts anything the mail method in ActionMailer accepts.
  def headers
    {
      subject: %(ImageWall Inquiry [imagewall.com] - Duplicate?),
      to: "team@imagewall.com",
      from: %(#{first_name} #{last_name} <#{email}>)
    }
  end
end