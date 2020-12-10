class FeaturesController < ApplicationController
  def index
    @features = Feature.where(is_visible: true)
  end
end
