import * as code from 'vscode'
import * as fs from 'fs'
import * as tmp from 'tmp'
import * as input from './input'
import { help, config } from './extension'

type Deco = code.TextEditorDecorationType
type DecoOpts = code.DecorationOptions
export var dismissed: string[] = [], helpPos: DecoOpts[] = [],
dimmer: Deco, hl: Deco, actions: code.Disposable

export async function checkFns(editor: code.TextEditor): Promise<void> {
  let _config: input.Config // if called before config read:
  if (!config) _config = await input.readConfig()
  else _config = config

  const text = editor.document.getText(),
  RE = /def\s+\w+\s*\(.*\):/g
  helpPos = []
  let sig

  // Find all function signatures in the active editor:
  while ((sig = RE.exec(text))) {
    if (!dismissed.includes(sig[0]) && sig[0].includes(_config.func)) {
      const line = editor.document.positionAt(sig.index).line
      const decoration: code.DecorationOptions = {
        range: editor.document.lineAt(line).range,
      }
      helpPos.push(decoration)
    }
  }
  // use help.svg for each decroration in helpPos
  editor.setDecorations(help, helpPos)
}

// finds all import statements in the editor
export function getImports(editor: code.TextEditor): [string, number] {
  const doc = editor.document, imports: string[] = []
  let count = 0
  for (let i = 0; i < doc.lineCount; i++) {
      const line = doc.lineAt(i).text.trim()
      if (line.startsWith('import') || line.startsWith('from')) {
        imports.push(line); count++
      }
  }
  return [imports.join('\n') + '\n\n', count+1]
}

// Python code entry (var assign + func call)
function genMain(): string {
  let entry = '\n'
  for (const key in config.args) {
    const value = config.args[key]
    entry += `${key} = ${value}\n`
  }

  const params = Object.keys(config.args).join(', ')
  return entry += `${config.func}(${params})\n`
}

// loads a Python script from the config and loads it in editor
export async function sandbox(editor: code.TextEditor, start: number): Promise<number> {
  // Create a temporary file that is deleted when the process exits
  const tmpFile = tmp.fileSync({ prefix: `${config.func}`, postfix: `${config.task.name}.py`, keep: false }),
  fn = editor.document.getText(getFnRange(editor, start)),
  [ imports, tmpStart ] = getImports(editor)
  fs.writeFileSync(tmpFile.name, imports + fn + genMain())
  tmp.setGracefulCleanup()
  process.on('uncaughtException', () => { process.exit(1) })
  process.on('exit', () => {
    try { fs.unlinkSync(tmpFile.name) }
    catch (e: any) { console.error(e.message)}
  })

  try {
    const doc = await code.workspace.openTextDocument(tmpFile.name)
    await code.window.showTextDocument(doc)
  } catch (e: any) {
    code.window.showErrorMessage('Failed to open Python script: ' + e.message)
  }
  return tmpStart
}

// code.Range: start - end line of function
export function getFnRange(editor: code.TextEditor, start: number): code.Range {
    const indents = editor.document.lineAt(start).firstNonWhitespaceCharacterIndex
    let i = start, len = editor.document.lineCount
    while (i++ < len - 1) {
        const line = editor.document.lineAt(i)
        if (line.firstNonWhitespaceCharacterIndex <= indents && line.text.trim() !== '') break
    }
    return new code.Range(start, 0, i, 0)
}

// dims line for lines that are not in func def
export function dim(editor: code.TextEditor, start: number): void {
    const func = getFnRange(editor, start),
    len = editor.document.lineCount

    dimmer = code.window.createTextEditorDecorationType({ opacity: '0.1' })
    const dimRanges: code.Range[] = []
    
    if (func.start.line > 0) dimRanges.push(new code.Range(0, 0, func.start.line, 0))
    if (func.end.line < len) dimRanges.push(new code.Range(func.end.line, 0, len, 0))
    
    editor.setDecorations(dimmer, dimRanges)
}

export function exitDebugger(editor: code.TextEditor, start: number): void {
    // Stop debugger, go to line, toggle breakpoint to unset it:
    code.commands.executeCommand('workbench.action.debug.stop')
    let range = editor.document.lineAt(start + 1).range;
    editor.selection =  new code.Selection(range.start, range.start);
    editor.revealRange(range);
    //code.commands.executeCommand('editor.debug.action.toggleBreakpoint')
}

export function startDebugger(editor: code.TextEditor, start: number) {
  let range = editor.document.lineAt(start + 1).range;
  editor.selection =  new code.Selection(range.start, range.start);
  editor.revealRange(range);
  code.commands.executeCommand('editor.debug.action.toggleBreakpoint')
  code.commands.executeCommand('workbench.action.debug.start');
}

// highlights the line and adds codeLens
export function focus(editor: code.TextEditor, start: number, config: input.Config): void {
  let color, i, desc, remLen = Object.keys(config['line-desc']).length
  // keep passing the config object (reference), "popleft"-ing tasks:
  if (remLen == 0) { // Tutorial complete, begin task
    exitDebugger(editor, start)
    i = 0; desc = config['task']['desc']; color = "#FFA30440"
  } else {
    i = Number(Object.keys(config['line-desc'])[0])
    desc = config['line-desc'][String(i)]; delete config['line-desc'][String(i)]
    color = "#D7E7B399"
  }
  console.log(Object.keys(config['task']).length)
  // expects Range (we just care about the line):
  const lineRange = new code.Range(start+i, 0, start+i, 0)
  const hlOpts: code.DecorationOptions = {
    range: lineRange,
    renderOptions: {
      after: {
        contentText: desc,
        color: new code.ThemeColor('foreground'),
        margin: '0 0 0 40px',
        fontStyle: 'italic',
      },
    },
  }
  hl = code.window.createTextEditorDecorationType({
    backgroundColor: color,
    isWholeLine: true,
  })
  editor.setDecorations(hl, [hlOpts])

  actions = code.languages.registerCodeLensProvider('python', {
    provideCodeLenses: () => [
      (remLen) ?
      new code.CodeLens(lineRange, {
        title: '↴ Continue',
        command: 'compass.continue',
        arguments: [start, config], // will call focus() again
      }) :
      new code.CodeLens(lineRange, {
        title: '🗸 Validate',
        command: 'compass.validate',
        arguments: [config['task']['out']] // TODO
      }),
      new code.CodeLens(lineRange, {
        title: '⨯ Exit',
        command: 'compass.exit',
        arguments: [start, config], // will call focus() again
      })
    ],
  })
}
