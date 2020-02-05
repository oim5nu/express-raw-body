var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var _ = require('lodash');
var axios = require('axios');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/callbacks', async function(req, res, next) {
  console.log('req.rawBody', req.rawBody);
  //console.log('req.body', req.body);
  //console.log('headers', _.get(req, ['headers']));
  //console.log('x-content-signature', _.get(req, ['headers', 'x-content-signature']));
  console.log('req.payload', req.payload);
  const xSignature = _.get(req, ['headers', 'x-content-signature']);
  const keyUrl = _.get(req, ['body', 'Metadata', 'key_url']);
  console.log('keyUrl', keyUrl);
  const result = await axios.get(keyUrl);
  console.log('result.data.signing_key', result.data.signing_key);
  //const reqBodyString = JSON.stringify(req.body).toString('UTF8');
  // const computedSignature = crypto.createHmac('SHA256', result.data.signing_key.toString('UTF8'))
  //   .update(Buffer.from(req.rawBody).toString('UTF8')) //rawBody????
  //   .digest('base64');
  const hash = crypto.createHash('sha256')
    .update(result.data.signing_key, "utf8")
    .digest('base64');
  const computedSignature = crypto.createHmac('sha256', Buffer.from(hash, 'base64'))
    .update(req.rawBody, "utf8")
    .digest('base64');
    
  console.log('computedSignature', computedSignature);
  console.log('x-content-signature', xSignature);
  //console.log('result.signing_key', result.signing_key);
  console.log(computedSignature === xSignature);
  res.status(200).json({ hello: "world" });
})

module.exports = router;
