import fs from 'fs';
import toml from 'toml';

import { logger } from './logger';

if (!fs.existsSync('./config.toml')) {
  if (!fs.existsSync('./config.example.toml')) {
    logger.error('no config.toml OR config.example.toml found!!! what the hell are you up to!!!');
    process.exit(1);
  }
  logger.warn('copying config.example.toml to config.toml as it was not found. the default config may not be preferable!');
  fs.copyFileSync('./config.example.toml', './config.toml');
}

export const config = toml.parse(fs.readFileSync('./config.toml', {encoding: 'utf8'}));

logger.info('loaded config');