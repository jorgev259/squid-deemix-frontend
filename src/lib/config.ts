import fs from 'fs'
import toml from 'toml'
import path from 'path'

import type { DeemixSettings } from '@/types/deemix'

if (!fs.existsSync(path.join(process.cwd(), './config.toml'))) {
  if (!fs.existsSync(path.join(process.cwd(), './config.example.toml'))) {
    throw new Error(
      'no config.toml OR config.example.toml found!!! what the hell are you up to!!!'
    )
  }
  console.warn(
    'copying config.example.toml to config.toml as it was not found. the default config may not be preferable!'
  )
  fs.copyFileSync('./config.example.toml', './config.toml')
}

export const config: DeemixSettings = toml.parse(
  fs.readFileSync(path.join(process.cwd(), './config.toml'), {
    encoding: 'utf8'
  })
)

console.info('loaded config')
