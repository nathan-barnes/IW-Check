# Create Users
super_admin = User.create(email: "super@test.com", password: "password", is_super_admin: true)
marketing_admin = User.create(email: "marketing@test.com", password: "password", is_marketing_admin: true)
sales_admin = User.create(email: "sales@test.com", password: "password", is_sales_admin: true)
user = User.create(email: "customer@test.com", password: "password")

30.times do
  last_user = User.create(email: Faker::Internet.email, password: "password")
end

# Create Material Categories
material_category_titles = ["Zinc", "Copper", "Aluminum", "Steel", "Stainless Steel"]
5.times do |i|
  last_category = Category.create(type: "MaterialCategory", title: material_category_titles[i], subtitle: Faker::ChuckNorris.fact, description: Faker::Hipster.paragraph(2, false, 4), is_visible: true)
end

# Create Materials and Categorizations
20.times do
  last_material = Material.create(title: Faker::Beer.name, subtitle: Faker::StarWars.quote, description: Faker::Hipster.paragraph(2, false, 4), price: Faker::Commerce.price, image: Faker::Placeholdit.image("305x225"), is_visible: true)
  Categorization.create(material_id: last_material.id, category_id: MaterialCategory.all.sample.id)
end

# Make some materials have multiple categories
Material.all.each do |material|
  category_id = MaterialCategory.all.sample.id
  if (Faker::Boolean.boolean && (material.categories.first.id != category_id))
    Categorization.create(material_id: material.id, category_id: category_id)
  end
end

# Create Project Categories
project_category_titles = ["Facade", "Wall", "Freestanding", "Ceiling"]
4.times do |i|
  Category.create(type: "ProjectCategory", title: project_category_titles[i], subtitle: Faker::ChuckNorris.fact, description: Faker::Hipster.paragraph(2, false, 4), is_visible: true)
end

# Create Projects and Categorizations
20.times do
  last_project = Project.create(material_id: Material.all.sample.id, title: Faker::LordOfTheRings.location, subtitle: Faker::Hacker.say_something_smart, description: Faker::Hipster.paragraph(2, false, 4), is_visible: true)
  Categorization.create(project_id: last_project.id, category_id: ProjectCategory.all.sample.id)
  (rand(5) + 1).times do
    Medium.create(mediable_type: "Project", mediable_id: last_project.id, url: Faker::Placeholdit.image("305x225"), is_visible: true)
  end
end

Project.all.each do |project|
  category_id = ProjectCategory.all.sample.id
  if (Faker::Boolean.boolean && project.categories.first.id != category_id)
    Categorization.create(project_id: project.id, category_id: category_id)
  end
end

# Create Features
10.times do
  Feature.create(title: Faker::GameOfThrones.city, subtitle: Faker::HarryPotter.quote, description: Faker::Hipster.paragraph(2, false, 4), image: Faker::Placeholdit.image("305x225"), is_visible: true)
end

def generate_design_data
  design_data = {
    width: rand(5) + 1,
    height: rand(5) + 1,
    material: Material.all.sample.id,
    typology: ProjectCategory.all.sample.id
  }
end

# Create Designs
design_data = generate_design_data
Design.create(user_id: Faker::Number.between(1, User.count), title: Faker::Book.title, material_id: design_data[:material], data: design_data.to_json, type: "demo", is_visible: true, is_editable: true)
19.times do |n|
  design_data = generate_design_data
  demo_bool = Faker::Boolean.boolean
  Design.create(user_id: Faker::Number.between(1, User.count), title: Faker::Book.title, material_id: design_data[:material], data: design_data.to_json, original_id: (Faker::Number.between(1, n) if Faker::Boolean.boolean), type: ("demo" if demo_bool), is_editable: demo_bool, is_visible: true)
end

# Create Transactions
15.times do
  Transaction.create(user_id: Faker::Number.between(1, User.count), design_id: Faker::Number.between(1, Design.count))
end