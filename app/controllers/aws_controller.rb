class AwsController < ApplicationController
  include ActionController::HttpAuthentication::Token::ControllerMethods

  protect_from_forgery with: :null_session
  
  require 'openssl'
  require 'securerandom'
  require 'uri'

  respond_to :json

  def create
    filename = safe_filename(params[:filename])

    if filename
      key = "#{SecureRandom.uuid}/" + filename
      render json: {
        policy: s3_upload_policy_document(params[:mime]),
        signature: s3_upload_signature(params[:mime]),
        key: key,
        success_action_redirect: "/"
      }
    else
      head 400
    end
  end

  private

  # parameterizes filenames to be used as S3 keys
  def safe_filename(filename)
    extension = File.extname(filename).gsub(/^\.+/, '')
    if extension.match('png|jpeg|jpg|gif|pdf|zip|mp4|dwg|dxf|')
      filename = File.basename(filename, ".#{extension}").parameterize
      return "#{filename}.#{extension}"
    else
      return false
    end
  end

  # generate the policy document that amazon is expecting.
  def s3_upload_policy_document(mime)
    Base64.encode64(
      {
        expiration: 30.minutes.from_now.utc.strftime('%Y-%m-%dT%H:%M:%S.000Z'),
        conditions: [
          { bucket: ENV['S3_BUCKET'] },
          { acl: 'public-read' },
          ["starts-with", "$key", ""],
          { success_action_status: '201' },
          { "Content-Type" => mime }
        ]
      }.to_json
    ).gsub(/\n|\r/, '')
  end

  # sign our request by Base64 encoding the policy document.
  def s3_upload_signature(mime)
    Base64.encode64(
      OpenSSL::HMAC.digest(
        OpenSSL::Digest.new('sha1'),
        ENV['AWS_SECRET'],
        s3_upload_policy_document(mime)
      )
    ).gsub(/\n/, '')
  end

end