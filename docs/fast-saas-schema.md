### **FastSaaS: Meta-Prompt for SaaS Application Development with Reusable Patterns**

**Objective:**  
We are building a SaaS application where common features like CRUD operations, authentication, access control, background tasks, real-time communication, and templated entities are required. Below is a general framework you can use for building SaaS applications.

---

#### 1. **Abstract Base Classes (ABCs) Overview**

- **`CRUDBase`**:  
  Provides basic Create, Read, Update, and Delete functionality. You can enable or disable specific CRUD operations per model. Includes pagination, list, and clear functionality. Error handling, such as 404s and permission errors, should be embedded.
  
- **`AuthenticatedEntity`**:  
  Represents any entity that can be authenticated or authorized, such as users, roles, organizations, or agents. This entity is associated with permissions and roles for access control.

- **`Resource`**:  
  Represents a resource that can be owned and has ACL (Access Control Lists) for fine-grained permission control. Use generic ACL tables that manage permissions like `allow` or `deny` on specific resources and actions.

- **`TemplatedResource`**:  
  An abstract class for resources (like agents or environments) that are instantiated from a template. These templates can add specific configurations and parameters. The template system allows new resources to inherit and override parent template configurations.

- **Other ABCs**:  
  Abstract other common patterns (e.g., `NotificationsMixin`, `CacheSystemMixin`) if needed. These should encapsulate commonly reused behavior across SaaS systems, such as sending notifications or caching frequently accessed data.

---

#### 2. **Core Features**

##### **2.1 CRUD Base**

- **Purpose**:  
  To provide basic CRUD operations for any model, ensuring common behavior like object creation, retrieval, updates, deletion, and listing. You can configure support for specific CRUD operations on a per-model basis.

- **Sample Code**:

```python
from pydantic import BaseModel, Field
from typing import List, Optional, TypeVar, Generic, Any
from uuid import UUID, uuid4
from datetime import datetime

# Generic type for CRUD operations
ModelType = TypeVar('ModelType', bound='CRUDBase')

class CRUDBase(BaseModel, Generic[ModelType]):
    id: UUID = Field(default_factory=uuid4, immutable=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

    @classmethod
    @endpoint("/create")
    async def create(cls, data: dict, db_session=Depends(get_db_session), auth_user=Depends(get_auth_user)) -> ModelType:
        """
        1. Validate input data.
        2. Create a new instance of the model with the provided data.
        3. Save the instance to the database.
        4. Return the created instance.

        Errors: 
        - 400 if validation fails.
        """
        pass

    @classmethod
    @endpoint("/{id}/read")
    async def read(cls, id: UUID, db_session=Depends(get_db_session), auth_user=Depends(get_auth_user)) -> ModelType:
        """
        1. Retrieve the instance by ID from the database.
        2. Return the instance details.

        Errors: 
        - 404 if not found.
        """
        pass

    @classmethod
    @endpoint("/{id}/update")
    async def update(cls, id: UUID, data: dict, db_session=Depends(get_db_session), auth_user=Depends(get_auth_user)) -> ModelType:
        """
        1. Retrieve the instance by ID from the database.
        2. Update the instance with the provided data.
        3. Save the changes to the database.
        4. Return the updated instance.

        Errors: 
        - 404 if not found.
        """
        pass

    @classmethod
    @endpoint("/{id}/delete")
    async def delete(cls, id: UUID, db_session=Depends(get_db_session), auth_user=Depends(get_auth_user)) -> bool:
        """
        1. Retrieve the instance by ID from the database.
        2. Delete the instance from the database.
        3. Return success status.

        Errors: 
        - 404 if not found, 403 if unauthorized.
        """
        pass

    @classmethod
    @endpoint("/list")
    async def list(cls, page: int = 1, page_size: int = 20, db_session=Depends(get_db_session), auth_user=Depends(get_auth_user)) -> List[ModelType]:
        """
        1. Retrieve a paginated list of instances from the database.
        2. Return the list of instances.

        Errors: 
        - 400 if pagination parameters are invalid.
        """
        pass

    @classmethod
    @endpoint("/clear")
    async def clear(cls, db_session=Depends(get_db_session), auth_user=Depends(get_auth_user)) -> bool:
        """
        1. Delete all instances from the database.
        2. Return success status.

        Errors: 
        - 403 if unauthorized.
        """
        pass
```

##### **2.2 Authentication and Authorization (AuthenticatedEntity)**

