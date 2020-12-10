class ProjectsController < ApplicationController
  def index
    @projects = Project.where(is_visible: true)
  end

  def show
    project
    if project.categories.any? && project.categories.first.projects.any?
      @related_projects = project.categories.first.projects.where(is_visible: true).where("project_id != ?", @project.id).reorder("RANDOM()").take(6)
    else
      @related_projects = Project.where(is_visible: true).where("id != ?", @project.id).reorder("RANDOM()").take(6)
    end
  end

  def modal
    render template: "projects/modal", layout: false, locals: {project: project, modal: true}
  end

  private

  def project
    @project = Project.find_by(slug: params[:slug])
  end
end
