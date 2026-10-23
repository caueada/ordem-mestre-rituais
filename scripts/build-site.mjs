import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function assertInside(root, candidate, label) {
  const relative = path.relative(root, candidate);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`${label} escapes the supplied source root: ${candidate}`);
  }
}

function sourceAsset(sourceRoot, relativePath, label) {
  if (!relativePath || typeof relativePath !== 'string') {
    throw new Error(`${label} is missing`);
  }
  const normalized = relativePath.replaceAll('/', path.sep);
  const absolutePath = path.resolve(sourceRoot, 'assets', normalized);
  assertInside(path.resolve(sourceRoot, 'assets'), absolutePath, label);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`${label} does not exist: assets/${relativePath}`);
  }
  return absolutePath;
}

function copyAsset(sourceRoot, outputRoot, sourceRelative, destinationRelative, copiedAssets) {
  const sourcePath = sourceAsset(sourceRoot, sourceRelative, `Asset ${sourceRelative}`);
  const destinationPath = path.join(outputRoot, destinationRelative);
  fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
  fs.copyFileSync(sourcePath, destinationPath);
  copiedAssets.push(destinationRelative.replaceAll(path.sep, '/'));
}

function projectRitual(sourceRoot, ritual, copiedAssets, outputRoot) {
  if (!ritual?.id || !ritual.nome || !ritual.circulo) {
    throw new Error(`Ritual without id, nome or circulo: ${ritual?.id || '<unknown>'}`);
  }

  const images = (ritual.imagens || []).map((relativePath) => {
    const filename = path.basename(relativePath);
    const destination = `assets/ritual-images/${filename}`;
    copyAsset(sourceRoot, outputRoot, relativePath, destination, copiedAssets);
    return destination;
  });
  const symbols = (ritual.simbolos_ritual || []).map((symbol) => {
    const relativePath = symbol.processed;
    const filename = path.basename(relativePath || '');
    const destination = `assets/ritual-symbols/${filename}`;
    copyAsset(sourceRoot, outputRoot, relativePath, destination, copiedAssets);
    return { ...symbol, processed: destination, original: null };
  });

  return {
    id: ritual.id,
    tipo: ritual.tipo,
    nome: ritual.nome,
    elementos: ritual.elementos,
    circulo: ritual.circulo,
    execucao: ritual.execucao,
    alcance: ritual.alcance,
    alvo: ritual.alvo,
    area: ritual.area,
    duracao: ritual.duracao,
    resistencia: ritual.resistencia,
    efeito_base: ritual.efeito_base,
    aprimoramentos: ritual.aprimoramentos,
    texto_integral: ritual.texto_integral,
    imagens: images,
    fonte: ritual.fonte,
    referencia_wiki: ritual.referencia_wiki,
    fonte_regras: ritual.fonte_regras,
    simbolos_ritual: symbols,
    arte_creditos: ritual.arte_creditos,
  };
}

function projectRule(rule) {
  return {
    id: rule.id,
    titulo: rule.titulo,
    categoria: rule.categoria,
    resumo: rule.resumo,
    explicacao: rule.explicacao,
    palavras_chave: rule.palavras_chave,
    orientacao: rule.orientacao,
    exemplo_original: rule.exemplo_original,
    atencao: rule.atencao,
    pagina_livro: rule.pagina_livro,
    pagina_pdf: rule.pagina_pdf,
    fonte: rule.fonte,
    ligacao_app: rule.ligacao_app,
    nivel_detalhe: rule.nivel_detalhe,
    capitulo_id: rule.capitulo_id,
  };
}

export function buildSite({ sourceRoot, outputRoot }) {
  const resolvedSource = path.resolve(sourceRoot);
  const resolvedOutput = path.resolve(outputRoot);
  const base = readJson(path.join(resolvedSource, 'assets', 'base-completa.json'));
  const rulesBook = readJson(path.join(resolvedSource, 'webui', 'modulos', 'regras', 'dados', 'regras.json'));
  const rituals = base.rituais || [];
  if (rituals.length !== 81) {
    throw new Error(`Expected 81 rituals, got ${rituals.length}`);
  }

  fs.rmSync(resolvedOutput, { recursive: true, force: true });
  fs.mkdirSync(resolvedOutput, { recursive: true });
  const sourceUi = path.join(projectRoot, 'src');
  if (fs.existsSync(sourceUi)) fs.cpSync(sourceUi, resolvedOutput, { recursive: true });

  const copiedAssets = [];
  const logo = 'branding/ordem-logo.png';
  copyAsset(resolvedSource, resolvedOutput, logo, 'assets/ordem-logo.png', copiedAssets);
  const publicRituals = rituals.map((ritual) => projectRitual(resolvedSource, ritual, copiedAssets, resolvedOutput));
  const publicRules = (rulesBook.artigos || [])
    .filter((rule) => rule.categoria === 'rituais')
    .map(projectRule);
  if (!publicRules.length) throw new Error('No conjuration rules found');

  fs.mkdirSync(path.join(resolvedOutput, 'data'), { recursive: true });
  fs.writeFileSync(path.join(resolvedOutput, 'data', 'rituais.json'), `${JSON.stringify(publicRituals, null, 2)}\n`);
  fs.writeFileSync(path.join(resolvedOutput, 'data', 'regras.json'), `${JSON.stringify(publicRules, null, 2)}\n`);
  return { ritualCount: publicRituals.length, ruleCount: publicRules.length, copiedAssets };
}

function parseArgs(argv) {
  const args = new Map();
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index].startsWith('--')) args.set(argv[index].slice(2), argv[index + 1]);
  }
  return args;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2));
  const sourceRoot = args.get('source') || process.env.ORDEM_MESTRE_SOURCE;
  const outputRoot = args.get('out') || path.join(projectRoot, 'dist');
  if (!sourceRoot) throw new Error('Usage: node scripts/build-site.mjs --source <checkout> --out <output>');
  const result = buildSite({ sourceRoot, outputRoot });
  console.log(JSON.stringify(result));
}
