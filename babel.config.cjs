const fs = require('fs');
const path = require('path');

module.exports = {
  plugins: [
    'dynamic-import-node',
    [
      'module-resolver',
      {
        extensions: ['.jsx', '.mjs', '.js'],
        resolvePath(sourcePath, currentFile) {
          // This logic remains exactly the same.
          if (sourcePath.startsWith('.') && path.extname(sourcePath) === '') {
            const possibleMjsPath = path.join(
              path.dirname(currentFile),
              `${sourcePath}.mjs`,
            );
            try {
              fs.accessSync(possibleMjsPath, fs.constants.F_OK);
              return `${sourcePath}.mjs`;
            } catch {
              return sourcePath;
            }
          }
          return sourcePath;
        },
      },
    ],
  ],
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
};
