import type { Sprint, Project, Resource, PointAllocation, SprintGoal, Member, SprintChangelog } from '@/types';

export const mockSprints: Sprint[] = [
  { id: 's1', name: 'Sprint Feb 22 – Mar 25', startDate: '2026-02-22', endDate: '2026-03-25', status: 'Active', lengthDays: 31 },
  { id: 's2', name: 'Sprint Jan 15 – Feb 18', startDate: '2026-01-15', endDate: '2026-02-18', status: 'Completed', lengthDays: 34 },
  { id: 's3', name: 'Sprint Mar 26 – Apr 25', startDate: '2026-03-26', endDate: '2026-04-25', status: 'Planning', lengthDays: 30 },
  { id: 's4', name: 'Sprint May 1 – May 30', startDate: '2026-05-01', endDate: '2026-05-30', status: 'Planning', lengthDays: 30 },
];

export const mockProjects: Project[] = [
  { id: 'p1', name: 'Estate Link', description: 'Real estate management platform', color: '#4F46E5', status: 'Active' },
  { id: 'p2', name: 'Saudi ERP', description: 'Enterprise resource planning for Saudi market', color: '#10B981', status: 'Active' },
  { id: 'p3', name: 'S.Ali Project Accounting', description: 'Accounting module for S.Ali', color: '#F59E0B', status: 'Active' },
  { id: 'p4', name: 'Salon ERP', description: 'Salon management system', color: '#F43F5E', status: 'On Hold' },
  { id: 'p5', name: 'DubaiERP', description: 'Dubai-focused ERP solution', color: '#8B5CF6', status: 'Active' },
  { id: 'p6', name: 'AvailOrtho', description: 'Orthopedic availability platform', color: '#06B6D4', status: 'Active' },
];

export const mockResources: Resource[] = [
  { id: 'r1', name: 'Tausif', designation: 'Senior Developer', team: 'Engineering', active: true },
  { id: 'r2', name: 'Tarek', designation: 'Full Stack Developer', team: 'Engineering', active: true },
  { id: 'r3', name: 'Mirza', designation: 'Frontend Developer', team: 'Engineering', active: true },
  { id: 'r4', name: 'Shohan', designation: 'Backend Developer', team: 'Engineering', active: true },
  { id: 'r5', name: 'Farhan', designation: 'Junior Developer', team: 'Engineering', active: true },
  { id: 'r6', name: 'Asif', designation: 'QA Engineer', team: 'QA', active: true },
  { id: 'r7', name: 'Rusat', designation: 'DevOps Engineer', team: 'Infrastructure', active: false },
  { id: 'r8', name: 'Mahafujul', designation: 'UI Designer', team: 'Design', active: true },
];

export const mockAllocations: PointAllocation[] = [
  // Sprint 1 - Estate Link
  { id: 'a1', sprintId: 's1', projectId: 'p1', resourceId: 'r1', planned: 31, actual: 31, status: 'Complete' },
  { id: 'a2', sprintId: 's1', projectId: 'p1', resourceId: 'r2', planned: 42, actual: 31, status: 'In Progress' },
  { id: 'a3', sprintId: 's1', projectId: 'p1', resourceId: 'r3', planned: 40, actual: 33, status: 'In Progress' },
  { id: 'a4', sprintId: 's1', projectId: 'p1', resourceId: 'r4', planned: 4, actual: 4, status: 'Complete' },
  // Sprint 1 - Saudi ERP
  { id: 'a5', sprintId: 's1', projectId: 'p2', resourceId: 'r2', planned: 10, actual: 0, status: 'Not Started' },
  // Sprint 1 - S.Ali Project
  { id: 'a6', sprintId: 's1', projectId: 'p3', resourceId: 'r4', planned: 34, actual: 34, status: 'Complete' },
  // Sprint 1 - Others (using p5 as "Others")
  { id: 'a7', sprintId: 's1', projectId: 'p5', resourceId: 'r1', planned: 20, actual: 20, status: 'Complete' },
  { id: 'a8', sprintId: 's1', projectId: 'p5', resourceId: 'r4', planned: 10, actual: 10, status: 'Complete' },
  { id: 'a9', sprintId: 's1', projectId: 'p5', resourceId: 'r5', planned: 5, actual: 5, status: 'Complete' },
  // Sprint 1 - AvailOrtho
  { id: 'a10', sprintId: 's1', projectId: 'p6', resourceId: 'r5', planned: 15, actual: 12, status: 'In Progress' },
  { id: 'a11', sprintId: 's1', projectId: 'p6', resourceId: 'r6', planned: 8, actual: 8, status: 'Complete' },
  // Sprint 2 completions
  { id: 'a12', sprintId: 's2', projectId: 'p1', resourceId: 'r1', planned: 28, actual: 28, status: 'Complete' },
  { id: 'a13', sprintId: 's2', projectId: 'p1', resourceId: 'r2', planned: 30, actual: 30, status: 'Complete' },
  { id: 'a14', sprintId: 's2', projectId: 'p1', resourceId: 'r3', planned: 25, actual: 25, status: 'Complete' },
  { id: 'a15', sprintId: 's2', projectId: 'p4', resourceId: 'r4', planned: 20, actual: 18, status: 'Complete' },
  { id: 'a16', sprintId: 's2', projectId: 'p4', resourceId: 'r5', planned: 10, actual: 10, status: 'Complete' },
  { id: 'a17', sprintId: 's2', projectId: 'p2', resourceId: 'r2', planned: 15, actual: 15, status: 'Complete' },
  // Sprint 3 allocations
  { id: 'a18', sprintId: 's3', projectId: 'p1', resourceId: 'r1', planned: 30, actual: 0, status: 'Not Started' },
  { id: 'a19', sprintId: 's3', projectId: 'p1', resourceId: 'r2', planned: 20, actual: 0, status: 'Not Started' },
  { id: 'a20', sprintId: 's3', projectId: 'p3', resourceId: 'r4', planned: 40, actual: 0, status: 'Not Started' },
  { id: 'a21', sprintId: 's3', projectId: 'p6', resourceId: 'r5', planned: 25, actual: 0, status: 'Not Started' },
];

