import express from "express";
import { Server } from "http";
import { Notice, requestUrl } from "obsidian";
import request from "request";
import * as querystring from "querystring";

// import { ObsidianUtils } from "./obsidianUtils";

// thanks to https://github.com/MSzturc/obsidian-advanced-slides/blob/17c40231c376ce26ed4373c02c04265c88654820/src/revealServer.ts
export class RevealServer {
	private _app: express.Application;
	private _port = 15299;
	private _server: Server;
	// //TODO: get rid of base & plugin dir
	// private _baseDirectory: string;
	// private _pluginDirectory: string;
	// private _staticDir = express.static;
	// private filePath: string;
	private clientId: string;
	private clientSecret: string;
	private spotifyToken: string;

	constructor(utils: any, port: string) {
		console.log(`[frontmooder] - server constructor`);
		const numPort = Number(port);
		this._port = isNaN(numPort) ? 15299 : numPort;
		this.clientId = utils.clientId;
		this.clientSecret = utils.clientSecret;
		this.spotifyToken = "";

		this._app = express();
	}

	// getUrl(): URL {
	// 	return new URL(`http://localhost:${this._port}`);
	// }

	start() {
		// ["plugin", "dist", "css"].forEach((dir) => {
		// 	// @ts-ignore:
		// 	this._app.use(
		// 		"/" + dir,
		// 		this._staticDir(path.join(this._pluginDirectory, dir))
		// 	);
		// });

		let clientId: string | null = null;
		let clientSecret: string | null = null;

		this._app.get("/", async (req, res) => {
			res.send("Hello World!");
		});

		this._app.get('/redir-test', (req, res) => {
			res.redirect('https://google.com');
		});

		this._app.get("/recent-songs", async (req, res) => {
			// console.log(
			// 	`[frontmooder] - spotifyToken in queue song: ${this.spotifyToken}`
			// );

			// if (this.spotifyToken === "") {
			// 	console.log(
			// 		`[frontmooder] - no spotify token -- attempting to authorize`
			// 	);
			// 	await this.authorize();
			// }
			//
			// console.log(
			// 	`[frontmooder] - spotifyToken in queue song after auth: ${this.spotifyToken}`
			// );

			const options = {
				url: "https://api.spotify.com/v1/me/player/recently-played?after=148481104358",
				headers: {
					Authorization: `Bearer`,
					'Content-Type': 'application/json'
				}
			};

			request.get(options, (error, response, body) => {
				if (error) {
					console.log(`[frontmooder] - error: ${error}`);
				}
				console.log(
					`[frontmooder] - response: ${JSON.stringify(response)}`
				);
				console.log(`[frontmooder] - body: ${JSON.stringify(body)}`);
			});
		})

		this._app.get("/queueSpotifyURN/:id", async (req, res) => {
			console.log(
				`[frontmooder] - spotifyToken in queue song: ${this.spotifyToken}`
			);

			if (this.spotifyToken === "") {
				console.log(
					`[frontmooder] - no spotify token -- attempting to authorize`
				);
				await this.authorize();
			}

			console.log(
				`[frontmooder] - spotifyToken in queue song after auth: ${this.spotifyToken}`
			);

			// const id = req.params.id;
			// console.log(`[frontmooder] - queueSpotifyURN id in server: ${id}`);

			/*
curl --request PUT \
  --url https://api.spotify.com/v1/me/player/play \
  --header 'Authorization: ' \
  --header 'Content-Type: application/json' \
  --data '{
  "context_uri": "spotify:album:5ht7ItJgpBH7W6vJ5BqpPr",
  "offset": {
    "position": 5
  },
  "position_ms": 0
}'
			*/

			const options = {
				url: "https://api.spotify.com/v1/me/player/play",
				headers: {
					Authorization: `Bearer ${this.spotifyToken}`,
				},
				// https://open.spotify.com/track/4vpaz6338VqJIeJHq6z2mU?si=16e7e53a29fe411a
				json: true,
				body: {
					context_uri: "spotify:album:5ht7ItJgpBH7W6vJ5BqpPr",
					offset: {
						position: 5,
					},
					position_ms: 0,
				},
			};

			request.put(options, (error, response, body) => {
				if (error) {
					console.log(`[frontmooder] - error: ${error}`);
				}
				console.log(
					`[frontmooder] - response: ${JSON.stringify(response)}`
				);
				console.log(`[frontmooder] - body: ${JSON.stringify(body)}`);
			});

			res.send("Hello Song!");
		});

		this._app.get("/login/:clientID/:clientSecret", function (req, res) {
			const state = "some-state-of-my-choice";
			const scope = "user-read-private user-read-email";

			console.log(`clientID: ${req.params.clientID}`);
			console.log(`clientSecret: ${req.params.clientSecret}`);

			clientId = req.params.clientID;
			clientSecret = req.params.clientSecret;

			console.log(
				"https://accounts.spotify.com/authorize?" +
				querystring.stringify({
					response_type: "code",
					client_id: req.params.clientID,
					scope: scope,
					redirect_uri: "http://localhost:15299/callback",
					state: state,
				})
			)

			// res.redirect(
			// 	"https://accounts.spotify.com/authorize?" +
			// 	querystring.stringify({
			// 		response_type: "code",
			// 		client_id: req.params.clientID,
			// 		scope: scope,
			// 		redirect_uri: "http://localhost:15299/callback",
			// 		state: state,
			// 	})
			// );
		});
		function getAuthHeader(): string {
			console.log(this)
			return 'Basic ' + (new Buffer(clientId + ':' + clientSecret).toString('base64'))
		}



		this._app.get("/callback", function (req, res) {
			// console.log(`[frontmooder] - callback`);
			// // your application requests refresh and access tokens
			// // after checking the state parameter
			// console.log(`[frontmooder] - req: ${JSON.stringify(req)}`);
			// console.log(`[frontmooder] - res: ${JSON.stringify(res)}`);
			// const code = req.query.code || null;
			// const state = req.query.state || null;
			// console.log(`[frontmooder] - code: ${code}`);
			// console.log(`[frontmooder] - state: ${state}`);

			const code = req.query.code || null;
			const state = req.query.state || null;

			console.log(`[frontmooder] - code: ${code}`);
			console.log(`[frontmooder] - state: ${state}`);

			if (state === null) {
				console.log(`[frontmooder] - state is mismatched from Spotify auth flow`);
				// res.redirect('/#' +
				// 	querystring.stringify({
				// 		error: 'state_mismatch'
				// 	}));
			} else {
				const authOptions = {
					url: 'https://accounts.spotify.com/api/token',
					form: {
						code: code,
						redirect_uri: "http://localhost:15299/callback",
						grant_type: 'authorization_code'
					},
					headers: {
						'Authorization': getAuthHeader()
					},
					json: true
				};

				console.log(`[frontmooder] - authOptions: ${JSON.stringify(authOptions)}`);
				res.send("Hello World!");
			}
		});

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


	async login() {
		console.log(`[frontmooder] - login`);

		// console.log("https://accounts.spotify.com/authorize?" +
		// encodeURIComponent(JSON.stringify({
		// 		response_type: "code",
		// 		client_id: this,
		// 		scope: scope,
		// 		redirect_uri: "http://localhost:15299/callback",
		// 		state: state,
		// 	})))

		requestUrl(`http://localhost:15299/login/${this.clientId}/${this.clientSecret}`);



		// console.log(this)
		//
		// const rs = await requestUrl(
		// 	"https://accounts.spotify.com/authorize?" +
		// 	querystring.stringify({
		// 		response_type: "code",
		// 		client_id: this.clientId,
		// 		scope: scope,
		// 		redirect_uri: "http://localhost:15299/callback",
		// 		state: state,
		// 	})
		// );
		//
		// console.log(rs);
	}

	async redirectTest() {
		console.log(`[frontmooder] - redirectTest`);
		requestUrl("http://localhost:15299/redir-test");
	}

	async authorize() {
		console.log(`[frontmooder] - authorize`);
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
			method: "POST",
		};

		return new Promise((resolve, reject) =>
			request.post(
				authOptions,
				function (error: any, response: any, body: any) {
					if (!error && response.statusCode === 200) {
						const token = body.access_token;
						this.spotifyToken = token;
						console.log(
							`[frontmooder] - successfully authorized spotifyToken: ${token}`
						);
						resolve(token);
					} else {
						console.log(`[frontmooder] - error authorizing`);
						console.log(error);
						reject(error);
					}
				}
			)
		);
	}

	setClientId(clientId: string) {
		this.clientId = clientId;
	}

	setClientSecret(clientSecret: string) {
		this.clientSecret = clientSecret;
	}

	toString() {
		return JSON.stringify(this);
	}

	stop() {
		this._server.close();
		console.log(`[frontmooder] - server stopped`);
	}

	queueSpotifyURN(urn: string) {
		console.log(`[frontmooder] - queueSpotifyURN: ${urn}`);
		requestUrl(`http://localhost:${this._port}/queueSpotifyURN/${urn}`);
	}

	recentlyPlayed () {
		console.log("recently played")
		requestUrl(`http://localhost:${this._port}/recent-songs`)
	}
}
