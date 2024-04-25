import { workspace } from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

type StrDict = { [key: string]: string }

export interface Config {
  "func": string,
  "desc": string,
  "args": StrDict,
  "line-desc": StrDict
  "task": { "name": string, "desc": string, "out": string, "script": string }
}

export function readConfig(): Promise<any> {
  return new Promise((resolve, reject) => {
    const workspaces = workspace.workspaceFolders
    if (!workspaces) return reject('No workspace folder is open.')

    const confPath = path.join(workspaces[0].uri.fsPath, '.vscode', 'config.json')
    console.log('confPath:', confPath.toString)

    fs.readFile(confPath, 'utf8', (err, data) => {
      if (err) return reject('Error reading file.')
      try { resolve(JSON.parse(data)) }
      catch (parseError) { reject('Error parsing JSON.') }
    })
  })
}
