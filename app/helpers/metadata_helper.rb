module MetadataHelper

  def metadata(page, metadatum)
    # Defaults
    url         = "#{@website.protocol}://#{@website.domain}#{request.fullpath}"
    domain      = @website.domain
    title       = "#{page.title} — #{@website.title}"
    image       = ""
    description = ""
    og_type     = page.class.name.match("Section|Website") ? "Website" : "Article"
    # Loop through metadatum
    if metadatum
      # Title
      title = metadatum.title? ? metadatum.title : "#{page.title} — #{@website.title}"
      # Image
      if metadatum.image?
        image = ix_image_url(metadatum.image, { w: 1920 })
      elsif page.media.exists?(type: "image")
        medium = page.media.where(type: "image").first
        image = medium.media_url? ? ix_image_url(medium.media_url, { w: 1920 }) : ""
      elsif page.class.name.match("Category")
        if page.things.where(is_visible: true).any? && page.things.where(is_visible: true).first.media.where(type: "image").any?
          medium =  page.things.where(is_visible: true).first.media.where(type: "image").first
          image = medium.media_url? ? ix_image_url(medium.media_url, { w: 1920 }) : ""
        end
      end
      # Description
      if metadatum.description?
        description = truncate(metadatum.description, length: 160)
      elsif page.media.exists?(type: "text")
        medium = page.media.where(type: "text").first
        description = medium.text? ? truncate(strip_tags(medium.text).gsub("\u00A0", " ").gsub('"', "'").html_safe, length: 160) : ""

        # <%= strip_tags(element.media.first.text).gsub("&amp;", "&") %>
      elsif page.class.name.match("Category")
        case page.type
        when "category"
          description = "#{page.title} plays a growing role in Zahner’s commitment to the design environment. See below a wide range of projects Zahner has completed for #{page.title}."
        when "typology"
          description = "#{page.title} fabricated with Zahner engineering benefit from high-quality craft and attention to detail. Zahner engineers work with designers and contractors to develop integrated systems which meet a range of desired aesthetics. See below a range of inspirational projects and best practices for #{page.title}."
        when "location"
          description = "#{page.title} is a growing area for art, sculpture, and architecture. Zahner serves the #{page.title} area by providing not only custom fabrication and installation, but also a wide range of engineering and design services for a custom projects in a variety of aesthetics. Zahner has completed #{page.things.where(is_visible: true).count} #{page.things.where(is_visible: true).count > 1 ? "projects" : "project"} in #{page.title}, featured below."
        when "artist"
          description = "#{page.title} has produced #{page.things.where(is_visible: true).count} featured #{page.things.where(is_visible: true).count > 1 ? "projects" : "project"} using Zahner engineering, fabrication, and installation services. Zahner works with artists, sculptors, and conservators around the world to play a supportive role in bringing larger projects into realized works. From emerging to established, Zahner works with artists at every stage of their careers. #{page.title} is an example of an artist who benefits from access to Zahner engineering, fabrication, and installation services for artists."
        when "architect"
          description = "#{page.title} has developed #{page.things.where(is_visible: true).count} featured #{page.things.where(is_visible: true).count > 1 ? "projects" : "project"} with Zahner. Architects come to Zahner for the company’s commitment to developing the designer’s aesthetic to completion. Zahner worked with #{page.title} to develop their design into custom architectural systems, featured below."
        when "color"
          description = "Designing a custom project in #{page.title}? There are a number of ways to achieve a #{page.title} color in a variety of materials and metal systems, including anodization, patina, titanium-coloring, as well as painting processes such as powder-coating.  Below is a selection of inspirational designs in #{page.title} that were manufactured by Zahner."
        when "scale"
          description = "Zahner operates at every scale, from intricate design fabrication for art objects and industrial design, to large-scale developments spanning city blocks. Below is a collection of featured projects completed with Zahner engineering and fabrication completed for #{page.title} projects."
        when "year"
          description = "Projects completed with Zahner engineering and fabrication in #{page.title}. Zahner has been manufacturing custom architectural systems for more than a century. See what featured projects Zahner completed below in #{page.title}."
        end
      end
    end
    return { url: url, domain: domain, title: title, image: image, description: description, og_type: og_type }
  end
end