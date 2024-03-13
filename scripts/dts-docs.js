(()=>{"use strict";var e={971:(e,t,n)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.parseEnum=t.printEnum=void 0;const s=n(899),r=n(205);t.printEnum=e=>{const t=[];return t.push(`# ${e.name}`),t.push(""),t.push("```ts"),t.push(e.raw),t.push("```"),t.push(""),e.documentation&&(t.push((0,r.escapeHTML)(e.documentation)),t.push("")),t.join("\n")},t.parseEnum=(e,t,n,i)=>{const o=t.getSymbolAtLocation(e.name);return{...(0,r.serializeSymbol)(t,o),raw:n.printNode(s.EmitHint.Unspecified,e,i)}}},107:(e,t,n)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.parseInterface=t.printInterface=void 0;const s=n(899),r=n(205);t.printInterface=e=>{const t=[];return t.push(`# ${e.name}`),t.push(""),e.documentation&&(t.push((0,r.escapeHTML)(e.documentation)),t.push("")),e.properties.length>0&&(t.push("## Properties"),t.push(""),e.properties.forEach((e=>{t.push("### "+e.name),t.push(""),t.push("```ts"),t.push(e.name+": "+e.type),t.push("```"),t.push(""),e.documentation&&(t.push((0,r.escapeHTML)(e.documentation)),t.push(""))}))),e.methods.length>0&&(t.push("## Methods"),t.push(""),e.methods.forEach((e=>{t.push("### "+e.name),t.push(""),t.push("```ts"),t.push(e.name+": "+e.type),t.push("```"),t.push(""),e.documentation&&(t.push((0,r.escapeHTML)(e.documentation)),t.push(""))}))),t.join("\n")},t.parseInterface=(e,t,n,i)=>{const o=t.getSymbolAtLocation(e.name),p=[];s.forEachChild(e,(e=>{if(s.isPropertySignature(e)){const n=t.getSymbolAtLocation(e.name);p.push({raw:e.getText(),...(0,r.serializeSymbol)(t,n)})}}));const a=[];return s.forEachChild(e,(e=>{s.isMethodSignature(e)&&a.push({raw:n.printNode(s.EmitHint.Unspecified,e,i),...(0,r.serializeSymbol)(t,t.getSymbolAtLocation(e.name))})})),{...(0,r.serializeSymbol)(t,o),properties:p,methods:a}}},314:(e,t,n)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.parseType=t.printType=void 0;const s=n(899),r=n(205);t.printType=e=>{const t=[];return t.push(`# ${e.name}`),t.push(""),e.raw&&(t.push("```ts"),t.push(e.raw),t.push("```"),t.push("")),t.push((0,r.escapeHTML)(e.documentation)),t.push(""),t.join("\n")},t.parseType=(e,t,n,i)=>{const o=t.getSymbolAtLocation(e.name);if(!o)throw new Error("unexpected error");return{...(0,r.serializeSymbol)(t,o),raw:n.printNode(s.EmitHint.Unspecified,e,i)}}},205:(e,t,n)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.escapeHTML=t.serializeSignature=t.serializeSymbol=void 0;const s=n(899);t.serializeSymbol=(e,t)=>({name:t.getName(),documentation:s.displayPartsToString(t.getDocumentationComment(e)),type:e.typeToString(e.getTypeOfSymbolAtLocation(t,t.valueDeclaration))}),t.serializeSignature=function(e,n){return{parameters:n.parameters.map((n=>(0,t.serializeSymbol)(e,n))),returnType:e.typeToString(n.getReturnType()),documentation:s.displayPartsToString(n.getDocumentationComment(e))}},t.escapeHTML=e=>e.replace("|","&vert;").replace("<","&lt;").replace("<","&lt;").replace("<","&lt;").replace(">","&gt;").replace(">","&gt;").replace(">","&gt;")},899:e=>{e.exports=require("typescript")},896:e=>{e.exports=require("fs")},928:e=>{e.exports=require("path")}},t={};function n(s){var r=t[s];if(void 0!==r)return r.exports;var i=t[s]={exports:{}};return e[s](i,i.exports,n),i.exports}var s={};for(var r in(()=>{var e=s;Object.defineProperty(e,"__esModule",{value:!0});const t=n(928),r=n(899),i=n(896),o=n(971),p=n(107),a=n(314);function u(e){(0,i.existsSync)(e)||(0,i.mkdirSync)(e)}!function(e){const{types:n,enums:s,functions:c,interfaces:m,classes:h}=function(e){const t=r.createProgram([e],{}),n=t.getTypeChecker(),s=r.createPrinter({newLine:r.NewLineKind.LineFeed,removeComments:!0}),i=t.getSourceFile(e),u=[],c=[],m=[],h=[],l=[];if(!i)return{functions:u,interfaces:c,classes:m,enums:h,types:l};const d=e=>{r.forEachChild(e,(e=>{r.isInterfaceDeclaration(e)?c.push((0,p.parseInterface)(e,n,s,i)):r.isEnumDeclaration(e)?h.push((0,o.parseEnum)(e,n,s,i)):r.isTypeAliasDeclaration(e)?l.push((0,a.parseType)(e,n,s,i)):r.isModuleDeclaration(e)&&e.body&&d(e.body)}))};return d(i),{functions:u,interfaces:c,classes:m,enums:h,types:l}}(e[0]),l=e[1];l&&u(t.join(l));const d=[];d.push("# API reference"),d.push(""),d.push("## Enums"),d.push(""),s.length&&u(t.join(l,"enums")),s.forEach((e=>{(0,i.writeFileSync)(t.join(l,"enums",e.name+".md"),(0,o.printEnum)(e)),d.push(`- [${e.name}](enums/${e.name}.md)`)})),d.push(""),d.push("## Interfaces"),d.push(""),m.length&&u(t.join(l,"interfaces")),m.forEach((e=>{(0,i.writeFileSync)(t.join(l,"interfaces",e.name+".md"),(0,p.printInterface)(e)),d.push(`- [${e.name}](interfaces/${e.name}.md)`)})),d.push(""),d.push("## Types"),d.push(""),n.length&&u(t.join(l,"types")),n.forEach((e=>{(0,i.writeFileSync)(t.join(l,"types",e.name+".md"),(0,a.printType)(e)),d.push(`- [${e.name}](types/${e.name}.md)`)})),d.push(""),(0,i.writeFileSync)(t.join(l,"index.md"),d.join("\n"))}(process.argv.slice(2))})(),s)this[r]=s[r];s.__esModule&&Object.defineProperty(this,"__esModule",{value:!0})})();