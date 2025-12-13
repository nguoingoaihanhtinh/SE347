-- Project access & type
CREATE TYPE project_access AS ENUM ('public', 'private');
CREATE TYPE project_type AS ENUM ('scrum', 'kanban');

-- Issue type & priority
CREATE TYPE issue_type AS ENUM ('task', 'story', 'bug', 'epic');
CREATE TYPE issue_priority AS ENUM ('low', 'medium', 'high', 'critical');

-- Team member role
CREATE TYPE team_member_role AS ENUM ('admin', 'member', 'viewer');

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  key TEXT NOT NULL UNIQUE CHECK (key ~ '^[A-Z]+$' AND LENGTH(key) BETWEEN 2 AND 10),
  access project_access NOT NULL DEFAULT 'private',
  type project_type NOT NULL DEFAULT 'kanban',
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger để cập nhật updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

  CREATE TABLE project_columns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_project_columns_updated_at
  BEFORE UPDATE ON project_columns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


--Sprint table
  CREATE TABLE sprints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  date_started DATE NOT NULL,
  date_ended DATE NOT NULL,
  duration INTEGER GENERATED ALWAYS AS (date_ended - date_started) STORED,
  goal TEXT,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (date_ended >= date_started)
);

CREATE TRIGGER update_sprints_updated_at
  BEFORE UPDATE ON sprints
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Issue table
CREATE TABLE issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  key TEXT NOT NULL, -- e.g., "PROJ-123"
  summary TEXT,
  description TEXT,
  story_point INTEGER DEFAULT 0 CHECK (story_point >= 0),
  type issue_type,
  priority issue_priority,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  sprint_id UUID REFERENCES sprints(id) ON DELETE SET NULL,
  column_id UUID NOT NULL REFERENCES project_columns(id) ON DELETE RESTRICT,
  creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES issues(id) ON DELETE CASCADE, -- self-reference for subtasks/epics
  team_id UUID REFERENCES project_teams(id) ON DELETE SET NULL,
  attachments JSONB DEFAULT '[]', -- array of URLs or file keys
  due_date_from TIMESTAMPTZ,
  due_date_to TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, key)
);

CREATE TRIGGER update_issues_updated_at
  BEFORE UPDATE ON issues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Optional index
CREATE INDEX idx_issues_project ON issues(project_id);
CREATE INDEX idx_issues_column ON issues(column_id);
CREATE INDEX idx_issues_assignee ON issues(assignee_id);

-- Project team table
CREATE TABLE project_teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  permission_keys TEXT[] DEFAULT '{}', -- e.g., ['view_issues', 'edit_sprint']
  member_ids UUID[] DEFAULT '{}', -- denormalized for performance (optional)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_project_teams_updated_at
  BEFORE UPDATE ON project_teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Permisson table
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  label TEXT NOT NULL,
  description TEXT,
  resource TEXT NOT NULL, -- e.g., 'issue', 'sprint', 'project'
  action TEXT NOT NULL,   -- e.g., 'create', 'update', 'delete'
  key TEXT NOT NULL UNIQUE -- e.g., 'issue:edit'
);

-- Project team members table
CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role team_member_role NOT NULL DEFAULT 'member',
  is_pending BOOLEAN NOT NULL DEFAULT true,
  team_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

CREATE TRIGGER update_project_members_updated_at
  BEFORE UPDATE ON project_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comment table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT,
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Activity log table
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name TEXT, -- cache in case user is deleted
  action_type TEXT NOT NULL, -- e.g., 'ISSUE_CREATED', 'ISSUE_UPDATED'
  changes JSONB DEFAULT '[]', -- array of { field, oldValue, newValue }
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_activities_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_activities_issue ON activities(issue_id);
CREATE INDEX idx_activities_project ON activities(project_id);