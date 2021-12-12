// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { format } from 'sql-formatter';

const NOTEBOOK_CELL_SCHEME = 'vscode-notebook-cell';
const SQL = 'sql'
const FILE_EXTENSION = '.sql'
const MAGICS_DETECTED = [
	'%%sql',
	'%sql',
	'%%sparksql',
	'%sparksql',
	'%%trino',
	'%trino'
]

function formatSql(text: string | null): string {
	const formatted = format(text || '', {
		language: 'spark', // Defaults to "sql" (see the above list of supported dialects)
		indent: '  ', // Defaults to two spaces
		uppercase: true, // Defaults to false (not safe to use when SQL dialect has case-sensitive identifiers)
		linesBetweenQueries: 2, // Defaults to 1
	});
	return formatted;
}

function isSqlMagic(text: string): boolean {
	return MAGICS_DETECTED.some(magic => text.startsWith(magic));
}

function getNotebookDocument(document: vscode.TextDocument | vscode.NotebookDocument): vscode.NotebookDocument | undefined {
	return vscode.workspace.notebookDocuments.find((item) => item.uri.path === document.uri.path);
}

function isJupyterNotebook(document?: vscode.NotebookDocument) {
	return document?.notebookType === 'jupyter-notebook';
}
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "sql-magic-notebook-formatter" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('sql-magic-notebook-formatter.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from SQL Magic Notebook Formatter!');
	});

	context.subscriptions.push(disposable);

	// 👍 formatter implemented using API
	let disposable2 = vscode.languages.registerDocumentFormattingEditProvider([{ language: SQL }], {
		async provideDocumentFormattingEdits(document: vscode.TextDocument): Promise<vscode.TextEdit[] | undefined> {
			let firstLineNumber = 0;
			if (isSqlMagic(document.getText())) {
				firstLineNumber = 1;
			}

			console.log("Notebook SQL cell formatting")
			const firstLine = document.lineAt(firstLineNumber);
			const lastLine = document.lineAt(document.lineCount - 1);
			const range = new vscode.Range(firstLine.range.start, lastLine.range.end);
			let text = document.getText(range);
			const formattedText = formatSql(text);
			console.log(`replacing ${range.start} ${range.end}`);
			return [vscode.TextEdit.replace(range, formattedText)];
		}
	});

	context.subscriptions.push(disposable2);

}

// this method is called when your extension is deactivated
export function deactivate() { }
