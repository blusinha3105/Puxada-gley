const express = require('express');

const app = express();

const input = require("input");

const cors = require('cors');

const fs = require('fs');

//const chalk = require('chalk');



app.use(cors());

app.set('trust proxy', 1);

const { TelegramClient } = require("telegram");

const { StringSession } = require("telegram/sessions");

const { NewMessage } = require("telegram/events");



///PORTA ONDE AS APIS VAI RODAR NA LOCALHOST



const PORT = process.env.PORT || 8080;



///TELA INICIAL DAS APIS



app.get('/', async(req, res, next) => {

   return res.status(200).send({

    status: false,

    resultado: 'APIS ONLINE'

  });

  })



/// GRUPO ONDE VAI SER UTILIZADO PARA FAZER AS CONSULTAS 

const Grupos = [

//{ chat: "consultasgratisYan2", bot: "Yanconsulta_bot" },

{ chat: "noxbuscas", bot: "Noxbuscabot" },

];





//https://t.me/consultasgratisYan2

//COLOCA SEUS BAGULHO AQ



const apiId = `21844566`; //https://my.telegram.org/auth

const apiHash = `ff82e94bfed22534a083c3aee236761a`; //https://my.telegram.org/auth

const stringSession = new StringSession(`1AQAOMTQ5LjE1NC4xNzUuNTUBuw4J/rSTftH3OTaxSk1p1gAnLWmZmvq/XpIaTKKWvrMOc83qkVTpeBG+G95w06sqMd+9195g1UqxAQhgztVUb9rVIQKbIe9RffU4DtIYAFDy/aU6RgU2UQ0g4YN10FZQdCCBqbXgQm2719vMjOP8QRRZG3DC1xLuOH7ysEYQUDZ5Wk6RjMVF2msaRVFPJpi+N3bfLqB3bPU6y/TKV5RRtG8SP+N57PzPqrQSo9XBvhuhTZd3j8h7cZVGeft9cgFn7FLFEVYpaP4w2e7RL03lB+mZixyt7oJWYgWBKnr1Yd9EikyALfCTe97EWnO4H5YXwcjMy/SopU0l3aUTSE7SWeA=`)



/*1BAAOMTQ5LjE1NC4xNjcuOTEAUJmvEdqKYTSMXsJlzitNHXwO8o1ZQpKghMjrWraFMBaOOCtbzd8gJoVPvlokpkY8XG2HoZhDHPVO1SdskffTPHA2wuA8u1rpViFWvKwRNXLh0crdjh+guZ/0h32VC74VvL/YMChC3VMCMwAznEfkGrObk/iTXBUftcPgtQ17d/Ewto32SWxntZnNn7OhlcIH5VBlG3r/wIKqUBUYVB+EwEhDUsTBONgZkt6aOI/IgX+b8RGUKsRp2a9C9fUHhq7Yu5eVbx9PHb6MsGNex16qTHbCw02lOE4Yjb5fBXZ/3Ao+Wn3TTn3R5hcpX+yur6V3N9m9s2FLh3LXnjmFDk5Cehk=*/

//FIM



const telegram = new TelegramClient(stringSession, apiId, apiHash, {

	connectionRetries: 5

});



(async () => {

	await telegram.start({

		phoneNumber: "5511959969604", // SEU NUMERO DE TELEFONE AQUI DA CONTA DO TELEGRAM QUE DESEJA USAR!

		password: async () => await input.text("insira sua senha: "),

		phoneCode: async () =>

			await input.text("Insira o codigo recebido no seu telegram: "),

		onError: (err) => console.log(err)

	});

	console.log("TELEGRAM: Conectado com sucesso!");

	console.log(telegram.session.save());

	await telegram.sendMessage("me", { message: "To Online!" });

})();





// EXEMPLO DE COMO USAR A API



// HTTPS://LOCALHOST:8080/CPF1/O CPF AQUI



// TIPOS DE CONSULTAS DISPONÍVEIS:

