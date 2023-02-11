var express = require('express');
var router = express.Router();

/* GET index page of api. */
router.get('/', function(req, res, next) {
  res.status(200).json({message: 'online'});
});

const MountUrl = (channel = "bbbcam1") => {
  return `http://contentzord.gelderland.ga:2095/live/${channel}/chunks.m3u8?token=87811ad2784ew2d2`
}

//initializer
router.get('/channels/:ext', async function(req, res, next) {
  var ChannelName = req.params.ext || "bbbcam1"
  let HttpUrl = MountUrl(ChannelName)
  
  let ChannelBody = await fetch(HttpUrl)
  const reader = ChannelBody.body?.pipeThrough(new TextDecoderStream()).getReader();
  let BodyData;

  while (true) {
    const {value, done} = await reader?.read();
    if (done) break;
    BodyData = value;
  }
  
  let newStreableURL = `/api/v1/proxy?url=${encodeURI(BodyData.toString().split('\n')[BodyData.toString().split('\n').length -1])}&type=content`

  let NewBody =  BodyData.toString().split('\n')
  NewBody[NewBody.length - 1] = newStreableURL

 var NewString = "";
 NewBody.forEach((element) => {
  NewString = NewString? NewString + '\n' + element: NewString + element
 });
  
  res.status(200)
  .setHeader('Content-Type', 'application/vnd.apple.mpegurl')
  .setHeader( 'Access-Control-Allow-Origin', '*')
  .setHeader( 'alt-svc', 'h3=":443"; ma=86400, h3-29=":443"; ma=86400')
  .setHeader( 'CF-Cache-Status', 'DYNAMIC')
  .send(NewString)
});

//proxys
router.get('/proxy', async function(req, res, next) {
  let streamurl = req.query.url;
  let type = req.query.type || "ts";


  if (!streamurl) {
    res.status(500).end();
    return;
  }
  

  if (type == "ts") {
    const stream = await fetch(streamurl);
    const reader = stream.body?.getReader();
    Array.from(stream.headers).forEach((header) => {
        res.setHeader(header[0], header[1])
    })

    res.removeHeader("content-encoding")

    while (true) {
      const { value, done } = await reader?.read();
      if (done) break;
      res.write(value)
    }

    res.end()
    return;
  }

  if(type == "content"){
    const stream = await fetch(streamurl);
    const reader = stream.body?.pipeThrough(new TextDecoderStream()).getReader();
    let BodyData;
    Array.from(stream.headers).forEach((header) => {
        res.setHeader(header[0], header[1])
    })

    res.removeHeader("content-encoding")

    while (true) {
      const {value, done} = await reader?.read();
      if (done) break;
      BodyData = value;
    }   

    var NewString = "";
    BodyData.toString().split("\n").forEach((key) => {
        let element = key.includes('http') ? `/api/v1/proxy?url=${encodeURI(key)}&type=ts` : key
        NewString = NewString? NewString + '\n' + element: NewString + element
    })

    res.send(NewString)
}});

module.exports = router;
