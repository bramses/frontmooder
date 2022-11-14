import express from "express";
import path from "path";
import { Server } from "http";
import { Notice } from "obsidian";
// import { ObsidianUtils } from "./obsidianUtils";

// thanks to https://github.com/MSzturc/obsidian-advanced-slides/blob/17c40231c376ce26ed4373c02c04265c88654820/src/revealServer.ts
export class RevealServer {
	private _app: express.Application;
	private _port = 15299;
	private _server: Server;
	//TODO: get rid of base & plugin dir
	private _baseDirectory: string;
	private _pluginDirectory: string;
	private _revealRenderer: RevealRenderer;
	private _staticDir = express.static;
	private filePath: string;
    private clientId: string;
    private clientSecret: string;

	constructor(utils: any, port: string) {
		const numPort = Number(port);
		this._port = isNaN(numPort) ? 15299 : numPort;
        this.clientId = utils.clientId;
        this.clientSecret = utils.clientSecret;
		// this._baseDirectory = utils.getVaultDirectory();
		// this._pluginDirectory = utils.getPluginDirectory();
		this._app = express();
	}

	getUrl(): URL {
		return new URL(`http://localhost:${this._port}`);
	}

	start() {
		// ["plugin", "dist", "css"].forEach((dir) => {
		// 	// @ts-ignore:
		// 	this._app.use(
		// 		"/" + dir,
		// 		this._staticDir(path.join(this._pluginDirectory, dir))
		// 	);
		// });

		// this._app.get("/embed/*", async (req, res) => {
		// 	const file = req.originalUrl.replace("/embed", "");
		// 	const filePath = path.join(
		// 		this._baseDirectory,
		// 		decodeURIComponent(file.split("?")[0])
		// 	);
		// 	const markup = await this._revealRenderer.renderFile(
		// 		filePath,
		// 		req.query
		// 	);
		// 	res.send(markup);
		// });

		// this._app.get(/(\w+\.md)/, async (req, res) => {
		// 	this.filePath = path.join(
		// 		this._baseDirectory,
		// 		decodeURIComponent(req.url.split("?")[0])
		// 	);
		// 	const markup = await this._revealRenderer.renderFile(
		// 		this.filePath,
		// 		req.query
		// 	);
		// 	res.send(markup);
		// });

		this._app.get("/", async (req, res) => {
			if (this.filePath === null) {
				res.send("Open Presentation Preview in Obsidian first!");
			}
			const markup = await this._revealRenderer.renderFile(
				this.filePath,
				req.query
			);
			res.send(markup);
		});

        this._app.get("/song/:id", async (req, res) => {
            const id = req.params.id;
            console.log(`[frontmooder] - song id: ${id}`);
        });

		// this._app.get("/localFileSlash/*", async (req, res) => {
		// 	const filepath = req.originalUrl.replace("/localFileSlash", "");
		// 	res.download(filepath);
		// });

		// this._app.use(this._staticDir(this._baseDirectory));

		this._server = this._app
			.listen(this._port, "127.0.0.1", () => {
				// tslint:disable-next-line:no-console
				console.log(
					`[frontmooder] - server started at http://localhost:${this._port}`
				);
			})
			.on("error", (err) => {
				new Notice(`Port ${this._port} already used!`);
			});
	}

	authorize() {
		const client_id = this.clientId; // Your client id
		const client_secret = this.clientSecret; // Your secret

		const authOptions = {
			url: "https://accounts.spotify.com/api/token",
			headers: {
				Authorization:
					"Basic " +
					new Buffer(client_id + ":" + client_secret).toString(
						"base64"
					),
			},
			form: {
				grant_type: "client_credentials",
			},
			json: true,
		};

		this._app.post(authOptions, function (error: any, response: any, body: any) {
			if (!error && response.statusCode === 200) {
				const token = body.access_token;
                console.log(token);
			} else {
                console.log(error);
            }
		});
	}

	stop() {
		this._server.close();
		console.log(`[frontmooder] - server stopped`);
	}
}