export const mockGoals: SprintGoal[] = [
  { id: 'g1', sprintId: 's1', projectId: 'p1', goal: 'Service Fee Module - Web', status: 'Complete', ownerId: 'r2', bugsIdentified: 2, percentDone: 100, deliverables: 'Service fee calculation, invoice generation, payment tracking', isHighlighted: false },
  { id: 'g2', sprintId: 's1', projectId: 'p1', goal: 'Service Fee Module - Mobile', status: 'Complete', ownerId: 'r3', bugsIdentified: 1, percentDone: 100, deliverables: 'Mobile responsive service fee screens', isHighlighted: false },
  { id: 'g3', sprintId: 's1', projectId: 'p1', goal: 'Accounting Feedback Implementation', status: 'Complete', ownerId: 'r1', bugsIdentified: 0, percentDone: 100, deliverables: 'All accounting feedback items resolved', isHighlighted: false },
  { id: 'g4', sprintId: 's1', projectId: 'p1', goal: 'DTG Live Project Deployment', status: 'Incomplete', ownerId: 'r1', bugsIdentified: 5, percentDone: 60, deliverables: 'Production deployment, monitoring setup, rollback plan', isHighlighted: true },
  { id: 'g5', sprintId: 's1', projectId: 'p2', goal: 'Initial Module Setup', status: 'Not Started', ownerId: 'r2', bugsIdentified: 0, percentDone: 0, deliverables: 'Project scaffold, auth module, basic CRUD', isHighlighted: false },
  { id: 'g6', sprintId: 's1', projectId: 'p3', goal: 'Full Accounting Module', status: 'Complete', ownerId: 'r4', bugsIdentified: 3, percentDone: 100, deliverables: 'Chart of accounts, journal entries, trial balance', isHighlighted: false },
  { id: 'g7', sprintId: 's1', projectId: 'p6', goal: 'Patient Booking Flow', status: 'In Progress', ownerId: 'r5', bugsIdentified: 1, percentDone: 75, deliverables: 'Booking calendar, patient form, confirmation emails', isHighlighted: false },
  { id: 'g8', sprintId: 's2', projectId: 'p1', goal: 'Property Listing Module', status: 'Complete', ownerId: 'r1', bugsIdentified: 1, percentDone: 100, deliverables: 'Property CRUD, image uploads, filtering', isHighlighted: false },
  { id: 'g9', sprintId: 's2', projectId: 'p4', goal: 'Appointment Scheduling', status: 'Complete', ownerId: 'r4', bugsIdentified: 2, percentDone: 100, deliverables: 'Calendar view, booking system, notifications', isHighlighted: false },
  { id: 'g10', sprintId: 's2', projectId: 'p2', goal: 'Database Design and Init', status: 'Complete', ownerId: 'r2', bugsIdentified: 0, percentDone: 100, deliverables: 'Schema design, migration scripts', isHighlighted: false },
  { id: 'g11', sprintId: 's3', projectId: 'p1', goal: 'Tenant Portal Dashboard', status: 'Not Started', ownerId: 'r1', bugsIdentified: 0, percentDone: 0, deliverables: 'Dashboard UI, overview statistics', isHighlighted: false },
  { id: 'g12', sprintId: 's3', projectId: 'p6', goal: 'HIPAA Compliance Audit fixes', status: 'Not Started', ownerId: 'r5', bugsIdentified: 0, percentDone: 0, deliverables: 'Data encryption at rest, audit logs', isHighlighted: false },
];

export const mockMembers: Member[] = [
  { id: 'm1', name: 'Admin User', email: 'admin@velotrack.io', role: 'Admin', joinedDate: '2025-01-15' },
  { id: 'm2', name: 'Tausif Ahmed', email: 'tausif@velotrack.io', role: 'Project Manager', joinedDate: '2025-02-01' },
  { id: 'm3', name: 'Tarek Hassan', email: 'tarek@velotrack.io', role: 'Developer', joinedDate: '2025-02-15' },
  { id: 'm4', name: 'Mirza Rahman', email: 'mirza@velotrack.io', role: 'Developer', joinedDate: '2025-03-01' },
  { id: 'm5', name: 'Shohan Ali', email: 'shohan@velotrack.io', role: 'Developer', joinedDate: '2025-03-10' },
];

export const mockChangelogs: SprintChangelog[] = [
  { id: 'cl1', sprintId: 's1', date: '2026-02-24', projectId: 'p1', description: '3 points added to Tarek', type: 'Task', trackingId: '1812', pointsUpdate: 3, finalSprintPoints: 93 },
  { id: 'cl2', sprintId: 's1', date: '2026-02-24', projectId: 'p4', description: '2 points deducted from shohan', type: 'CR', trackingId: '198', pointsUpdate: 2, finalSprintPoints: 5 },
];