- **Purpose**:  
  Provide a common structure for any entity that can be authenticated or authorized (e.g., users, roles, organizations).

- **Sample Code**:

```python
class AuthenticatedEntity(BaseModel):
    id: UUID = Field(default_factory=uuid4, immutable=True)
    name: str

    class Config:
        orm_mode = True
```

##### **2.3 Access Control (ACL + Resource)**

- **Purpose**:  
  Implement fine-grained access control using ACLs on resources. Each operation on a resource should be governed by ACLs, allowing for flexible permission models.

- **Sample Code**:

```python
class ACL(BaseModel):
    id: UUID = Field(default_factory=uuid4, immutable=True)
    resource: str  # e.g., "User.read", "Agent.update"
    authenticated_entity_id: UUID
    permission: str  # 'allow' or 'deny'

    class Config:
        orm_mode = True

class Resource(BaseModel):
    id: UUID = Field(default_factory=uuid4, immutable=True)
    owner_id: UUID  # FK to AuthenticatedEntity
    acl: List[ACL] = Field(default_factory=list)

    class Config:
        orm_mode = True
```

##### **2.4 Templated Resources (Cloning from Templates)**

- **Purpose**:  
  Allows entities like agents or environments to be instantiated from templates, inheriting default configurations and allowing for overrides.

- **Sample Code**:

```python
class TemplatedResource(Resource):
    template_id: Optional[UUID] = None
    params: dict = Field(default_factory=dict)

    @classmethod
    async def clone_from_template(cls, template_id: UUID, override_params: dict, db_session=Depends(get_db_session)) -> 'TemplatedResource':
        """
        1. Retrieve the template by ID.
        2. Clone the template, applying any override params.
        3. Save the new instance to the database.
        4. Return the cloned resource.

        Errors: 
        - 404 if template not found.
        """
        pass
```

---

#### 3. **Real-Time and Background Task Features**

##### **3.1 Notifications System**

- **Purpose**:  
  Send real-time notifications to users through WebSockets. Background services (e.g., agents) can trigger notifications when certain tasks are complete.

- **Sample Code**:

```python
from fastapi import WebSocket

class NotificationSystem(BaseModel):
    @endpoint("/notify")
    async def notify(self, message: str, user_id: UUID, db_session=Depends(get_db_session)) -> bool:
        """
        1. Send a notification message to the given user.
        2. Return success status.

        Example:
        >>> await notify(message="Task completed", user_id=user.id)
        True
        """
        pass

    async def notification_listener(self, websocket: WebSocket):
        """
        1. Listen for WebSocket connections.
        2. Send real-time notifications to connected users.
        """
        pass
```

##### **3.2 Background Tasks (Agents, Environments)**

- **Purpose**:  
  Agents, environments, and other entities can run background tasks asynchronously. These tasks can be managed via scheduling, and WebSocket streams can be used to update the user in real-time.

- **Sample Code**:

```python
@scope("/agents", acl_admins=['superadmin'], acl_allow_always=['superadmin'])
class Agent(CRUDBase, TemplatedResource):
    name: str
    owner_id: UUID  # User or Organization
    config: dict
    status: str = "idle"
    task_queue: List[str] = Field(default_factory=list, exclude=True)

    @endpoint("/command")
    async def command(self, id: UUID, task: str, db_session=Depends(get_db_session)) -> bool:
        """
        1. Add the task to the agent's task queue.
        2. Update agent status to "busy."
        3. Return success status.

        Errors:
        - 403 if unauthorized.
        - 404 if agent not found.

        Example:
        >>> await agent.command(id=agent.id, task="scrape_data")
        True
        """
        pass

    @endpoint("/{id}/status")
    async def get_status(self, id: UUID, db_session=Depends(get_db_session)) -> str:
        """
        

 1. Retrieve the status of the agent.
         2. Return the current status.

         Errors:
         - 404 if agent not found.

         Example:
         >>> await agent.get_status(id=agent.id)
         "idle"
        """
        pass
```

---

#### 4. **Configuration and Customization**

##### **4.1 Settings Management**

- **Purpose**:  
  Centralize configuration for the application, allowing for dynamic adjustments and environment-specific configurations.

- **Sample Code**:

```python
class Settings(BaseModel):
    debug: bool = False
    database_url: str
    redis_url: str

    @classmethod
    def load(cls, env: str) -> 'Settings':
        """
        Load settings based on the environment (e.g., 'development', 'production').
        """
        pass
```

