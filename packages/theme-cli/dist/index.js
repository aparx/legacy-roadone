#! /usr/bin/env ts-node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const extra_typings_1 = require("@commander-js/extra-typings");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const process = __importStar(require("process"));
const theme_generator_1 = require("theme-generator");
extra_typings_1.program
    .command('generate')
    .option('--input <file>', 'Generator input path', 'theme.input.js')
    .option('--output <file>', 'Output file path', 'theme.output.json')
    .action(({ input, output }) => {
    importInput(input)
        .then((data) => new theme_generator_1.ThemeGenerator(data).generate())
        .then((theme) => JSON.stringify(theme.current()))
        .then((data) => fs.writeFileSync(cwdPath(output, 'json'), data))
        .catch(console.error);
});
extra_typings_1.program.parse();
async function importInput(input) {
    const filePath = cwdPath(input, 'js');
    if (!fs.existsSync(filePath))
        throw new Error(`Missing file ${filePath}`);
    return (await import(`file://${filePath}`)).default;
}
function cwdPath(url, ext) {
    return path.format({ ...path.parse(path.join(process.cwd(), url)), ext });
}
