#! /usr/bin/env ts-node
import { program } from '@commander-js/extra-typings';
import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';
import { ThemeGenerator, ThemeGeneratorInput } from 'theme-generator';

program
  .command('generate')
  .option('--input <file>', 'Generator input path', 'theme.input.js')
  .option('--output <file>', 'Output file path', 'theme.output.json')
  .action(({ input, output }) => {
    importInput(input)
      .then((data) => new ThemeGenerator(data).generate())
      .then((theme) => JSON.stringify(theme.current()))
      .then((data) => fs.writeFileSync(cwdPath(output, 'json'), data))
      .catch(console.error);
  });

program.parse();

async function importInput(input: string): Promise<ThemeGeneratorInput> {
  const filePath = cwdPath(input, 'js');
  if (!fs.existsSync(filePath)) throw new Error(`Missing file ${filePath}`);
  return (await import(`file://${filePath}`)).default;
}

function cwdPath(url: string, ext: string) {
  return path.format({ ...path.parse(path.join(process.cwd(), url)), ext });
}
