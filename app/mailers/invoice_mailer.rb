class InvoiceMailer < ApplicationMailer
  default from: "ImageWall Team <team@imagewall.com>"

  def paid_half_invoice_email(purchase)
    @purchase = purchase
    @email = @purchase.purchaser_email
    attachments["IW-Invoice[#{@purchase.token}].pdf"] = WickedPdf.new.pdf_from_string(render_to_string('/invoices/paid-half-invoice'), page_size: "Letter")
    attachments["IW-100TC.pdf"] = File.read("#{Rails.root}/public/legal/IW-100TC.pdf")
    mail(to: @email, subject: "ImageWall Invoice [#{@purchase.token}]")
  end

  def paid_full_invoice_email(purchase)
    @purchase = purchase
    @email = @purchase.purchaser_email
    attachments["IW-Invoice[#{@purchase.token}].pdf"] = WickedPdf.new.pdf_from_string(render_to_string('/invoices/paid-full-invoice'), page_size: "Letter")
    attachments["IW-100TC.pdf"] = File.read("#{Rails.root}/public/legal/IW-100TC.pdf")
    mail(to: @email, subject: "ImageWall Invoice [#{@purchase.token}]")
  end
end
