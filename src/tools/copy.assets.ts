import * as shell from 'shelljs';

// Copy all the view templates
shell.mkdir('dist/example05');
shell.mkdir('dist/example05/views');
shell.cp('-R', 'src/example05/views', 'dist/example05/views');
