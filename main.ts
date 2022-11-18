import {
	App,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	FileSystemAdapter,
	parseFrontMatterTags,
} from "obsidian";
import { RevealServer } from "./server";
import path from "path";

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
	clientId: string;
	clientSecret: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: "default",
	clientId: "default",
	clientSecret: "default",
};

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;
	private revealServer: RevealServer;
	private fileSystem: FileSystemAdapter;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		// const ribbonIconEl = this.addRibbonIcon(
		// 	"dice",
		// 	"Sample Plugin",
		// 	(evt: MouseEvent) => {
		// 		// Called when the user clicks the icon.
		// 		new Notice("This is a notice!");
		// 	}
		// );
		// // Perform additional things with the ribbon
		// ribbonIconEl.addClass("my-plugin-ribbon-class");

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		// const statusBarItemEl = this.addStatusBarItem();
		// statusBarItemEl.setText("Status Bar Text");

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: "open-sample-modal-simple",
			name: "Send song to frontmooder",
			callback: () => {
				this.revealServer.queueSpotifyURN("1234");
			},
		});


		this.addCommand({
			id: "frontmooder-autorize",
			name: "Authorize frontmooder",
			callback: () => {
				this.revealServer.authorize();
			},
		});

		this.addCommand({
			id: "frontmooder-login",
			name: "login to frontmooder",
			callback: () => {
				this.revealServer.login();
			},
		});

		// This adds an editor command that can perform some operation on the current editor instance
		// this.addCommand({
		// 	id: "sample-editor-command",
		// 	name: "Sample editor command",
		// 	editorCallback: (editor: Editor, view: MarkdownView) => {
		// 		console.log(editor.getSelection());
		// 		editor.replaceSelection("Sample Editor Command");
		// 	},
		// });
		// // This adds a complex command that can check whether the current state of the app allows execution of the command
		// this.addCommand({
		// 	id: "open-sample-modal-complex",
		// 	name: "Open sample modal (complex)",
		// 	checkCallback: (checking: boolean) => {
		// 		// Conditions to check
		// 		const markdownView =
		// 			this.app.workspace.getActiveViewOfType(MarkdownView);
		// 		if (markdownView) {
		// 			// If checking is true, we're simply "checking" if the command can be run.
		// 			// If checking is false, then we want to actually perform the operation.
		// 			if (!checking) {
		// 				new SampleModal(this.app).open();
		// 			}

		// 			// This command will only show up in Command Palette when the check function returns true
		// 			return true;
		// 		}
		// 	},
		// });

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		// this.registerDomEvent(document, "click", (evt: MouseEvent) => {
		// 	console.log("click", evt);
		// });

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		// this.registerInterval(
		// 	window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000)
		// );

		/* 
		todo:
		1. get current file
		2. get frontmatter
		3. get tags
		4. see if 'frontmood' tag exists
		5. if it does, command send to server to play
		6. if it doesn't, do nothing
		...
		n. same with pause

		https://marcus.se.net/obsidian-plugin-docs/reference/typescript/functions/parseFrontMatterTags
		https://alfred-spotify-mini-player.com/setup/
		https://github.com/MSzturc/obsidian-advanced-slides/blob/17c40231c376ce26ed4373c02c04265c88654820/src/obsidianUtils.ts
		https://developer.spotify.com/documentation/web-api/reference/#/operations/start-a-users-playback
		https://developer.spotify.com/documentation/general/guides/authorization/client-credentials/
		*/

		this.revealServer = new RevealServer(
			{
				clientId: this.settings.clientId || "default",
				clientSecret: this.settings.clientSecret || "default",
			},
			"15299"
		);
		this.revealServer.start();
	}

	onunload() {
		console.log("unloading plugin");
		this.revealServer.stop();
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	updateClientID(clientId: string) {
		this.revealServer.setClientId(clientId);

		console.log(this.revealServer.toString());
	}

	updateClientSecret(clientSecret: string) {
		this.revealServer.setClientSecret(clientSecret);

		console.log(this.revealServer.toString());
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText("Woah!");
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", { text: "Settings for my awesome plugin." });

		new Setting(containerEl)
			.setName("Client ID")
			.setDesc("It's a secret")
			.addText((text) =>
				text
					.setPlaceholder("Enter your secret")
					.setValue(this.plugin.settings.clientId)
					.onChange(async (value) => {
						console.log("Secret: " + value);
						this.plugin.settings.clientId = value;
						await this.plugin.saveSettings();
						this.plugin.updateClientID(value);
					})
			);

		new Setting(containerEl)
			.setName("Client Secret")
			.setDesc("It's a secret")
			.addText((text) =>
				text
					.setPlaceholder("Enter your secret")
					.setValue(this.plugin.settings.clientSecret)
					.onChange(async (value) => {
						console.log("Secret: " + value);
						this.plugin.settings.clientSecret = value;
						await this.plugin.saveSettings();
						this.plugin.updateClientSecret(value);
					})
			);
	}
}
