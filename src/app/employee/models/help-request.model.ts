export interface HelpRequest {
    id: string;
    requesterId: string;
    heading: string;
    recipientIds: string[];
    requestName: string;
    description: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
    cost: number;
    createdAt: string;
    acceptedAt: string | null;
    completedAt: string | null;
    rating: number | null;
    imageIds: string[] | null;
  }
  