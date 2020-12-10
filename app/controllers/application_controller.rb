class ApplicationController < ActionController::Base
  force_ssl if: :ssl_configured?
  protect_from_forgery with: :exception

  def index
    @projects = Project.where(is_visible: true).reorder("RANDOM()").take(6)
    @features = Feature.where(is_visible: true).where.not(image: nil).take(4)
    @materials = Material.where(is_visible: true).where.not(image: nil).take(4)
    render template: "index"
  end

  def about
    render template: "about/index"
  end

  def resources
    @resources = Resource.where(is_visible: true)
    render template: "resources/index"
  end

  def terms_of_use
    render template: "legal/terms-of-use"
  end

  def terms_of_sale
    render template: "legal/terms-of-sale"
  end

  def privacy_policy
    render template: "legal/privacy-policy"
  end

  def robots
    @domain = "https://www.imagewall.com"
    @text   = "# ImageWall\n\nSitemap: #{@domain}/sitemap.xml\nUser-agent: *"
    render text: @text, layout: false, content_type: "text/plain"
  end

  def sitemap
    @domain = "https://www.imagewall.com"
    @projects = Project.where(is_visible: true)
    render template: "sitemap"
  end

  private

  def after_sign_in_path_for(resource)
    if current_user.is_admin
      return "/admin"
    else
      super
    end
  end

  def ssl_configured?
    !Rails.env.development?
  end

end

