import { User } from '@renderer/pages/users/types/users';

export interface Note {
    content: string;
    created_at: string;
    created_by: ?User;
}
