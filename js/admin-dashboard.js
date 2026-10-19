import { createClient } from '@supabase/supabase-js';
const url=import.meta.env.VITE_SUPABASE_URL, key=import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase=url&&key?createClient(url,key):null;
const set=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=String(value);};
async function updateDashboard(){
 if(!supabase){['countSchedules','countAttendance','countTeachers','countStudents'].forEach(id=>set(id,'—'));return;}
 const {data:{user},error:authError}=await supabase.auth.getUser();
 if(authError||!user){['countSchedules','countAttendance','countTeachers','countStudents'].forEach(id=>set(id,'—'));return;}
 const {data:profile}=await supabase.from('profiles').select('jabatan').eq('id',user.id).maybeSingle();
 if(!profile||!['admin','administrator'].includes(String(profile.jabatan||'').toLowerCase())){['countSchedules','countAttendance','countTeachers','countStudents'].forEach(id=>set(id,'—'));return;}
 const jobs=[['students','countStudents'],['teachers','countTeachers'],['schedules','countSchedules'],['attendance','countAttendance']];
 await Promise.all(jobs.map(async([table,id])=>{const {count,error}=await supabase.from(table).select('*',{count:'exact',head:true});set(id,error?'—':(count??0));}));
}
updateDashboard();
