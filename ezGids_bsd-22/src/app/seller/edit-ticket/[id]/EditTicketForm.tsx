interface EditTicketFormProps {
  sellerId: string;
  initialData: Omit<TicketModel, '_id' | 'sellerId'> & {
    _id: string;
    sellerId?: string;
  };
} 