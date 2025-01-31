import { Ollama } from "ollama";
import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  console.log('Extension "DeepSeek" is now active.');
  const disposable = vscode.commands.registerCommand("deepseek.start", () => {
    const panel = vscode.window.createWebviewPanel(
      "deepChat",
      "Deep Seek Chat",
      vscode.ViewColumn.One,
      {
        enableScripts: true,
      }
    );
    panel.webview.html = getWebViewContent();

    // ... rest of the code
    panel.webview.onDidReceiveMessage(async (message: any) => {
      if (message.command === "chat") {
        const userPrompt = message.text;
        let responseText = "";

        try {
          const ollama = new Ollama();
          const streamResponse = await ollama.chat({
            model: "deepseek-r1:8b",
            messages: [{ role: "user", content: userPrompt }],
            stream: true,
          });
          for await (const part of streamResponse) {
            responseText += part.message.content;
            panel.webview.postMessage({
              command: "chatResponse",
              text: responseText,
            });
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          vscode.window.showErrorMessage(`Chat failed: ${errorMessage}`);
        }
      }
    });
  });
  context.subscriptions.push(disposable);
}

function getWebViewContent() {
  return /*html*/ `<!DOCTYPE html>
	<html lang="en">
	<head>
	    <meta charset="UTF-8">
		<style>
			body{ font-family:sans-serif;margin:1rem;}
			#prompt {width:100%; box-sizing:border-box;}
			#response {border:1px solid #ccc; margin-top:1rem; padding:0.5rem;}
		</style>
	</head>
	<body>
	<h2>Deep VS Code Extension</h2>
	<textarea id="prompt" rows="3" placeholder="Ask Something..."></textarea>
	<button id="askBtn">Ask</button>
	<div id="response"></div>
	<script>
	const vscode  = acquireVsCodeApi();
	document.getElementById("askBtn").addEventListener("click",()=>{
		const text = document.getElementById("prompt").value;
		vscode.postMessage({ command: "chat", text });
	});
	window.addEventListener('message',event=>{
		const {command, text} = event.data
		if(command === "chatResponse"){
            document.getElementById("response").innerText = text;
        }
	});
	</script>
	</body>
	`;
}
