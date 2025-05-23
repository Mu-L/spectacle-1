import { onePageTemplate } from '../templates/one-page';

const spectaclePackage = require(`${__dirname}/../../spectacle-package.json`);
const REACT_VERSION = spectaclePackage.devDependencies.react.replace('^', '');
const ESM_SH_VERSION = 'v121';
const DEVELOPMENT_BUILDS = false; // Enable this to use react.development.mjs etc...

export const generateImportMap = () => {
  const importMap = new Map<string, string>();

  importMap.set('spectacle', importUrl('spectacle', '10', '?bundle'));
  importMap.set('react', importUrl('react', REACT_VERSION));
  importMap.set(
    'react/jsx-runtime',
    importUrl('react', REACT_VERSION, '/jsx-runtime')
  );
  importMap.set(
    'react-dom/client',
    importUrl('react-dom', REACT_VERSION, '/client')
  );
  importMap.set('htm', importUrl('htm', '^3'));

  const dependencies = spectaclePackage.dependencies as Record<string, string>;
  for (const [pkg, version] of Object.entries(dependencies)) {
    if (importMap.has(pkg)) continue;
    importMap.set(pkg, importUrl(pkg, version));
    handlePackageExceptions(pkg, version, importMap);
  }

  return importMap;
};

export const createOnePage = (name: string, lang: string) => {
  const importMap = generateImportMap();
  return onePageTemplate({ importMap, name, lang });
};

const importUrl = (pkg: string, version: string, path = '') => {
  let params = `?deps=react@${REACT_VERSION},react-dom@${REACT_VERSION}`;
  if (DEVELOPMENT_BUILDS) params += '&dev';
  if (path.includes('?')) params = params.replace('?', '&');

  return `https://esm.sh/${ESM_SH_VERSION}/${pkg}@${version}${path}${params}`;
};

const handlePackageExceptions = (
  pkg: string,
  version: string,
  importMap: Map<string, string>
) => {
  if (pkg === 'react-syntax-highlighter') {
    importMap.set(
      `${pkg}/dist/cjs/styles/prism/vs-dark.js`,
      importUrl(pkg, version, '/dist/esm/styles/prism/vs-dark.js')
    );
    importMap.set(
      `${pkg}/dist/cjs/styles/prism/index.js`,
      importUrl(pkg, version, '/dist/esm/styles/prism/index.js')
    );
  }
};
