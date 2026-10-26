export type LibraryItem={id:string;title:string;zone:string;summary:string;aliases:string[]};
export type LibraryPage={total:number;offset:number;items:LibraryItem[];nextOffset:number|null};
export async function loadWorkflowLibrary(fetchPage:(offset:number)=>Promise<LibraryPage>):Promise<LibraryItem[]>{
 const items:LibraryItem[]=[];const ids=new Set<string>();let offset=0;let total:number|undefined;
 for(;;){const page=await fetchPage(offset);if(!Number.isSafeInteger(page.total)||page.total<0||page.offset!==offset||(total!==undefined&&page.total!==total))throw new Error('Workflow library changed while loading; reload the library');total=page.total;
  for(const item of page.items){if(ids.has(item.id))throw new Error('Duplicate workflow returned by library');ids.add(item.id);items.push(item);}
  if(page.nextOffset===null){if(items.length!==total)throw new Error('Incomplete workflow library; reload to retrieve all sections');return items;}
  if(page.nextOffset!==offset+page.items.length||page.nextOffset<=offset||page.nextOffset>=total)throw new Error('Invalid workflow library page');offset=page.nextOffset;
 }
}
