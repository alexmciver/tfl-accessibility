const fs = require('fs');
const path = require('path');

// Directories to process
const directories = [
  'src/scss/components',
  'src/scss/layouts',
  'src/scss/utils'
];

// Process each directory
directories.forEach(dir => {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir).filter(file => 
      file.endsWith('.scss') && file !== '_variables.scss' && file !== '_mixins.scss'
    );
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      console.log(`Processing ${filePath}...`);
      
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Skip files that already have @use statements
      if (content.includes('@use')) {
        console.log(`  - File already uses @use directive, skipping`);
        return;
      }
      
      // Add imports for variables and mixins
      const importStatements = '@use \'../base/variables\' as *;\n@use \'../utils/mixins\' as *;\n\n';
      content = importStatements + content;
      
      // Write back to file
      fs.writeFileSync(filePath, content);
      console.log(`  - Added @use directives`);
    });
  } else {
    console.log(`Directory ${dir} does not exist, skipping`);
  }
});

console.log('\nUpdate complete! All Sass files now use the modern @use directive.');
console.log('You should now be able to build without deprecated @import warnings.'); 