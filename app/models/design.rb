class Design < ApplicationRecord
  self.inheritance_column = nil
  
  # Before create methods
  before_create :generate_token

  belongs_to :material
  belongs_to :creator, foreign_key: "user_id", class_name: "User"

  has_one  :metadatum, as: :metadatable, dependent: :destroy

  acts_as_list add_new_at: :top

  # Default order
  default_scope { order(position: :asc) }

  private

  def generate_token
    self.token = loop do
      random_token = SecureRandom.hex(3)
      break random_token unless Design.exists?(token: random_token)
    end
  end

  # DO NOT EDIT THIS UNLESS YOU KNOW WHAT YOU'RE DOING!
  # This list must correspond EXACTLY with the cells
  # in the Excel spreadsheet called from update_cells
  #
  #                 ,;+#@#+;.               
  #            ;@@@@@@@@@@@@@@@@@,          
  #          @@@@@@@@@@@@@@@@@@@@@@@        
  #         @@@@@@@@@@@@@@@@@@@@@@@@.       
  #         `@@@@@@@@@@@@@@@@@@@@@@@        
  #          @@@@@@@@@@@@@@@@@@@@@@@        
  # `@@@     @@+     .@@@@'`     @@,    .@@@
  #  .@@@#. @@@#      #@@@,      @@@# :@@@@ 
  # '@@@@@@@, @@@@@@@@@; @@@@@@@@@' #@@@@@@@
  #          ,  ,;#@@@',#.@@@@':, `         
  #                .@@@@@@@@'.              
  #      ;'+#@@@@@` `@:@`@ @` ,@@@@@#+',    
  #       :@@@@@;               #@@@@@.     
  #         ##`                   ;@'       
  #
  def self.attribute_list
    [
      "panelNumber",
      "overallWidth",
      "overallHeight",
      "panelWidth",
      "panelHeight",
      "gridSize",
      "gridType",
      "perfShape",
      "reductionType",
      "reductionPercent",
      "panelMaterial",
      "panelColor",
      "structureMaterial",
      "structureColor",
      "city",
      "system",
      "mullion",
      "anchorDepth",
      "distance",
      "windCategory",
      "exposure",
      "minPanelThickness"
    ]
  end

end