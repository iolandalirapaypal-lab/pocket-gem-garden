import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, it, expect } from 'vitest';

const scope:any={};runInNewContext(readFileSync('public/chase.js','utf8'),scope);
const C=scope.LawlChase;
const open=()=>true;
describe('combat chase modes',()=>{
 it('has exactly three modes: stand, chase and keep distance',()=>{expect([...C.ORDER]).toEqual(['stand','chase','keep'])});
 it('unknown or missing mode falls back to stand',()=>{expect(C.normalize(undefined)).toBe('stand');expect(C.normalize('hack')).toBe('stand')});
 it('stand never moves the character',()=>{expect(C.goal('stand',{x:0,y:0},{x:6,y:0},1,open)).toBeNull()});
 it('chase walks to a tile next to the target',()=>{const g=C.goal('chase',{x:0,y:0},{x:6,y:0},1,open);expect(Math.max(Math.abs(g[0]-6),Math.abs(g[1]-0))).toBe(1);expect(g).toEqual([5,0])});
 it('chase stops once already next to the target',()=>{expect(C.goal('chase',{x:5,y:1},{x:6,y:0},1,open)).toBeNull()});
 it('chase skips blocked tiles around the target',()=>{const g=C.goal('chase',{x:0,y:0},{x:6,y:0},1,(x:number,y:number)=>!(x===5&&y===0));expect(g).not.toEqual([5,0]);expect(Math.max(Math.abs(g[0]-6),Math.abs(g[1]))).toBe(1)});
 it('keep distance holds 3 SQM when the attack reaches that far',()=>{expect(C.keepDist(7)).toBe(3);expect(C.goal('keep',{x:3,y:0},{x:6,y:0},7,open)).toBeNull();expect(C.goal('keep',{x:0,y:0},{x:6,y:0},7,open)).toBeNull()});
 it('keep distance approaches when the target is out of attack range',()=>{const g=C.goal('keep',{x:0,y:0},{x:10,y:0},4,open);expect(g).toEqual([7,0])});
 it('keep distance steps away when the target is too close',()=>{const g=C.goal('keep',{x:5,y:0},{x:6,y:0},7,open);expect(Math.max(Math.abs(g[0]-6),Math.abs(g[1]))).toBe(2)});
 it('keep distance with melee range behaves like chase',()=>{expect(C.goal('keep',{x:0,y:0},{x:6,y:0},1,open)).toEqual([5,0])});
});
