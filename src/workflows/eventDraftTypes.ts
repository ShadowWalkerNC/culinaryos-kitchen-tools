// Transport-only types: safe for UI import without database or server dependencies.
export interface EventDraft{
 currency:string;revenue:string;totalGuests:string;
 costs:Array<{label:string;amount:string}>;
 resources:Array<{id:string;capacity:string;unit:string}>;
 tasks:Array<{id:string;resourceId:string;start:string;end:string;units:string;unit:string}>;
 guests:Array<{id:string;requirements:string;allergenStatus:'unknown'|'contains'|'may_contain'|'verified_absent';source:string;sourceVersion:string;reviewer:string}>;
 capacityConfirmed:boolean;
}
