import { ExtensionContext, TextDocumentWillSaveEvent, workspace } from "vscode";
import { format } from "./core/sort";

export function activate(context: ExtensionContext) {

  const onWillSaveTextDocument = workspace.onWillSaveTextDocument((event: TextDocumentWillSaveEvent) => {
    const text = event.document.getText();
    const eol = event.document.eol === 1 ? "\n" : "\r\n";
    const edits = format(text, eol);
    event.waitUntil(Promise.resolve(edits));
  });

  context.subscriptions.push(onWillSaveTextDocument);
}

export function deactivate() {
  // .
}
