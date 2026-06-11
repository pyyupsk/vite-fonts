#!/usr/bin/env node

import { defineCommand, runMain } from 'citty'

import { cleanCommand } from './clean'
import { listCommand } from './list'

const main = defineCommand({
  meta: { name: 'vite-fonts', description: 'Manage vite-fonts cache' },
  subCommands: {
    list: listCommand,
    clean: cleanCommand,
  },
})

runMain(main)
