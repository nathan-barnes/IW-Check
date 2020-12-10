module ImageHelper

  def featured_image(thing)
    if thing.media.any?
      return thing.media.first.url if thing.media.first.url?
    else
      return false
    end
  end

end