export interface SprintResourceComment {
  id?: string;
  sprint_id: string;
  resource_id: string;
  comment: string;
  created_at?: string;
  updated_at?: string;
}

const delay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

// Mock memory store
let mockComments: SprintResourceComment[] = [
  {
    id: "c1",
    sprint_id: "s1",
    resource_id: "r1",
    comment: "Testing 5, In progress 10"
  },
  {
    id: "c2",
    sprint_id: "s1",
    resource_id: "r2",
    comment: "Testing 17"
  }
];

// Fetch all comments for a sprint
export const getSprintResourceComments = async (sprintId: string): Promise<SprintResourceComment[]> => {
  await delay();
  return mockComments.filter(c => c.sprint_id === sprintId);
};

// Upsert comment (insert or update)
export const upsertSprintResourceComment = async (
  sprintId: string, 
  resourceId: string, 
  comment: string
): Promise<SprintResourceComment | null> => {
  await delay();
  
  const existingIndex = mockComments.findIndex(
    c => c.sprint_id === sprintId && c.resource_id === resourceId
  );
  
  const timestamp = new Date().toISOString();
  
  if (existingIndex >= 0) {
    mockComments[existingIndex] = {
      ...mockComments[existingIndex],
      comment,
      updated_at: timestamp
    };
    return { ...mockComments[existingIndex] };
  } else {
    const newComment: SprintResourceComment = {
      id: `c${Date.now()}`,
      sprint_id: sprintId,
      resource_id: resourceId,
      comment,
      created_at: timestamp,
      updated_at: timestamp
    };
    mockComments.push(newComment);
    return { ...newComment };
  }
};
