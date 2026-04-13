import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf-8');
const envVars = Object.fromEntries(
  envContent.split('\n').filter(line => line && !line.startsWith('#')).map(line => {
    const [key, ...value] = line.split('=');
    return [key.trim(), value.join('=').trim()];
  })
);

const supabaseUrl = envVars['VITE_SUPABASE_URL'];
const supabaseAnonKey = envVars['VITE_SUPABASE_ANON_KEY'];

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkModel() {
  const { data: levels } = await supabase.from('levels').select('*');
  const { data: sublevels } = await supabase.from('sublevels').select('*');
  const { data: languages } = await supabase.from('languages').select('*');

  console.log("Levels:");
  levels.forEach(l => console.log(`- ${l.name} / ${l.display_name} (ID: ${l.id}, LangID: ${l.language_id})`));

  console.log("\nSublevels matching 'final':");
  sublevels.filter(s => s.name.toLowerCase().includes('final') || s.display_name.toLowerCase().includes('final')).forEach(s => {
    const level = levels.find(l => l.id === s.level_id);
    const lang = languages.find(l => l.id === level?.language_id);
    console.log(`- Sublevel: ${s.name} / ${s.display_name} (Level: ${level?.name}, Lang: ${lang?.name})`);
    if (lang) {
      console.log(`  Language Settings - TTS: ${lang.tts_provider}, Model: ${lang.voice_settings?.model}, Voice: ${lang.voice_name}`);
    }
  });
}

checkModel();
