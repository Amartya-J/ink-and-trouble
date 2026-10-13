import {mkdir,copyFile,cp,rm} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});await mkdir('dist',{recursive:true});
for(const file of ['index.html','style.css','favicon.svg','relay.html','relay.css','relay.js','menu-components.css'])await copyFile(file,'dist/'+file);
await cp('art','dist/art',{recursive:true});
await cp('src','dist/src',{recursive:true});
console.log('Built dependency-free static game in dist/');
