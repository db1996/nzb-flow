import { User } from '@renderer/pages/users/types/users';
import { Note } from '@renderer/types/notes';

export interface Status {
    id: number;
    name: string;
    reason: string;
    created_at: string;
    created_by: ?User;

    note: Note;
    notes: Note[];
}
