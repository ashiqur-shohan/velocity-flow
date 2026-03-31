// Mock Sprint Service without Supabase

const delay = (ms = 400) => new Promise(r => setTimeout(r, ms));

// Mock database for close logs
const mockCloseLogs: any[] = [];

export const closeSprint = async (sprintId: string, closingNote: string = '') => {
  await delay();
  const log = {
    id: `log${Date.now()}`,
    sprint_id: sprintId,
    closed_at: new Date().toISOString(),
    closing_note: closingNote
  };
  mockCloseLogs.push(log);
  return log;
};

export const getSprintCloseLog = async (sprintId: string) => {
  await delay();
  return mockCloseLogs.find(log => log.sprint_id === sprintId) || null;
};
