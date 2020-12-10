class DesignsController < ApplicationController
  before_action :check_access_token_and_workbook_id, only: [:index, :update_cells, :get_price, :purchase, :stripe_purchase]

  Dev_sheet_id = "016WRBMLXGN3CZUONDNZDIFDHOZEN37BWJ"
  Prod_sheet_id = "016WRBMLRB5Z5THE7AMBALGKPYL5MSL5EK"
  Workbook_URL = "https://graph.microsoft.com/v1.0/me/drive/items/" + (Rails.env.production? ? Prod_sheet_id : Dev_sheet_id) + "/workbook/"


  def index
    if params[:token]
      @design = Design.find_by(token: params[:token])
      if @design.nil?
        flash.now[:notice] = "Design not found"
      else
        @design_data = @design.data
      end
    else
      @design = false
      @design_data = {}
    end

    @material_categories = MaterialCategory.where(is_visible: true)
    @materials = {}

    @material_categories.each do |category|
      category.materials.where(is_visible: true).each do |material|

        material_data = {
          metal: category.slug
        }

        if File.exist?("#{Rails.root}/app/assets/images/materials/#{material.excel_id}.jpg")
          material_data[:url] = ActionController::Base.helpers.asset_url("materials/#{material.excel_id}.jpg")
        end

        @materials[material.excel_id] = material_data
      end
    end

    @resources = Resource.where(is_visible: true).take(4)
    @project_categories = ProjectCategory.where(is_visible: true)
    @projects = Project.where(is_visible: true).take(6)
    @demos = Design.where(type: "demo").take(6)


    if current_user && @design && current_user.id == @design.user_id
      @is_owner = true
    else
      @is_owner = false
    end

    render template: "/design/index"
  end

  def update_cells(pricing_obj=nil)
    if pricing_obj.nil?
      pricing_obj = params[:pricingObject]
    end

    values = [["Value"]]
    
    Design.attribute_list.each do |attribute|
      if (pricing_obj[attribute])
        values.append([pricing_obj[attribute]])
      else
        values.append(['-'])
      end
    end
    body = {
      'values' => values
    }

    response = HTTParty.patch(Workbook_URL + "tables/WebsiteInput/Columns('Value')/range", headers: spreadsheet_api_header, body: body.to_json)

    puts "Update Cells"

    if response["error"]
      if fix_errors(response) == 200
        update_cells(pricing_obj)
      else
        head 400
      end
    else
      excel_result = get_price
      render json: excel_result
    end
  end

  def get_price

    response = HTTParty.get(Workbook_URL + "names('websiteExport')/range?$select=values", headers: spreadsheet_api_header)

    puts "Get Price"

    if response["error"]
      if fix_errors(response) == 200
        get_price
      else
        head 400
      end
    else
      result_object = {
        imagewall_cost: response["values"][0][0], 
        shipping_cost: response["values"][1][0],
        panel_thickness: response["values"][2][0],
        rom_min: response["values"][3][0],
        rom_max: response["values"][4][0]
      }
      return result_object
    end
  end

  def save
    if params[:token]
      @design = Design.find_by(token: params[:token])
      if !params[:duplicate] && @design.type == "design" && @design.user_id == current_user.id
        @design.update(title: params[:title], data: params[:designData])
      elsif !params[:duplicate] && @design.type == "demo" && current_user.is_super_admin
        @design.update(title: params[:title], data: params[:designData])
      else
        @new_design = Design.create(user_id: current_user.id, title: params[:title], data: params[:designData], original_id: @design.id)
        render json: {token: @new_design.token, user_id: current_user.id}, status: :ok
      end
    else
      @new_design = Design.create(user_id: current_user.id, title: params[:title], data: params[:designData])
      render json: {token: @new_design.token, user_id: current_user.id}, status: :ok
    end
  end

  def update_image
    @design = Design.find_by(token: params[:token])
    if @design.type != "demo"
      @design.update(image: params[:design][:image])
    end
  end

  def purchase
    @original = Design.find_by(token: params[:token])

    if @original.is_paid_half
      @purchase = @original
      @purchase.update(is_paid_full: true, purchaser_email: params[:email])

      InvoiceMailer.paid_full_invoice_email(@purchase).deliver
    else
      # Calculate final cost
      price = get_price
      puts "PRICE: #{price}"

      taxes = JSON.parse(get_taxes(price[:imagewall_cost], price[:shipping_cost], params[:shipping_data], true))
      puts "TAXES: #{taxes}"

      total = price[:imagewall_cost] + price[:shipping_cost]
      puts "TOTAL: #{total}"

      grand_total = (total + taxes["amount_to_collect"]).ceil
      puts "GRAND TOTAL: #{grand_total}"

      deposit = grand_total / 2

      # Create purchase object
      @purchase = Design.create(
        type: "purchase", 
        data: @original.data, 
        title: @original.title, 
        user_id: @original.user_id, 
        original_id: @original.id, 
        material_id: @original.material_id, 
        is_visible: true, 
        is_editable: false, 
        purchaser_id: params[:purchaser_id], 
        purchaser_fname: params[:name][:fname],
        purchaser_lname: params[:name][:lname],
        purchaser_email: params[:email],
        purchase_subtotal: price[:imagewall_cost],
        purchase_shipping: price[:shipping_cost],
        purchase_total: total,
        purchase_taxes: taxes["amount_to_collect"],
        purchase_grand_total: grand_total,
        purchase_deposit: deposit,
        is_paid_half: true
      )
      if current_user
        @purchase.update(purchaser_id: current_user.id)
      end

      InvoiceMailer.paid_half_invoice_email(@purchase).deliver
    end

    render json: @purchase.token
  end

  def stripe_purchase
    @original = Design.find_by(token: params[:token])

    if @original.is_paid_half
      @purchase = @original

      deposit = @purchase.purchase_deposit
      
      # Amount in client_secret
      @amount = (deposit * 100).to_i

      # Should we check for existing users here? How to do this without the id, and what is the downside
      # of repeatedly saving?
      customer = Stripe::Customer.create(
        :email => params[:stripeToken][:email],
        :source  => params[:stripeToken][:id]
      )

      charge = Stripe::Charge.create(
        :customer    => customer.id,
        :amount      => @amount,
        :description => "Rails Stripe customer",
        :currency    => "usd"
      )

      @purchase.update(is_paid_full: true, purchaser_email: params[:stripeToken][:email])

      InvoiceMailer.paid_full_invoice_email(@purchase).deliver
    else

      # Calculate final cost
      price = get_price
      puts "PRICE: #{price}"

      taxes = JSON.parse(get_taxes(price[:imagewall_cost], price[:shipping_cost], params[:shipping_data], true))
      puts "TAXES: #{taxes}"

      total = price[:imagewall_cost] + price[:shipping_cost]
      puts "TOTAL: #{total}"

      grand_total = (total + taxes["amount_to_collect"]).ceil
      puts "GRAND TOTAL: #{grand_total}"

      deposit = grand_total / 2

      # Amount in client_secret
      @amount = (deposit * 100).to_i

      customer = Stripe::Customer.create(
        :email => params[:stripeToken][:email],
        :source  => params[:stripeToken][:id]
      )

      # I wonder what the downside might be to continually creating users when they might already exist
      charge = Stripe::Charge.create(
        :customer    => customer.id,
        :amount      => @amount,
        :description => "Rails Stripe customer",
        :currency    => "usd"
      )

      # Create purchase object
      @purchase = Design.create(
        type: "purchase", 
        data: @original.data, 
        title: @original.title, 
        user_id: @original.user_id, 
        original_id: @original.id, 
        material_id: @original.material_id, 
        is_visible: true, 
        is_editable: false, 
        purchaser_id: params[:purchaser_id],
        purchaser_email: params[:stripeToken][:email],
        purchase_subtotal: price[:imagewall_cost],
        purchase_shipping: price[:shipping_cost],
        purchase_total: total,
        purchase_taxes: taxes["amount_to_collect"],
        purchase_grand_total: grand_total,
        purchase_deposit: deposit,
        is_paid_half: true
      )
      if current_user
        @purchase.update(purchaser_id: current_user.id)
      end

      InvoiceMailer.paid_half_invoice_email(@purchase).deliver
    end

    render json: @purchase.token

  rescue Stripe::CardError => e
    render json: {errors: e.message}, status: 422
  end

  def get_taxes(imagewall_cost=nil, shipping_cost=nil, shipping_data=nil, internal=false)
    require "taxjar"

    if (shipping_data.nil?)
      imagewall_cost = params[:imagewall_cost]
      shipping_cost = params[:shipping_cost]
      shipping_data = params[:shipping_data]
    end

    client = Taxjar::Client.new(api_key: ENV["taxjar_secret_key"])

    if ( shipping_data["state"].in?(["MO", "KS", "TX", "NY", "NJ", "FL", "MS", "CA", "IL"]) )
      order = client.tax_for_order({
        to_street: shipping_data["street"],
        to_city: shipping_data["city"],
        to_state: shipping_data["state"],
        to_zip: shipping_data["zipcode"],
        to_country: shipping_data["country"],
        amount: imagewall_cost,
        shipping: shipping_cost
      })
    else
      order = client.tax_for_order({
        to_street: "1400 E 9th St",
        to_city: "Kansas City",
        to_state: "MO",
        to_zip: "64106-1719",
        to_country: "US",
        amount: imagewall_cost,
        shipping: shipping_cost
      })
    end

    if internal
      return order.to_json
    else
      render json: order
    end
  end

  private

  def check_access_token_and_workbook_id
    if session[:_access_token].nil?
      set_access_token
    end

    if session[:_workbook_id].nil?
      set_workbook_id
    end
  end

  def set_access_token
    data = {
      resource: "https://graph.microsoft.com/",
      client_id: ENV["pricing_client_id"],
      client_secret: ENV["pricing_client_secret"],
      grant_type: "password",
      username: ENV["pricing_username"],
      password: ENV["pricing_password"],
    }
    puts "Set Access Token"
    response = HTTParty.post('https://login.windows.net/cec15633-20c2-4214-9ca4-5f3b41742ae3/oauth2/token', body: data)
    if response["error"]
      return 400
    else
      session[:_access_token] = response["access_token"]
      return 200
    end
  end

  def set_workbook_id
    auth = "Bearer " + session[:_access_token]
    header = {
      'Authorization' => auth,
      'Content-Type' => 'application/json'
    }
    data = {
      persistChanges: "false"
    }

    response = HTTParty.post(Workbook_URL + 'createSession', body: data.to_json, headers: header)

    puts "Set Workbook Id"

    if response["error"] && response["error"]["message"] == "Access token has expired."
      if set_access_token == 200
        set_workbook_id
      else
        head 400
      end
    else
      session[:_workbook_id] = response["id"]
    end
  end

  def fix_errors(response)
    if response["error"]
      puts response
      if response["error"]["message"] == "Access token has expired." || response["error"]["code"] == "InvalidAuthenticationToken"
        set_access_token
        return 200
      elsif response["error"]["message"] == "Workbook Not Found" || response["error"]["code"] == "FileOpenNotFound" || response["error"]["code"] == "InvalidOrTimedOutSession"
        set_workbook_id
        return 200
      else
        return 400
      end
    end
  end

  def spreadsheet_api_header
    header = {
      'Authorization' => "Bearer " + session[:_access_token], 
      'Content-Type' => 'application/json',
      'workbook-session-id' => session[:_workbook_id]
    }
  end
end
