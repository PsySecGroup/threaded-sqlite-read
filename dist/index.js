"use strict";var d=Object.defineProperty;var F=Object.getOwnPropertyDescriptor;var R=Object.getOwnPropertyNames;var S=Object.prototype.hasOwnProperty;var T=(e,t)=>{for(var r in t)d(e,r,{get:t[r],enumerable:!0})},k=(e,t,r,n)=>{if(t&&typeof t=="object"||typeof t=="function")for(let s of R(t))!S.call(e,s)&&s!==r&&d(e,s,{get:()=>t[s],enumerable:!(n=F(t,s))||n.enumerable});return e};var x=e=>k(d({},"__esModule",{value:!0}),e);var M={};T(M,{search:()=>E});module.exports=x(M);var y=require("worker_threads");var u=require("fs/promises"),P=require("path");async function b(e){let t=[],r=await(0,u.readdir)(e);for(let n of r){let s=(0,P.join)(e,n),g=await(0,u.stat)(s);if(g.isDirectory()){let i=await b(s);t=t.concat(i)}else g.isFile()&&s.endsWith(".sqlite")&&t.push(s)}return t}var L=`const { parentPort } = require('worker_threads')
const Database = require('better-sqlite3')

parentPort.on('message', (msg) => {
  const { attaches, dbPath, query } = msg
  console.log('Querying ' + dbPath)
  try {
    const db = new Database(dbPath)
    db.exec(attaches)
    const rows = db.prepare(query).all()
    parentPort.postMessage(rows)
  } catch (e) {
    console.error(e)
    throw e
  }
})`;async function E(e,t,r,n=()=>{}){let s=Date.now(),g=await b(r),i=[],o=[];for(let c=0;c<g.length;c++){let h=g[c],l=c%10;l===0?(o.length>0&&(i.push(o),o=[]),o.push({select:`SELECT * FROM ${e} WHERE ${t}`,db:h})):o.push({attach:`ATTACH DATABASE '${h}' AS db${l};
`,select:`SELECT * FROM db${l}.${e} WHERE ${t}`})}o.length>0&&i.push(o);let q=i.map(c=>{let h="",l=[],m="";c.forEach(a=>{a.attach&&(h+=a.attach),l.push(a.select),a.db&&(m=a.db)});let $=l.join(" UNION ALL "),f=0;return new Promise((a,D)=>{let p=new y.Worker(L,{eval:!0});p.postMessage({attaches:h,dbPath:m,query:$}),p.on("message",w=>{f+=1,n&&n(m,f,i.length,w),a(w)}),p.on("error",D)})}),A=await Promise.all(q);return console.log("Run time",(Date.now()-s)/1e3),A}0&&(module.exports={search});