// cpf1|cpf2|cpf3|cpf4|tel1|tel2|tel3|cnpj|score|nome|parentes|beneficios|placa1|vizinhos|site|ip|cep|bin|email



//FIM



app.get("/consultas/:type/q=:q/", async (req, res) => {

	var db = JSON.parse(fs.readFileSync("db.json"));

    var achou2 = false;

	const type = req.params.type.toLowerCase() || '';

	const query = req.params.q.toLowerCase() || '';

 if (!query) return res.json({

                 status: true,



               "resultado": {

               "str": "[❌] Ensira o tipo de consulta [❌]"

               }

             })

 if (type.search(/cpf1|cpf2|cpf3|cpf4|cpf5|cpf6|cpf7|cpf8|tel1|tel2|tel3|cnpj|score|nome|parentes|beneficios|placa1|vizinhos|site|ip|cep|bin|email/) === -1) return res.send('Tipo de consulta invalida');

	console.log(`[CONSULTA] : ${type} = ${query}`);

	if (db && db[type] && db[type][query]) return res.send(db[type][query]);



	const Consultar = {

		nego() {

			if (query.length != 11) return res.json({err:'O CPF deve conter 11 digitos!'})



			telegram.sendMessage(Grupos[0].chat, {

				message: `/cpf2 ${query}`

			})

				.catch((e) => res.json({

                 status: true,



               "resultado": {

               "str": "[❌] Não foi possível fazer consulta.[❌]"

               }

             })

				);

		}

	}

	if (Consultar[type]) Consultar[type]();

	else await telegram.sendMessage(Grupos[0].chat, {

		message: `/${type} ${query}`

	})

		.catch((e) =>{

			res.json({

                 status: true,



               "resultado": {

               "str": "[❌] Não foi possível fazer consulta.[❌]"

               }

             })



			console.log("DEBUG NO CÓDIGO:",e)

		});

	async function OnMsg(event) {

		const message = event.message;

		const textPure =

			message && message.text ?

			message.text :

			message && message.message ?

			message.message : '';

		const text =

			message && message.text ?

			message.text.toLowerCase() :

			message && message.message ?

			message.message.toLowerCase() : '';

		const msgMarked = await message.getReplyMessage();

		const msgMarkedText =

			msgMarked && msgMarked.text ?

			msgMarked.text.toLowerCase() :

			msgMarked && msgMarked.message ?

			msgMarked.message.toLowerCase() : '';

		const sender = await message.getSender();

		const senderId = sender && sender.username ? sender.username : '';

		const chat = await message.getChat();

		const chatId = chat && chat.username ? chat.username : '';

		msgggveri = msgMarkedText.replace(/\/|-|\.|\`|\*/g, '').toLowerCase()

				queryverii = query.replace(/\/|-|\.|\`|\*/g, '').toLowerCase()

				txtuuuveri = text.replace(/\/|-|\.|\`|\*/g, '').toLowerCase()

		for (let i of Grupos) {

			try {

				if ((chatId == i.chat && senderId == i.bot) && (msgggveri.includes(queryverii) || txtuuuveri.includes(queryverii) )) {

					achou2 = true;

					await telegram.markAsRead(chat);

					//console.log(`text: ${textPure}, msgMarked: ${msgMarkedText}`)

					if (text.includes("⚠️"))return res.json({

                 status: true,



               "resultado": {

               "str": "[⚠️] NÃO ENCONTRANDO! [⚠️]"

               }

             })

					if (text.includes("Inválido") || text.includes("INVÁLIDO"))

						res.json({

                 status: true,



               "resultado": {

               "str": "[⚠️] INVALIDO! [⚠️]"

               }

             })



				}



				if ((chatId == i.chat && senderId == i.bot) && (msgggveri.includes(queryverii) || txtuuuveri.includes(queryverii) )) {

					achou2 = true;

					await telegram.markAsRead(chat);

					let str = textPure;

					str = str.replace(/\*/gi, "");

					str = str.replace(/\`/gi, "");

					str = str.replace(/\+/gi, "");

					str = str.replace(/\[/gi, "");

					str = str.replace(/\]/gi, "");

					str = str.replace(/\(/gi, "");

					str = str.replace(/\)/gi, "");

					str = str.replace(/\•/gi, "");

					str = str.replace(/\n\n\n/gi, "\n\n");

					str = str.replace(/CONSULTA DE CPF 2 \n\n/gi, "CONSULTA DE CPF ");

					str = str.replace(/🔍 CONSULTA DE CPF1 COMPLETA 🔍/gi, "CONSULTA DE CPF ");

					str = str.replace(/🔍 CONSULTA DE CPF3 COMPLETA 🔍/gi, "CONSULTA DE CPF ");

					str = str.replace(/🔍 CONSULTA DE CPF 4 🔍/gi, "CONSULTA DE CPF ");

                    str = str.replace(/BY: @MkBuscasRobot/gi, "");

					str = str.replace(/\n\nUSUÁRIO: NT CONSULTA/gi, '');

					str = str.replace(/USUÁRIO: NT CONSULTA\n\n/gi, '');

					str = str.replace(/ USUÁRIO: NT CONSULTA/gi, '');

					str = str.replace(/🔍|V1|V2/gi, '');

					str = str.replace(/COMPLETA/gi, '');

					str = str.replace(/CONSULTA DE CPF 2/gi, 'CONSULTA DE CPF');

					str = str.replace(/\n\nBY: @MkBuscasRobot/gi, "");

					str = str.replace(/\n\nREF: @refmkbuscas/gi, '');

					str = str.replace(/\nREF: @refmkbuscas/gi, '');

					str = str.replace(/REF: @refmkbuscas/gi, '');

					str = str.replace(/EMPTY/gi, "");

					str = str.replace(/\n\n\n\n/gi, "\n\n");

					str = str.replace(/USUÁRIO: NT CONSULTA/gi, '');

					str = str.replace(/COMPLETA/gi, '');

					str = str.replace(/𝗖𝗢𝗡𝗦𝗨𝗟𝗧𝗔 𝗗𝗘 𝗖𝗣𝗙\n\n/gi, '');

					str = str.replace(/𝗖𝗢𝗡𝗦𝗨𝗟𝗧𝗔 𝗗𝗘 𝗣𝗟𝗔𝗖𝗔\n\n/gi, '');

					str = str.replace(/𝗖𝗢𝗡𝗦𝗨𝗟𝗧𝗔 𝗗𝗘 𝗧𝗘𝗟𝗘𝗙𝗢𝗡𝗘\n\n/gi, '');

					str = str.replace(/𝗖𝗢𝗡𝗦𝗨𝗟𝗧𝗔 𝗗𝗘 𝗡𝗢𝗠𝗘\n\n/gi, '');









					let json = {};

					const linhas = str.split("\n");

					for (const t of linhas) {

						const key = t.split(": ");

						key[0] = key[0]

							.replace(/\//g, " ")

							.toLowerCase()

							.replace(/(?:^|\s)\S/g, function (a) {

								return a.toUpperCase();

							})

							.replace(/ |•|-|•|/g, "");

						json[key[0]] = key[1];

					}

					if (db && db[type]) db[type][query] = str;

					else db[type] = {}, db[type][query] = str;

					fs.writeFileSync("db.json", JSON.stringify(db, null, "\t"));





					res.json({

                 status: true,



               "resultado": {

               str

               }

             })

				}

				return;

			} catch (e) {

				if (achou2) return;

				res.json({

                 status: true,



               "resultado": {

               "str": "[❌]error no servidor, não foi possivel fazer a consulta[❌]"

               }

             })

				console.log(e);

			}

		}

	}

	telegram.addEventHandler(OnMsg, new NewMessage({}));

	setTimeout(() => {

		if (achou2) return;

		res.json({

                 status: true,



               "resultado": {

               "str": "[⏳]servidor demorou muito para responder[⏳]"

               }

             })

	}, 90000);

});

app.listen(PORT, () => {

    console.log(`Aplicativo rodando na url: http://localhost:${PORT}`);

})

