import type { SprintStatus, GoalStatus, ProjectStatus, MemberRole, AllocationStatus } from '@/constants';

export interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: SprintStatus;
  lengthDays: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  status: ProjectStatus;
}

export interface Resource {
  id: string;
  name: string;
  designation: string;
  team: string;
  active: boolean;
  avatar?: string;
}

export interface PointAllocation {
  id: string;
  sprintId: string;
  projectId: string;
  resourceId: string;
  planned: number;
  actual: number;
  status: AllocationStatus;
}

export interface SprintGoal {
  id: string;
  sprintId: string;
  projectId: string;
  goal: string;
  status: GoalStatus;
  ownerId: string;
  bugsIdentified: number;
  percentDone: number;
  deliverables: string;
  isHighlighted: boolean;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  joinedDate: string;
}

export interface SprintChangelog {
  id: string;
  sprintId: string;
  date: string;
  projectId: string;
  description: string;
  type: string;
  trackingId: string;
  pointsUpdate: number;
  finalSprintPoints: number;
}
