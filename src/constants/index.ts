export const SPRINT_STATUSES = ['Planning', 'Active', 'Completed'] as const;
export type SprintStatus = typeof SPRINT_STATUSES[number];

export const GOAL_STATUSES = ['Complete', 'Incomplete', 'In Progress', 'Not Started', 'TBD'] as const;
export type GoalStatus = typeof GOAL_STATUSES[number];

export const PROJECT_STATUSES = ['Active', 'On Hold', 'Archived'] as const;
export type ProjectStatus = typeof PROJECT_STATUSES[number];

export const MEMBER_ROLES = ['Admin', 'Project Manager', 'Developer', 'Viewer'] as const;
export type MemberRole = typeof MEMBER_ROLES[number];

export const ALLOCATION_STATUSES = ['Not Started', 'In Progress', 'Complete'] as const;
export type AllocationStatus = typeof ALLOCATION_STATUSES[number];

export const PROJECT_COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6', '#06B6D4', '#EC4899', '#F97316'];

export const getProductivityColor = (value: number) => {
  if (value >= 80) return '#10B981';
  if (value >= 60) return '#F59E0B';
  return '#F43F5E';
};

export const getGoalStatusColor = (status: GoalStatus) => {
  const map: Record<GoalStatus, string> = {
    'Complete': 'green', 'Incomplete': 'red', 'In Progress': 'blue', 'Not Started': 'default', 'TBD': 'default',
  };
  return map[status];
};

export const getSprintStatusColor = (status: SprintStatus) => {
  const map: Record<SprintStatus, string> = { 'Planning': 'default', 'Active': 'blue', 'Completed': 'green' };
  return map[status];
};
