import {writeFileSync}from'node:fs';
import{HELP_AREAS,REFERENCE_CATALOG,KITCHEN_ROLES,KITCHEN_ESTABLISHMENTS,HELP_ACTIONS,workflowCoverage}from'../dist/workflows/help.js';
import{WORKFLOW_CATALOG}from'../dist/workflows/catalog.js';
const catalog={scope:'Original research-derived task coverage, not a frequency survey or executed model benchmark',roles:KITCHEN_ROLES,establishments:KITCHEN_ESTABLISHMENTS,actions:HELP_ACTIONS,references:REFERENCE_CATALOG,areas:HELP_AREAS.map(a=>({...a,status:'partial'})),workflows:WORKFLOW_CATALOG.map(w=>({id:w.id,title:w.title,...workflowCoverage(w.id)})),questions:HELP_AREAS.flatMap(a=>a.questions.map((question,i)=>({id:a.id+'/'+(i+1),area:a.id,question,workflowIds:a.workflowIds,sourceIds:a.references,basis:'Original question informed by reference topics; no statistical popularity claim',executionStatus:'NOT_RUN'})))};
writeFileSync('docs/KITCHEN_COVERAGE.json',JSON.stringify(catalog,null,2)+'\n');
console.log(JSON.stringify({coverageAreas:catalog.areas.length,workflows:catalog.workflows.length,representativeQuestions:catalog.questions.length,references:catalog.references.length,modelTrials:'NOT_RUN'}));
