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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
const ollama_1 = require("ollama");
const vscode = __importStar(require("vscode"));
function activate(context) {
    console.log('Extension "DeepSeek" is now active.');
    const disposable = vscode.commands.registerCommand("deepseek.start", () => {
        const panel = vscode.window.createWebviewPanel("deepChat", "Deep Seek Chat", vscode.ViewColumn.One, {
            enableScripts: true,
        });
        panel.webview.html = getWebViewContent();
        // ... rest of the code
        panel.webview.onDidReceiveMessage(async (message) => {
            if (message.command === "chat") {
                const userPrompt = message.text;
                let responseText = "";
                try {
                    const ollama = new ollama_1.Ollama();
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
                }
                catch (err) {
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
//# sourceMappingURL=extension.js.map