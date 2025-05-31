const fs = require('fs');
const path = require('path');

module.exports = {
  plugins: [
    [
      'module-resolver',
      {
        extensions: ['.jsx', '.mjs', '.js'],
        resolvePath(sourcePath, currentFile) {
          // Only handle relative paths with no extension
          if (sourcePath.startsWith('.') && path.extname(sourcePath) === '') {
            // Construct the potential .mjs file path relative to the current file.
            const possibleMjsPath = path.join(
              path.dirname(currentFile),
              `${sourcePath}.mjs`,
            );
            try {
              // If the .mjs file exists, append the extension.
              fs.accessSync(possibleMjsPath, fs.constants.F_OK);
              return `${sourcePath}.mjs`;
            } catch (err) {
              // If the .mjs file doesn't exist, return the original path.
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