---

#### 5. **Data Validation and Transformation**

##### **5.1 Input Validation**

- **Purpose**:  
  Ensure that all incoming data adheres to required formats and constraints. This helps to prevent invalid data from affecting the application's behavior.

- **Sample Code**:

```python
from pydantic import BaseModel, validator

class User(BaseModel):
    email: str
    password: str

    @validator('email')
    def validate_email(cls, v):
        if "@" not in v:
            raise ValueError('Invalid email address')
        return v

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v
```

##### **5.2 Output Transformation**

- **Purpose**:  
  Transform data before sending it to clients. This might include hiding sensitive fields, formatting dates, or converting data types.

- **Sample Code**:

```python
class UserResponse(BaseModel):
    id: UUID
    email: str

    @staticmethod
    def from_user(user: User) -> 'UserResponse':
        return UserResponse(
            id=user.id,
            email=user.email
        )
```

#### 6. **Error Handling**

##### **6.1 Custom Error Responses**

- **Purpose**:  
  Provide clear and consistent error messages. Custom error classes can help manage different types of errors and their responses.

- **Sample Code**:

```python
from fastapi import HTTPException, status

class CustomHTTPException(HTTPException):
    def __init__(self, detail: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        super().__init__(status_code=status_code, detail=detail)

def handle_not_found():
    raise CustomHTTPException(detail="Resource not found", status_code=status.HTTP_404_NOT_FOUND)

def handle_permission_denied():
    raise CustomHTTPException(detail="Permission denied", status_code=status.HTTP_403_FORBIDDEN)
```

#### 7. **Testing**

##### **7.1 Unit Testing**

- **Purpose**:  
  Ensure individual components work as expected. This includes testing CRUD operations, authentication, and access control.

- **Sample Code**:

```python
import pytest
from fastapi.testclient import TestClient

client = TestClient(app)  # Assuming `app` is your FastAPI application instance

def test_create_user():
    response = client.post("/users/", json={"email": "test@example.com", "password": "password123"})
    assert response.status_code == 201
    assert response.json()["email"] == "test@example.com"
```

##### **7.2 Integration Testing**

- **Purpose**:  
  Test how different components of the application work together. This includes interactions between the database, services, and external APIs.

- **Sample Code**:

```python
def test_user_authentication():
    response = client.post("/login/", json={"email": "test@example.com", "password": "password123"})
    assert response.status_code == 200
    assert "access_token" in response.json()
```

#### 8. **Deployment and Scaling**

##### **8.1 Containerization**

- **Purpose**:  
  Use Docker to package the application and its dependencies into a container, simplifying deployment and scaling.

- **Sample Dockerfile**:

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

##### **8.2 Orchestration**

- **Purpose**:  
  Use Kubernetes or Docker Compose to manage and scale containers. This includes setting up replicas, load balancing, and rolling updates.

- **Sample Kubernetes Deployment YAML**:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: myapp
        image: myapp:latest
        ports:
        - containerPort: 8000
```

##### **8.3 Monitoring and Logging**

- **Purpose**:  
  Implement monitoring and logging to track the health and performance of the application. This helps with debugging and maintaining the application.

- **Sample Logging Setup**:

```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def some_function():
    logger.info("This is an info message")
    try:
        # some code that may raise an exception
        pass
    except Exception as e:
        logger.error(f"An error occurred: {e}")
```

#### 9. **Documentation**

##### **9.1 API Documentation**

- **Purpose**:  
  Provide clear and interactive documentation for the API endpoints. Tools like FastAPI's built-in documentation and Swagger UI can be used.

- **Sample Configuration**:

```python
from fastapi import FastAPI

app = FastAPI(title="My SaaS App", description="This is a sample SaaS application.", version="1.0")

@app.get("/docs")
def get_docs():
    return {"message": "Visit /docs for interactive API documentation."}
```

##### **9.2 Code Comments and README**

- **Purpose**:  
  Write meaningful comments and maintain an up-to-date README file to help other developers understand and use the code.

- **Sample README Section**:

```markdown
# My SaaS Application

## Overview

This application provides a set of APIs for managing users, agents, and templates.

## Running the Application

1. Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

2. Start the server:
    ```bash
    uvicorn main:app --reload
    ```

## API Endpoints

- **Create User**: `POST /users/`
- **Get User**: `GET /users/{id}`
- **Update User**: `PUT /users/{id}`
- **Delete User**: `DELETE /users/{id}`
```
