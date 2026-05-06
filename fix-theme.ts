import fs from 'fs';
import path from 'path';

function replaceInFile(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf-8');

  // Background replacements
  content = content.replace(/bg-slate-900/g, 'bg-white');
  content = content.replace(/bg-slate-800/g, 'bg-slate-100');
  
  // Specific button styles (so we don't mess up their text)
  content = content.replace(/bg-blue-600 hover:bg-blue-500 text-white/g, 'bg-brand-primary hover:bg-brand-hover text-white');
  content = content.replace(/bg-blue-600/g, 'bg-brand-primary');
  content = content.replace(/text-blue-400/g, 'text-brand-primary');
  content = content.replace(/text-blue-500/g, 'text-brand-hover');

  // Text colors
  content = content.replace(/text-slate-100/g, 'text-brand-primary');
  content = content.replace(/text-white/g, 'text-brand-primary');
  content = content.replace(/text-slate-300/g, 'text-slate-600');
  content = content.replace(/text-slate-400/g, 'text-brand-gray');
  
  // Borders
  content = content.replace(/border-white\/5/g, 'border-brand-primary/10');
  content = content.replace(/border-white\/10/g, 'border-brand-primary/20');
  content = content.replace(/border-white\/20/g, 'border-brand-primary/30');
  content = content.replace(/border-slate-800/g, 'border-slate-200');

  // Translucents
  content = content.replace(/bg-white\/5/g, 'bg-brand-primary/5');
  content = content.replace(/bg-white\/10/g, 'bg-brand-primary/10');
  content = content.replace(/bg-slate-950\/80/g, 'bg-white/80');
  content = content.replace(/bg-slate-950\/90/g, 'bg-white/90');
  content = content.replace(/bg-slate-950\/60/g, 'bg-white/60');
  
  // Fix cases where we accidentally changed text-white on a dark button to text-brand-primary
  // E.g. bg-brand-primary hover:bg-brand-hover text-brand-primary -> text-white
  content = content.replace(/text-brand-primary([^"]*?) bg-brand-primary/g, 'text-white$1 bg-brand-primary');
  content = content.replace(/bg-brand-primary([^"]*?) text-brand-primary/g, 'bg-brand-primary$1 text-white');
  content = content.replace(/bg-brand-hover([^"]*?) text-brand-primary/g, 'bg-brand-hover$1 text-white');
  content = content.replace(/text-brand-primary rounded/g, 'text-brand-primary rounded');
  
  // Re-fix specific buttons that we broke
  content = content.replace(/glass-dark/g, 'bg-white/90 shadow-sm border-b border-brand-primary/10');
  content = content.replace(/glass/g, 'bg-white shadow-sm border border-brand-primary/10');
  
  fs.writeFileSync(filePath, content, 'utf-8');
}

function processDirectory(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      replaceInFile(fullPath);
    }
  }
}

processDirectory('./components');
replaceInFile('./App.tsx');
