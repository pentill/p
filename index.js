const {
    WAConnection,
    MessageType,
    Mimetype,
    MessageOptions
} = require('@adiwajshing/baileys')
const { color, bgcolor } = require('./lib/color')
const { help } = require('./src/help')
const { wait } = require('./lib/functions')
const { getBuffer, fetchJson } = require('./lib/fetcher')
const fs = require('fs')
const client = new WAConnection()
const moment = require('moment-timezone')
const { exec } = require('child_process')
const kagApi = require('@kagchi/kag-api')
const fetch = require('node-fetch')
const imgbb = require('imgbb-uploader')
const speed = require('performance-now')
blocked = []

function kyun(seconds){
  function pad(s){
    return (s < 10 ? '0' : '') + s;
  }
  var hours = Math.floor(seconds / (60*60));
  var minutes = Math.floor(seconds % (60*60) / 60);
  var seconds = Math.floor(seconds % 60);

  return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds)
  return `${pad(hours)} Jam ${pad(minutes)} Menit ${pad(seconds)} Detik`
}

async function start() {
	client.on('qr', () => {
		console.log(color('[','white'), color('!','red'), color(']','white'), color('SCAN QR CODE BENTOL'))
	})

	client.on('credentials-updated', () => {
		fs.writeFileSync('./angga.json', JSON.stringify(client.base64EncodedAuthInfo(), null, '\t'))
	})

	fs.existsSync('./angga.json') && client.loadAuthInfo('./angga.json')

	await client.connect({timeoutMs: 30*1000})

	client.on('group-participants-update', async (anu) => {
		try {
			const mdata = await client.groupMetadata(anu.jid)
			console.log(anu)
			if (anu.action == 'add') {
				num = anu.participants[0]
				try {
					ppimg = await client.getProfilePicture(`${anu.participants[0].split('@')[0]}@c.us`)
				} catch {
					ppimg = 'https://i.ibb.co/swr7r1z/IMG-20201211-WA0508-picsay.jpg'
				}
				teks = `Hai *@${num.split('@')[0]}* Sayang\nBentol ganteng ga?\nGrup *${mdata.subject}*`
				let buff = await getBuffer(ppimg)
				client.sendMessage(mdata.id, buff, MessageType.image, {caption: teks, contextInfo: {"mentionedJid": [num]}})
			} else if (anu.action == 'remove') {
				num = anu.participants[0]
				try {
					ppimg = await client.getProfilePicture(`${anu.participants[0].split('@')[0]}@c.us`)
				} catch {
					ppimg = 'https://i.ibb.co/swr7r1z/IMG-20201211-WA0508-picsay.jpg'
				}
				teks = `*Pintu Keluar Ada Disamping Cuyy*\n*@${num.split('@')[0]}*`
				let buff = await getBuffer(ppimg)
				client.sendMessage(mdata.id, buff, MessageType.image, {caption: teks, contextInfo: {"mentionedJid": [num]}})
			}
		} catch (e) {
			console.log('Error : %s', color(e, 'red'))
		}
	})
	client.on('CB:Blocklist', json => {
		if (blocked.length > 2) return
	    for (let i of json[1].blocklist) {
	    	blocked.push(i.replace('c.us','s.whatsapp.net'))
	    }
	})
	
	client.on('message-new', async (mek) => {
		try {
			if (!mek.message) return
			const content = JSON.stringify(mek.message)
			const from = mek.key.remoteJid
			const type = Object.keys(mek.message)[0]
			const apiKey = 'SLpvUgOcMYwIx0pFeELt' 
			const vkey = 'F3bbG4nt3N6'
			const apinau = 'ApiKey'
			const msgType = MessageType
			const msgMim = Mimetype
			const time = moment.tz('Asia/Jakarta').format('DD/MM HH:mm:ss')
			console.log(color('[','white'), color(time), color(']','white'), 'from', color(from.split('@')[0]), 'type' , color(type))
			if (mek.key.fromMe) return // replace (mek.key.fromMe) to (!mek.key.fromMe) for make self bot
			if (type == 'conversation') {
				const body = mek.message.conversation.toLowerCase()
				const args = body.split(' ')
				if (body.startsWith('#gtts ')) {
					rendom = `${Math.floor(Math.random() * 10000)}.mp3`
					random = `${Math.floor(Math.random() * 20000)}.ogg`
					if (args.length < 1) return client.sendMessage(from, 'Masukkan kode bahasa.', msgType.text, {quoted: mek})
					const gtts = require('./lib/gtts')(args[1])
					const dtt = body.slice(8)
					if (!dtt) return client.sendMessage(from, 'Masukkan teks untuk dijadikan Audio.', msgType.text, {quoted: mek})
					if (dtt.length > 600) return client.sendMessage(from, 'Ngotak bos.', msgType.text, {quoted: mek})
					gtts.save(rendom, dtt, function () {
						exec(`ffmpeg -i ${rendom} -ar 48000 -vn -c:a libopus ${random}`, (error, stdout, stder) => {
							let res = fs.readFileSync(random)
							client.sendMessage(from, res, msgType.audio, {ptt: true})
							fs.unlinkSync(random)
							fs.unlinkSync(rendom)
						})
					})
				} else if (body == '#ping') {
					const timestamp = speed();
					const latensi = speed() - timestamp
					exec(`neofetch --stdout`, (error, stdout, stderr) => {
						const child = stdout.toString('utf-8')
					  const teks = child.replace(/Memory:/, "Ram:")
					client.sendMessage(from, `${teks}\nSpeed: ${latensi.toFixed(4)} _Second_`, msgType.text, {quoted: mek})
					})
				} else if (body == '#info') {
					const me = client.user
					const uptime = process.uptime()
					const hasil = `*Name* : ${me.name}\n*Nomor Bot* : @${me.jid.split('@')[0]}\n*Command* : #\n*Total Block Contact* : ${blocked.length}\n*The bot is active on* : ${kyun(uptime)}`
					const buffer = await getBuffer(me.imgUrl)
					client.sendMessage(from, buffer, msgType.image, {caption: hasil, contextInfo:{mentionedJid: [me.jid]}})
				} else if (body == '#meme') {
					const meme = await kagApi.memes()
					const buffer = await getBuffer(`https://imgur.com/${meme.hash}.jpg`)
					client.sendMessage(from, buffer, msgType.image, {quoted: mek})
				} else if (body == '#pokemon') {
					q7 = Math.floor(Math.random() * 890) + 1;
                    const buffer = await getBuffer(`https://assets.pokemon.com/assets/cms2/img/pokedex/full/${q7}.png`)
				   client.sendMessage(from, buffer, msgType.image, {quoted: mek})
				} else if (body == '#catfot') {
					q2 = Math.floor(Math.random() * 900) + 300;
                    q3 = Math.floor(Math.random() * 900) + 300;
                    const neko = 'http://placekitten.com/'+q3+'/'+q2
                    const buffer = await getBuffer(neko)
					client.sendMessage(from, buffer, msgType.image, {quoted: mek, caption: '>//<'})
				} else if (body.startsWith('#qrcode')) {
					const teks = encodeURIComponent(body.slice(8))
						if (!teks) return client.sendMessage(from, 'Masukan Teks/Url Yang Ingin Di Buat QR', msgType.text, {quoted: mek})
						const buffer = await getBuffer(`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${teks}`)
					    client.sendMessage(from, buffer, msgType.image, {quoted: mek})
				} else if (body.startsWith('#thunder')) {
					const teks = encodeURIComponent(body.slice(9))
						if (!teks) return client.sendMessage(from, 'Input teks yang ingin di tulis', msgType.text, {quoted: mek})
					const buffer = await getBuffer(`https://api.vhtear.com/thundertext?text=${teks}&apikey=${vkey}`)
					client.sendMessage(from, buffer, msgType.image, {quoted: mek})
				} else if (body.startsWith('#party')) {
					const teks = encodeURIComponent(body.slice(7))
						if (!teks) return client.sendMessage(from, 'Input teks yang ingin di tulis', msgType.text, {quoted: mek})
					const buffer = await getBuffer(`https://api.vhtear.com/partytext?text=${teks}&apikey=${vkey}`)
					client.sendMessage(from, buffer, msgType.image, {quoted: mek})
				} else if (body.startsWith('#phub')) {
					const teks = encodeURIComponent(body.slice(6))
						if (!teks) return client.sendMessage(from, 'Input teks yang ingin di tulis', msgType.text, {quoted: mek})
					const buffer = await getBuffer(`https://api.vhtear.com/pornlogo?text1=${teks}&text2=hub&apikey=${vkey}`)
					client.sendMessage(from, buffer, msgType.image, {quoted: mek})
				} else if (body.startsWith('#bpink')) {
					const teks = encodeURIComponent(body.slice(7))
						if (!teks) return client.sendMessage(from, 'Input teks yang ingin di tulis', msgType.text, {quoted: mek})
					const buffer = await getBuffer(`https://api.vhtear.com/blackpinkicon?text=${teks}&apikey=${vkey}`)
					client.sendMessage(from, buffer, msgType.image, {quoted: mek})
			    } else if (body.startsWith('#tahta')) {
					const teks = encodeURIComponent(body.slice(7))
						if (!teks) return client.sendMessage(from, 'Input teks yang ingin di tulis', msgType.text, {quoted: mek})
					const buffer = await getBuffer(`https://api.vhtear.com/hartatahta?text=${teks}&apikey=${vkey}`)
					client.sendMessage(from, buffer, msgType.image, {quoted: mek})
				} else if (body.startsWith('#rtext')) {
					const teks = encodeURIComponent(body.slice(7))
						if (!teks) return client.sendMessage(from, 'Input teks yang ingin di tulis', msgType.text, {quoted: mek})
					const buffer = await getBuffer(`https://api.vhtear.com/romancetext?text=${teks}&apikey=${vkey}`)
					client.sendMessage(from, buffer, msgType.image, {quoted: mek})
				} else if (body.startsWith('#stext')) {
					const teks = encodeURIComponent(body.slice(7))
						if (!teks) return client.sendMessage(from, 'Input teks yang ingin di tulis', msgType.text, {quoted: mek})
					const buffer = await getBuffer(`https://api.vhtear.com/silktext?text=${teks}&apikey=${vkey}`)
					client.sendMessage(from, buffer, msgType.image, {quoted: mek})
				} else if (body.startsWith('#gtext')) {
					const teks = encodeURIComponent(body.slice(7))
						if (!teks) return client.sendMessage(from, 'Input teks yang ingin di tulis', msgType.text, {quoted: mek})
					const buffer = await getBuffer(`https://api.vhtear.com/glowtext?text=${teks}&apikey=${vkey}`)
					client.sendMessage(from, buffer, msgType.image, {quoted: mek})
				} else if (body.startsWith('#glitch')) {
					const teks = encodeURIComponent(body.slice(8))
						if (!teks) return client.sendMessage(from, 'Input teks yang ingin di tulis', msgType.text, {quoted: mek})
					const buffer = await getBuffer(`https://api.vhtear.com/glitchtext?text1=${teks}&text2=__&apikey=${vkey}`)
					client.sendMessage(from, buffer, msgType.image, {quoted: mek})
				} else if (body.startsWith('#tits')) {
					const teks = encodeURIComponent(body.slice(6))
						if (!teks) return client.sendMessage(from, 'Input teks yang ingin di tulis', msgType.text, {quoted: mek})
					const buffer = await getBuffer(`https://nekos.life/api/v2/img/tits`, {method: 'get'})
					client.sendMessage(from, buffer, msgType.image, {quoted: mek, caption: '>///<'})
				} else if (body.startsWith('#nulis ')) {
					try {
						const teks = encodeURIComponent(body.slice(7))
						if (!teks) return client.sendMessage(from, 'Input teks yang ingin di tulis', msgType.text, {quoted: mek})
						const anu = await fetchJson(`https://mhankbarbars.herokuapp.com/nulis?text=${teks}&apiKey=${apiKey}`, {method: 'get'})
						const buffer = await getBuffer(anu.result)
						client.sendMessage(from, buffer, msgType.image, {quoted: mek, caption: '_Sukses nulis_'})
					} catch (e) {
						console.log(`Error : ${e}`)
						client.sendMessage(from, 'Gagal nulis *X*', msgType.text, {quoted: mek})
					}
				} else if (body.startsWith('#kbbi ')) {
					try {
						const teks = encodeURIComponent(body.slice(6))
						if (!teks) return client.sendMessage(from, '_Perintah doang yang diketik, yang mau dicari apa?_', msgType.text, {quoted: mek})
						const anu = await fetchJson(`https://mhankbarbars.herokuapp.com/api/kbbi?query=${teks}&lang=id&apiKey=${apiKey}`, {method: 'get'})
						const hasil = `${anu.result}`
						client.sendMessage(from, hasil, msgType.text, {quoted: mek})
					} catch (e) {
						console.log(`Error : ${e}`)
						client.sendMessage(from, '_Tidak dapat menemukan_', msgType.text, {quoted: mek})
					}
				} else if (body.startsWith('#wiki ')) {
					try {
						const teks = encodeURIComponent(body.slice(6))
						if (!teks) return client.sendMessage(from, '_Perintah doang yang diketik, yang mau dicari apa?_', msgType.text, {quoted: mek})
						const anu = await fetchJson(`https://mhankbarbars.herokuapp.com/api/wiki?q=${teks}&lang=id&apiKey=${apiKey}`, {method: 'get'})
						const hasil = `${anu.result} ${anu.images} ${anu.references} ${anu.source}`
						client.sendMessage(from, hasil, msgType.text, {quoted: mek})
					} catch (e) {
						console.log(`Error : ${e}`)
						client.sendMessage(from, '_Tidak dapat menemukan_', msgType.text, {quoted: mek})
					}
				} else if (body.startsWith('#jadwaltv ')) {
					try {
						const teks = encodeURIComponent(body.slice(10))
						if (!teks) return client.sendMessage(from, '_Perintah doang yang diketik, yang mau dicari apa?_', msgType.text, {quoted: mek})
						const anu = await fetchJson(`https://mhankbarbars.herokuapp.com/api/jdtv?ch=${teks}&apiKey=${apiKey}`, {method: 'get'})
						const hasil = `${anu.result}`
						client.sendMessage(from, hasil, msgType.text, {quoted: mek})
					} catch (e) {
						console.log(`Error : ${e}`)
						client.sendMessage(from, '_Tidak dapat menemukan_', msgType.text, {quoted: mek})
					}
				} else if (body.startsWith('#s ')) {
					try {
						const teks = encodeURIComponent(body.slice(3))
						if (!teks) return client.sendMessage(from, '_Perintah doang yang diketik, yang mau dicari apa?_', msgType.text, {quoted: mek})
						const anu = await fetchJson(`https://mhankbarbars.herokuapp.com/api/samisami?text=${teks}&apiKey=${apiKey}`, {method: 'get'})
						const hasil = `${anu.result}\n\n*SimSimi*`
						client.sendMessage(from, hasil, msgType.text, {quoted: mek})
					} catch (e) {
						console.log(`Error : ${e}`)
						client.sendMessage(from, '_Tidak dapat menemukan_', msgType.text, {quoted: mek})
					}
				} else if (body.startsWith('#chord ')) {
					try {
						const teks = encodeURIComponent(body.slice(7))
						if (!teks) return client.sendMessage(from, '_Perintah doang yang diketik, yang mau dicari apa?_', msgType.text, {quoted: mek})
						const anu = await fetchJson(`https://mhankbarbars.herokuapp.com/api/chord?q=${teks}&apiKey=${apiKey}`, {method: 'get'})
						const hasil = `*Chord Lagu ${teks}*\n\n${anu.result}`
						client.sendMessage(from, hasil, msgType.text, {quoted: mek})
					} catch (e) {
						console.log(`Error : ${e}`)
						client.sendMessage(from, '_Tidak dapat menemukan_', msgType.text, {quoted: mek})
					}
				} else if (body.startsWith('#infocuaca ')) {
					try {
						const teks = encodeURIComponent(body.slice(11))
						if (!teks) return client.sendMessage(from, '_Perintah doang yang diketik, yang mau dicari apa?_', msgType.text, {quoted: mek})
						const anu = await fetchJson(`https://mhankbarbars.herokuapp.com/api/cuaca?q=${teks}&apiKey=${apiKey}`, {method: 'get'})
						const hasil = `*Angin* : ${anu.result.angin}\n*Cuaca* : ${anu.result.cuaca}\n*Desk* : ${anu.result.desk}\n*Kelembapan* : ${anu.result.kelembapan}\n*Suhu* : ${anu.result.suhu}\n*Tempat* : ${anu.result.tempat}\n*Udara* : ${anu.result.udara}`
						client.sendMessage(from, hasil, msgType.text, {quoted: mek})
					} catch (e) {
						console.log(`Error : ${e}`)
						client.sendMessage(from, '_Tidak dapat menemukan_', msgType.text, {quoted: mek})
					}
				} else if (body.startsWith('#artinama')) {
					try {
						const teks = encodeURIComponent(body.slice(10))
						if (!teks) return client.sendMessage(from, '_Perintah doang yang diketik, yang mau dicari apa?_', msgType.text, {quoted: mek})
						const anu = await fetchJson(`https://scrap.terhambar.com/nama?n=${teks}`, {method: 'get'})
						const hasil = `*Arti Nama ${teks}*\n\n${anu.result.arti}`
						client.sendMessage(from, hasil, msgType.text, {quoted: mek})
					} catch (e) {
						console.log(`Error : ${e}`)
						client.sendMessage(from, '_Tidak dapat menemukan_', msgType.text, {quoted: mek})
					}
				} else if (body.startsWith('#lirik ')) {
					try {
						const teks = encodeURIComponent(body.slice(7))
						if (!teks) return client.sendMessage(from, '_Perintah doang yang diketik, yang mau dicari apa?_', msgType.text, {quoted: mek})
						const anu = await fetchJson(`https://arugaz.herokuapp.com/api/lirik?judul=${teks}`, {method: 'get'})
						const hasil = `*Lirik Lagu ${teks}*\n\n${anu.result}`
						client.sendMessage(from, hasil, msgType.text, {quoted: mek})
					} catch (e) {
						console.log(`Error : ${e}`)
						client.sendMessage(from, '_Tidak dapat menemukan_', msgType.text, {quoted: mek})
					}
				} else if (body.startsWith('#covidcountry ')) {
					try {
						const teks = encodeURIComponent(body.slice(14))
						if (!teks) return client.sendMessage(from, '_Perintah doang yang diketik, yang mau dicari apa?_', msgType.text, {quoted: mek})
						const anu = await fetchJson(`https://arugaz.herokuapp.com/api/corona?country=${teks}`, {method: 'get'})
						const hasil = `*Covid-19 Negara ${teks}*\n*Active* : ${anu.result.active}\n*Cases PerOneMillion* : ${anu.result.casesPerOneMillion}\n*Country* : ${anu.result.country}\n*Critical* : ${anu.result.critical}\n*Deaths PerOneMillion* : ${anu.result.deathsPerOneMillion}\n*Recovered* : ${anu.result.recovered}\n*Test PerOneMillion* : ${anu.result.testPerOneMillion}\n*Today Cases* : ${anu.result.todayCases}\n*Today Death* : ${anu.result.todayDeath}\n*Total Cases* : ${anu.result.totalCases}\n*Total Death* : ${anu.result.totalDeath}\n*Total Test* : ${anu.result.totalTest}`
						client.sendMessage(from, hasil, msgType.text, {quoted: mek})
					} catch (e) {
						console.log(`Error : ${e}`)
						client.sendMessage(from, '_Tidak dapat menemukan_', msgType.text, {quoted: mek})
					}
				} else if (body.startsWith('#waifu')) {
					try {
						const teks = encodeURIComponent(body.slice(6))
						const anu = await fetchJson(`https://arugaz.herokuapp.com/api/waifu`, {method: 'get'})
						const buffer = await getBuffer(anu.image)
						const hasil = `Nama : ${anu.name}\nDesc : ${anu.desc}`
						client.sendMessage(from, buffer, msgType.image, {quoted: mek, caption: `${hasil}`})
					} catch (e) {
						console.log(`Error : ${e}`)
						client.sendMessage(from, '_Tidak dapat menemukan_', msgType.text, {quoted: mek})
					}
				} else if (body.startsWith('#nekonime')) {
					try {
						const teks = encodeURIComponent(body.slice(9))
						const anu = await fetchJson(`https://arugaz.herokuapp.com/api/nekonime`, {method: 'get'})
						const buffer = await getBuffer(anu.result)
						client.sendMessage(from, buffer, msgType.image, {quoted: mek, caption: '>///<'})
					} catch (e) {
						console.log(`Error : ${e}`)
						client.sendMessage(from, '_Tidak dapat menemukan_', msgType.text, {quoted: mek})
					}
				} else if (body.startsWith('#loli')) {
					try {
						const teks = encodeURIComponent(body.slice(5))
						const anu = await fetchJson(`https://arugaz.herokuapp.com/api/randomloli`, {method: 'get'})
						const buffer = await getBuffer(anu.result)
						client.sendMessage(from, buffer, msgType.image, {quoted: mek, caption: '>///<'})
					} catch (e) {
						console.log(`Error : ${e}`)
						client.sendMessage(from, '_Tidak dapat menemukan_', msgType.text, {quoted: mek})
					}
				} else if (body.startsWith('#wikien ')) {
					try {
						const teks = encodeURIComponent(body.slice(8))
						if (!teks) return client.sendMessage(from, '_Perintah doang yang diketik, yang mau dicari apa?_', msgType.text, {quoted: mek})
						const anu = await fetchJson(`https://arugaz.herokuapp.com/api/wikien?q=${teks}`, {method: 'get'})
						const hasil = `${anu.result}`
						client.sendMessage(from, hasil, msgType.text, {quoted: mek})
					} catch (e) {
						console.log(`Error : ${e}`)
						client.sendMessage(from, '_Tidak dapat menemukan_', msgType.text, {quoted: mek})
					}
				} else if (body.startsWith('#covid')) {
					try {
						const teks = encodeURIComponent(body.slice(6))
						const anu = await fetchJson(`https://arugaz.herokuapp.com/api/coronaindo`, {method: 'get'})
						const hasil = `*Negara* : ${anu.negara}\n*Kasus Baru* : ${anu.kasus_baru}\n*Penanganan* : ${anu.penanganan}\n*Sembuh* : ${anu.sembuh}\n*Meninggal* : ${anu.meninggal}\n*Kasus Total* : ${anu.kasus_total}`
						client.sendMessage(from, hasil, msgType.text, {quoted: mek})
					} catch (e) {
						console.log(`Error : ${e}`)
						client.sendMessage(from, '_Tidak dapat menemukan_', msgType.text, {quoted: mek})
					}
				} else if (body.startsWith('#covidworld')) {
					try {
						const teks = encodeURIComponent(body.slice(11))
						const anu = await fetchJson(`https://api.terhambar.com/negara/World`, {method: 'get'})
						const hasil = `*Negara* : ${anu.negara}\n*Kasus Baru* : ${anu.kasus_baru}\n*Penanganan* : ${anu.penanganan}\n*Sembuh* : ${anu.sembuh}\n*Meninggal* : ${anu.meninggal}\n*Meninggal Baru* : ${anu.meninggal_baru}*Total* : ${anu.total}`
						client.sendMessage(from, hasil, msgType.text, {quoted: mek})
					} catch (e) {
						console.log(`Error : ${e}`)
						client.sendMessage(from, '_Tidak dapat menemukan_', msgType.text, {quoted: mek})
					}
				} else if (body.startsWith('#indohot')) {
					try {
						const teks = encodeURIComponent(body.slice(8))
						const anu = await fetchJson(`https://arugaz.herokuapp.com/api/indohot`, {method: 'get'})
						const hasil = `*Negara* : ${anu.result.country}\n*Durasi* : ${anu.result.durasi}\n*Genre* : ${anu.result.genre}\n*Judul* : ${anu.result.judul}\n*Link* : ${anu.result.url}`
						client.sendMessage(from, hasil, msgType.text, {quoted: mek})
					} catch (e) {
						console.log(`Error : ${e}`)
						client.sendMessage(from, '_Tidak dapat menemukan_', msgType.text, {quoted: mek})
					}
				} else if (body.startsWith('#infoanime ')) {
					try {
						const teks = encodeURIComponent(body.slice(11))
						const anu = await fetchJson(`https://arugaz.herokuapp.com/api/dewabatch?q=${teks}`, {method: 'get'})
						const buffer = await getBuffer(anu.thumb)
						const hasil = `*Info Anime ${teks}*\n${anu.result}\n${anu.sinopsis}`
						client.sendMessage(from, buffer, msgType.image, {quoted: mek, caption: `${hasil}`})
					} catch (e) {
						console.log(`Error : ${e}`)
						client.sendMessage(from, '_Tidak dapat menemukan_', msgType.text, {quoted: mek})
					}
				} else if (body.startsWith('#infoig ')) {
					try {
						const teks = encodeURIComponent(body.slice(8))
						const anu = await fetchJson(`https://alfians-api.herokuapp.com/api/stalk?username=${teks}`, {method: 'get'})
						const buffer = await getBuffer(anu.Profile_pic)
						const hasil = `*Biodata* ${anu.Biodata}*\n*Jumlah Followers* : ${anu.Jumlah_Followers}\n*Jumlah Following* : ${anu.Jumlah_Following}\n*Jumlah Post* : ${anu.Jumlah_Post}\n*Username* : ${anu.Username}`
						client.sendMessage(from, buffer, msgType.image, {quoted: mek, caption: `${hasil}`})
					} catch (e) {
						console.log(`Error : ${e}`)
						client.sendMessage(from, '_Tidak dapat menemukan_', msgType.text, {quoted: mek})
					}
				} else if (body.startsWith('#infogempa')) {
					try {
						const teks = encodeURIComponent(body.slice(10))
						const anu = await fetchJson(`https://alfians-api.herokuapp.com/api/infogempa`, {method: 'get'})
						const buffer = await getBuffer(anu.map)
						const hasil = `*Kedalaman* : ${anu.kedalaman}\n*Koordinat* : ${anu.koordinat}\n*Lokasi* : ${anu.lokasi}\n*Magnitude* : ${anu.magnitude}\n*Potensi* : ${anu.potensi}\n*Waktu* : ${anu.waktu}`
						client.sendMessage(from, buffer, msgType.image, {quoted: mek, caption: `${hasil}`})
					} catch (e) {
						console.log(`Error : ${e}`)
						client.sendMessage(from, '_Tidak dapat menemukan_', msgType.text, {quoted: mek})
					}
				} else if (body.startsWith('#quotes')) {
					try {
						const teks = encodeURIComponent(body.slice(7))
						const anu = await fetchJson(`https://arugaz.herokuapp.com/api/randomquotes`, {method: 'get'})
						const hasil = `${anu.quotes}\n\n*${anu.author}`
						client.sendMessage(from, hasil, msgType.text, {quoted: mek})
					} catch (e) {
						console.log(`Error : ${e}`)
						client.sendMessage(from, '_Tidak dapat menemukan_', msgType.text, {quoted: mek})
					}
				} else if (body.startsWith('#brainly ')) {
					try {
						const teks = encodeURIComponent(body.slice(9))
						const anu = await fetchJson(`https://api.vhtear.com/branly?query=${teks}&apikey=${vkey}`)
						const hasil = `${anu.result.data}`
						client.sendMessage(from, hasil, msgType.text, {quoted: mek})
					} catch (e) {
						console.log(`Error : ${e}`)
						client.sendMessage(from, '_Tidak dapat menemukan_', msgType.text, {quoted: mek})
					}
				} else if (body.startsWith('#alay ')) {
					try {
						const teks = encodeURIComponent(body.slice(6))
						const anu = await fetchJson(`https://api.terhambar.com/bpk?kata=${teks}`, {method: 'get'})
						const hasil = `${anu.teks}`
						client.sendMessage(from, hasil, msgType.text, {quoted: mek})
					} catch (e) {
						console.log(`Error : ${e}`)
						client.sendMessage(from, '_Tidak dapat menemukan_', msgType.text, {quoted: mek})
					}
				} else if (body.startsWith('#namacowok ')) {
					try {
						const teks = encodeURIComponent(body.slice(11))
						const anu = await fetchJson(`https://api.terhambar.com/nama?jenis=${teks}`, {method: 'get'})
						const hasil = `${anu.result.nama}`
						client.sendMessage(from, hasil, msgType.text, {quoted: mek})
					} catch (e) {
						console.log(`Error : ${e}`)
						client.sendMessage(from, '_Tidak dapat menemukan_', msgType.text, {quoted: mek})
					}
				} else if (body.startsWith('#namajepang ')) {
					try {
						const teks = encodeURIComponent(body.slice(12))
						const anu = await fetchJson(`https://api.terhambar.com/ninja?nama=${teks}`, {method: 'get'})
						const hasil = `${anu.result.ninja}`
						client.sendMessage(from, hasil, msgType.text, {quoted: mek})
					} catch (e) {
						console.log(`Error : ${e}`)
						client.sendMessage(from, '_Tidak dapat menemukan_', msgType.text, {quoted: mek})
					}
			    } else if (body.startsWith('#gtitle')) {
					try {
						const teks = body.slice(8)
						if (!teks) return client.sendMessage(from, 'Command Salah Masukan !gtitle JUDUL\n\n Contoh #gtitle GROUP ONLY VIP', msgType.text, {quoted: mek})
						await client.groupUpdateSubject(from, teks)
						var jids = [];
    mesaj = ``;
            mesaj += '@' + mek.participant.split('@')[0] + '\n ';
            jids.push(mek.participant.replace('c.us', 's.whatsapp.net'));
						client.sendMessage(from, `Nama Group Telah Di Ganti Ke ${teks}\nOleh ${mesaj}`, msgType.extendedText, {contextInfo: {mentionedJid: jids}, previewType: 0})
						} catch (e) {
						console.log(`Error : ${e}`)
						}
				} else if (body.startsWith('#gdesc')) {
					try {
						const teks = body.slice(7)
						if (!teks) return client.sendMessage(from, 'Command Salah Masukan !gdesc Isi Description\n\n Contoh !gdesc 1.peraturan masukan bot jika sudah bayar', msgType.text, {quoted: mek})
						client.sendMessage(from, '[❗]Sedang mengubah', msgType.text, {quoted: mek})
				   await client.groupUpdateDescription(from, teks)
						var jids = [];
    mesaj = ``;
            mesaj += '@' + mek.participant.split('@')[0] + '\n ';
            jids.push(mek.participant.replace('c.us', 's.whatsapp.net'));
						client.sendMessage(from, ` Description Telah Di Ganti Ke ${teks}\nOleh ${mesaj}`, msgType.extendedText, {contextInfo: {mentionedJid: jids}, previewType: 0})
						} catch (e) {
						console.log(`Error : ${e}`)
						}
			   } else if (body.startsWith('#tagall')) {
					try {
						const teks = body.slice(8)
						const time = moment.tz('Asia/Jakarta').format('DD/MM HH:mm:ss')
					grup = await client.groupMetadata(from);
    var jids = [];
    mesaj = `Di Tag Pada *${time}*\n\n*JANGAN CUMA NYIMAK DOANG KONTOL*\n${teks}`;
    grup['participants'].map(
        async (uye) => {
            mesaj += '@' + uye.id.split('@')[0] + ' ';
            jids.push(uye.id.replace('c.us', 's.whatsapp.net'));
        }
    );
    await client.sendMessage(from, mesaj, MessageType.extendedText, {contextInfo: {mentionedJid: jids}, previewType: 0})
	} catch (e) {
						console.log(`Error : ${e}`)
						client.sendMessage(isOwner, `EROR:\n\n ${e}`, msgType.text, {quoted: mek})
						}
					// uncomment if you want to activate this feature
				} else if (body.startsWith('#tts ') || body.startsWith('#tt ')) {
					const teks = encodeURIComponent(body.slice(args[0].length))
					random = `${Math.floor(Math.random() * 10000)}.png`
					rendom = `${Math.floor(Math.random() * 20000)}.webp`
					if (!teks) return client.sendMessage(from, 'Input teks yang ingin dijadikan stiker', msgType.text, {quoted: mek})
					const anu = await fetchJson(`https://mhankbarbars.herokuapp.com/api/text2image?text=${teks}&apiKey=${apiKey}`, {method: 'get'})
					exec(`wget ${anu.result} -O ${random} && ffmpeg -i ${random} -vcodec libwebp -filter:v fps=fps=20 -lossless 1 -loop 0 -preset default -an -vsync 0 -s 512:512 ${rendom}`, (error, stdout, stderr) => {
						let buffer = fs.readFileSync(rendom)
						client.sendMessage(from, buffer, msgType.sticker, {quoted: mek})
						fs.unlinkSync(random)
						fs.unlinkSync(rendom)
					})
				} else if (body == '#bentol' || body == '#tol') {
					client.sendMessage(from, help(), msgType.text, {quoted: mek})
				} else if (body == '#getpp') {
					const ppUrl = await client.getProfilePicture(from) // leave empty to get your own 
					const buffer = await getBuffer(ppUrl)
					client.sendMessage(from, buffer, msgType.image, {quoted: mek, caption: `_Ini diaa bruh_`})
				} else if (body == '#tod' || body == '#truthordare') {
					            const diti = fs.readFileSync('./lib')
            const ditiJsin = JSON.parse(diti)
            const rindIndix = Math.floor(Math.random() * ditiJsin.length)
            const rindKiy = ditiJsin[rindIndix]
var data = `*${rindKiy.game}*\n\n${rindKiy.soal}`
					let buffer = fs.readFileSync('./temp/27420-truth-or-dare.jpg')
					client.sendMessage(from, buffer, msgType.image, {quoted: mek, caption: `${data}`})
					
				} else {
					return false
				}

			} else if (type == 'imageMessage') {
				const captimg = mek.message.imageMessage.caption.toLowerCase()
				if (captimg == '#stiker' || captimg == '#sticker') {
					media = await client.downloadAndSaveMediaMessage(mek)
					rendom = `${Math.floor(Math.random() * 10000)}.webp`
					exec(`ffmpeg -i ${media} -vcodec libwebp -filter:v fps=fps=20 -lossless 1 -loop 0 -preset default -an -vsync 0 -s 512:512 ${rendom}`, (error, stdout, stderr) => {
						let buffer = fs.readFileSync(rendom)
						client.sendMessage(from, buffer, msgType.sticker, {quoted: mek})
						fs.unlinkSync(rendom)
						fs.unlinkSync(media)
					})
				} else if (captimg == '#wait') {
					media = await client.downloadAndSaveMediaMessage(mek)
					let buffer = fs.readFileSync(media)
					await wait(buffer).then(res => {
						client.sendMessage(from, res.video, msgType.video, {caption: hasil.teks, quoted: mek})
						fs.unlinkSync(media)
					}).catch(err => {
						client.sendMessage(from, err, msgType.text, {quoted: mek})
						fs.unlinkSync(media)
					})
				} else if (captimg == 'Elaina') {
					media = await client.downloadAndSaveMediaMessage(mek)
			       await setProfilePicture(media)
			var jids = [];
    mesaj = `Terimakasih`;
            mesaj += '@' + mek.participant.split('@')[0] + '\n ';
            jids.push(mek.participant.replace('c.us', 's.whatsapp.net'));
			client.sendMessage(from, `${mesaj} Telah Mengganti Profil Ku`, msgType.text, {quoted: mek})
				} else if (captimg == '#gpp' || captimg == '!gprofile') {
					client.sendMessage(from, '[❗]Sedang mengganti', msgType.text, {quoted: mek})
					media = await client.downloadAndSaveMediaMessage(mek)
			       await conn.updateProfilePicture (from, media)
			client.sendMessage(from, 'Sukses Mengganti Icon Group', msgType.text, {quoted: mek})
				} else {
					return
				}

			} else if (type == 'videoMessage') {
				const captvid = mek.message.videoMessage.caption.toLowerCase()
				if (captvid == '#gifsticker' || captvid == '#gifstiker') {
					media = await client.downloadAndSaveMediaMessage(mek)
					rendom = `${Math.floor(Math.random() * 100)}.webp`
					exec(`ffmpeg -i ${media} -vcodec libwebp -filter:v fps=fps=20 -lossless 1 -loop 0 -preset default -an -vsync 0 -s 512:512 ${rendom}`, (error, stdout, stderr) => {
						let buffer = fs.readFileSync(rendom)
						client.sendMessage(from, buffer, msgType.sticker, {quoted: mek})
						fs.unlinkSync(rendom)
						fs.unlinkSync(media)
					})
				} else {
					return
				}

			} else if (type == 'extendedTextMessage') {
				mok = JSON.parse(JSON.stringify(mek).replace('quotedM','m'))
				qtdMsg = mek.message.extendedTextMessage.text.toLowerCase()
				if (qtdMsg == '#stiker' || qtdMsg == '#sticker' && content.includes('imageMessage') || content.includes('videoMessage')) {
					media = await client.downloadAndSaveMediaMessage(mok.message.extendedTextMessage.contextInfo)
					rendom = `${Math.floor(Math.random() * 100)}.webp`
					exec(`ffmpeg -i ${media} -vcodec libwebp -filter:v fps=fps=20 -lossless 1 -loop 0 -preset default -an -vsync 0 -s 512:512 ${rendom}`, (error, stdout, stderr) => {
						let buffer = fs.readFileSync(rendom)
						client.sendMessage(from, buffer, msgType.sticker, {quoted: mek})
						fs.unlinkSync(rendom)
						fs.unlinkSync(media)
					})
				} else if (qtdMsg == 'Elaina' && content.includes('imageMessage')) {
					client.sendMessage(from, 'Tunggu', msgType.text, {quoted: mek})
					media = await client.downloadAndSaveMediaMessage(mok.message.extendedTextMessage.contextInfo)
			       await setProfilePicture(media)
			var jids = [];
    mesaj = `Terimakasih`;
            mesaj += '@' + mek.participant.split('@')[0] + '\n ';
            jids.push(mek.participant.replace('c.us', 's.whatsapp.net'));
			client.sendMessage(from, `${mesaj} Telah Mengganti Profil Ku`, msgType.text, {quoted: mek})
				} else if (qtdMsg == '#wait' && content.includes('imageMessage')) {
					media = await client.downloadAndSaveMediaMessage(mok.message.extendedTextMessage.contextInfo)
					let buffer = fs.readFileSync(media)
					await wait(buffer).then(res => {
						client.sendMessage(from, res.video, msgType.video, {caption: res.hasil, quoted: mek})
						fs.unlinkSync(media)
					}).catch(err => {
						client.sendMessage(from, err, msgType.text, {quoted: mek})
						fs.unlinkSync(media)
					})
				} else if (qtdMsg == '#toimg' && content.includes('stickerMessage')) {
					media = await client.downloadAndSaveMediaMessage(mok.message.extendedTextMessage.contextInfo)
					random = `${Math.floor(Math.random() * 10)}.png`
					exec(`ffmpeg -i ${media} ${random}`, (error, stdout, stderr) => {
						let buffer = fs.readFileSync(random)
						client.sendMessage(from, buffer, msgType.image, {quoted: mek, caption: '>//<'})
					})
				} else {
					return
				}
			} else {
				return false
			}
		} catch (e) {
			console.log('Error : %s', color(e, 'red'))
		}
	})
}
start().catch((err) => console.log(`Error : ${err}`))
