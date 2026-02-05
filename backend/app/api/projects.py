from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core import get_db
from app.models import User, Project, user_projects
from app.schemas import ProjectCreate, ProjectResponse, ProjectUpdate
from .auth import get_current_user

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get("/", response_model=List[ProjectResponse])
def list_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all projects the current user has access to."""
    # Get projects where user is a member or creator
    projects = db.query(Project).join(
        user_projects,
        Project.id == user_projects.c.project_id
    ).filter(
        user_projects.c.user_id == current_user.id,
        Project.is_active == True
    ).all()
    
    return projects


@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    project_data: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new project."""
    try:
        # Create new project
        new_project = Project(
            name=project_data.name,
            description=project_data.description,
            created_by=current_user.id,
        )
        
        db.add(new_project)
        db.flush()  # Flush to get the project ID
        
        # Add creator as owner in the association table
        from sqlalchemy import insert
        stmt = insert(user_projects).values(
            user_id=current_user.id,
            project_id=new_project.id,
            role='owner'
        )
        db.execute(stmt)
        
        db.commit()
        db.refresh(new_project)
        
        return new_project
    except Exception as e:
        db.rollback()
        print(f"Error creating project: {str(e)}")  # ログ出力を追加
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create project: {str(e)}"
        )


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific project by ID."""
    # Check if user has access to this project
    project = db.query(Project).join(
        user_projects,
        Project.id == user_projects.c.project_id
    ).filter(
        Project.id == project_id,
        user_projects.c.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or access denied"
        )
    
    return project


@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    project_data: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a specific project."""
    # Get project and check if user is owner or admin
    project = db.query(Project).join(
        user_projects,
        Project.id == user_projects.c.project_id
    ).filter(
        Project.id == project_id,
        user_projects.c.user_id == current_user.id,
        user_projects.c.role.in_(['owner', 'admin'])
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or insufficient permissions"
        )
    
    update_data = project_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)
    
    db.commit()
    db.refresh(project)
    
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete (deactivate) a specific project."""
    # Only project owner can delete
    project = db.query(Project).join(
        user_projects,
        Project.id == user_projects.c.project_id
    ).filter(
        Project.id == project_id,
        user_projects.c.user_id == current_user.id,
        user_projects.c.role == 'owner'
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or insufficient permissions"
        )
    
    # Soft delete by setting is_active to False
    project.is_active = False
    db.commit()
