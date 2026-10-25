import { type Db } from './db.js';
export type TaskState = 'open' | 'in_progress' | 'awaiting_approval' | 'completed';
export interface Task {
    id: string;
    title: string;
    state: TaskState;
    blockedReason?: string;
    cancellation?: string;
    history: Array<{
        at: string;
        event: string;
    }>;
}
export declare function createTask(db: Db, title: string, opts?: {
    now?: () => Date;
}): Task;
export declare function listTasks(db: Db): Task[];
export declare function setTaskState(db: Db, id: string, state: TaskState, opts?: {
    blockedReason?: string;
    cancellation?: string;
    now?: () => Date;
}): Task;
export type ApprovalState = 'pending' | 'approved' | 'rejected';
export interface Approval {
    id: string;
    objectType: string;
    objectId: string;
    objectVersion: number;
    state: ApprovalState;
}
export declare function requestApproval(db: Db, objectType: string, objectId: string, opts?: {
    now?: () => Date;
}): Approval;
export declare function decideApproval(db: Db, id: string, approve: boolean, opts?: {
    now?: () => Date;
}): Approval;
export declare function listApprovals(db: Db): Approval[];
//# sourceMappingURL=tasks.d.ts.map