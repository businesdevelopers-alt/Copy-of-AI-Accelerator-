import fs from 'fs';
import path from 'path';

function replaceInFile(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf-8');

  // Change back all text-white to text-slate-900 (as the base dark text color)
  // EXCEPT when it's part of a button or something that clearly needs to be white.
  
  // We'll use a regex to look at the classes.
  // Actually, we can just replace all text-white with text-brand-primary FIRST
  content = content.replace(/text-white/g, 'text-brand-primary');
  
  // THEN, if an element has bg-brand-primary or bg-blue-* or bg-indigo-*, it should have text-white
  // So we swap it back specifically for those
  content = content.replace(/bg-brand-primary([^"]*?)text-brand-primary/g, 'bg-brand-primary$1text-white');
  content = content.replace(/text-brand-primary([^"]*?)bg-brand-primary/g, 'text-white$1bg-brand-primary');
  content = content.replace(/bg-brand-hover([^"]*?)text-brand-primary/g, 'bg-brand-hover$1text-white');
  content = content.replace(/bg-indigo-600([^"]*?)text-brand-primary/g, 'bg-indigo-600$1text-white');
  content = content.replace(/bg-blue-500([^"]*?)text-brand-primary/g, 'bg-blue-500$1text-white');
  content = content.replace(/bg-blue-600([^"]*?)text-brand-primary/g, 'bg-blue-600$1text-white');
  content = content.replace(/bg-green-600([^"]*?)text-brand-primary/g, 'bg-green-600$1text-white');
  content = content.replace(/bg-red-500([^"]*?)text-brand-primary/g, 'bg-red-500$1text-white');
  
  content = content.replace(/fill-white/g, 'fill-brand-primary');

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

// We also need to fix bg-slate-900 to bg-white
// text-slate-100 to text-brand-primary

processDirectory('./components');
replaceInFile('./App.tsx');
