export type TicketPriority = 'low' | 'medium' | 'high';

export type TicketStatus = 'pending' | 'in_progress' | 'resolved' | 'cancelled';

export type TicketProfile = {
  full_name: string | null;
  email: string | null;
  role?: string;
};

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
  requester_profile?: TicketProfile | null;
  assigned_profile?: TicketProfile | null;
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

export type UpdateTicketDTO = {
  title?: string;
  description?: string;
  category?: string;
  priority?: TicketPriority;
};

export type TicketObservation = {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  created_at: string;
  profiles?: TicketProfile | null;
};
