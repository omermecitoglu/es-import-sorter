import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {

  const onWillSaveTextDocument = vscode.workspace.onWillSaveTextDocument((event: vscode.TextDocumentWillSaveEvent) => {
    const text = event.document.getText();
    const eol = event.document.eol === 1 ? "\n" : "\r\n";
    console.log(text.split(eol));
    vscode.window.showInformationMessage("document saved!");
  });

  context.subscriptions.push(onWillSaveTextDocument);
}

export function deactivate() {
  // .
}
