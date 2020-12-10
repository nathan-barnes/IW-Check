class Admin::PdfsController < AdminController
  before_action :authorize_marketing_admin

  def paid_half
    @purchase = Design.where(type: "purchase").first
    render pdf: "preview.pdf", disposition: "inline", template: "invoices/paid-half-invoice.html.erb", layout: false, page_size: "Letter"
  end

  def paid_half_zoom
    @purchase = Design.where(type: "purchase").first
    render pdf: "preview.pdf", disposition: "inline", template: "invoices/paid-half-invoice.html.erb", layout: false, zoom: 3.25, page_size: "Letter"
  end

  def paid_full
    @purchase = Design.where(type: "purchase").first
    render pdf: "preview.pdf", disposition: "inline", template: "invoices/paid-full-invoice.html.erb", layout: false, page_size: "Letter"
  end

  def paid_full_zoom
    @purchase = Design.where(type: "purchase").first
    render pdf: "preview.pdf", disposition: "inline", template: "invoices/paid-full-invoice.html.erb", layout: false, zoom: 3.25, page_size: "Letter"
  end
end
