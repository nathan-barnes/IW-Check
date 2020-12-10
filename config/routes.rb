Rails.application.routes.draw do
  # Currently this is connecting devise/registrations#create, #update, and #destroy to "/"
  # For all that is restful, hopefully we can change this in the future.
  devise_for :users, path: '', path_names: { sign_in: 'login', sign_out: 'logout', sign_up: 'signup' }, controllers: {sessions: 'users/sessions', registrations: 'users/registrations', passwords: 'users/passwords'}

  # Admin
  namespace :admin do
    resources :users, except: [:new, :show]
    put "/users/:id/toggle_admin", to: "users#toggle_admin"

    resources :features, :materials, :resources, param: :slug, except: [:new, :show]
    put "/features/:slug/toggle_visibility", to: "features#toggle_visibility"
    put "/features/:slug/update_image", to: "features#update_image"
    put "/features/:slug/position", to: "features#position"
    get "/materials/index_partial", to: "materials#index_partial"
    put "/materials/:slug/toggle_visibility", to: "materials#toggle_visibility"
    put "/materials/:slug/update_image", to: "materials#update_image"
    put "/materials/:slug/update_tile", to: "materials#update_tile"
    put "/materials/:slug/position", to: "materials#position"
    put "/resources/:slug/toggle_visibility", to: "resources#toggle_visibility"
    put "/resources/:slug/update_file", to: "resources#update_file"
    put "/resources/:slug/update_image", to: "resources#update_image"
    put "/resources/:slug/position", to: "resources#position"

    resources :designs, param: :token
    put "/designs/:token/position", to: "designs#position"
    put "/designs/:token/update_image", to: "designs#update_image"
    put "/designs/:token/toggle_visibility", to: "designs#toggle_visibility"

    resources :projects, path: "/gallery", param: :slug, except: [:new, :show]
    get "/gallery/index_partial", to: "projects#index_partial"
    put "/gallery/:slug/toggle_visibility", to: "projects#toggle_visibility"
    put "/gallery/:slug/position", to: "projects#position"


    resources :categories, path: "/gallery/categories", controller: :project_categories, param: :slug, except: :show
    get "/gallery/categories/index_partial", to: "project_categories#index_partial"
    put "/gallery/categories/:slug/position", to: "project_categories#position"
    put "/gallery/categories/:slug/toggle_visibility", to: "project_categories#toggle_visibility"
    resources :categories, path: "/materials/categories", controller: :material_categories, param: :slug, except: :show
    get "/materials/categories/index_partial", to: "material_categories#index_partial"
    put "/materials/categories/:slug/position", to: "material_categories#position"
    put "/materials/categories/:slug/toggle_visibility", to: "material_categories#toggle_visibility"

    resources :media, only: [:create, :update, :destroy]
    put "/media/:id/position", to: "media#position"

    post "/categorizations", to: "categorizations#create"
    delete "/categorizations", to: "categorizations#destroy"

    put "/metadatum/:id", to: "metadata#update"

    get "/pdf/paid_half", to: "pdfs#paid_half", format: "pdf"
    get "/pdf/paid_half_zoom", to: "pdfs#paid_half_zoom", format: "pdf"
    get "/pdf/paid_full", to: "pdfs#paid_full", format: "pdf"
    get "/pdf/paid_full_zoom", to: "pdfs#paid_full_zoom", format: "pdf"
  end

  # Data
  get "/robots.txt", to: "application#robots"
  get "/sitemap.xml", to: "application#sitemap", format: "xml"

  # Views
  get "/design", to: "designs#index", as: "design_index"
  get "/design/:token", to: "designs#index", as: "design_show"
  post "/design/:token", to: "designs#save"
  put "/design/update_cell", to: "designs#update_cell"
  put "/design/update_cells", to: "designs#update_cells"
  put "/design/:token/update_image", to: "designs#update_image"
  post "/design", to: "designs#save"
  post "/design/:token/purchase", to: "designs#purchase"
  post "/design/:token/get_taxes", to: "designs#get_taxes"

  get  "/features", to: "features#index"
  get  "/materials", to: "materials#index"
  get  "/gallery", to: "projects#index"
  get  "/gallery/:slug", to: "projects#show", as: "project"
  get  "/gallery/:slug/modal", to: "projects#modal"
  get  "/contact", to: "contacts#index"
  post "/contact_forms", to: "contacts#create_contact_form", as: "contact_forms"
  get  "/about", to: "application#about"
  get  "/resources", to: "application#resources"
  get  "/terms-of-use", to: "application#terms_of_use"
  get  "/terms-of-sale", to: "application#terms_of_sale"
  get  "/privacy-policy", to: "application#privacy_policy"


  get "/admin", to: "admin#index"
  get "/admin/about", to: "admin#about"
  get "/admin/contact", to: "admin#contact"

  get "/aws-signed-url", to: "aws#create"

  root to: "application#index"
end
