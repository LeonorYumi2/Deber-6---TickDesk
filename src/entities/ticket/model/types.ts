export type TicketPriority = 'low' | 'medium' | 'high';

export type TicketStatus = 'pending' | 'in_progress' | 'resolved' | string;

export type Ticket = {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  user_id: string;
  assigned_to: string | null;
  created_at: string;
  updated_at?: string;
};

export type CreateTicketDTO = {
  title: string;
  description: string;
  category: string;
  priority: TicketPriority;
  status: 'pending';
  user_id: string;
  assigned_to: null;
};
